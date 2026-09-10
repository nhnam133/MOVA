import { env } from 'cloudflare:workers';
import { and, eq, inArray } from 'drizzle-orm';
import { getMovaUser } from '@/lib/auth';
import { getDb } from '@/db';
import {
  exchangeItems,
  exchangeRequests,
  orderItems,
  orders,
  productVariants,
} from '@/db/schema';
import { atomicBatch, guard } from '@/lib/atomic-db';
import {
  cancelOrderCommands,
  earnPointsCommands,
} from '@/lib/commerce-commands';
import { isExchangeWindowOpen } from '@/lib/business-rules';

const activeExchangeStatuses = [
  'submitted',
  'reviewing',
  'approved',
  'shipping',
] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  const user = await getMovaUser();
  if (!user)
    return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const { orderCode } = await params;
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderCode, orderCode), eq(orders.userId, user.userId)))
    .limit(1);
  if (!order)
    return Response.json(
      { error: 'Không tìm thấy đơn hàng.' },
      { status: 404 },
    );
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    let body: { action?: string; receivedAt?: number };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
    }
    if (body?.action === 'cancel') {
      try {
        await atomicBatch(cancelOrderCommands(order.id, Date.now()));
      } catch {
        return Response.json(
          {
            error:
              'Chỉ được tự hủy đơn COD chờ xác nhận. Vui lòng tải lại để xem trạng thái mới.',
          },
          { status: 409 },
        );
      }
      return Response.json({ status: 'cancelled' });
    }
    if (body?.action === 'receive') {
      const now = Date.now(),
        receivedAt = body.receivedAt;
      if (
        !Number.isSafeInteger(receivedAt) ||
        receivedAt! < order.createdAt ||
        receivedAt! > now
      )
        return Response.json(
          {
            error:
              'Vui lòng nhập thời điểm thực tế nhận hàng, không trước ngày đặt hoặc trong tương lai.',
          },
          { status: 400 },
        );
      try {
        await atomicBatch([
          guard(
            "EXISTS (SELECT 1 FROM orders WHERE id=? AND status='shipping')",
            [order.id],
          ),
          {
            sql: "UPDATE orders SET status='completed',delivered_at=?,completed_at=?,updated_at=? WHERE id=?",
            params: [receivedAt!, now, now, order.id],
          },
          ...earnPointsCommands(order.id, now),
        ]);
      } catch {
        return Response.json(
          { error: 'Trạng thái đơn vừa thay đổi. Vui lòng tải lại.' },
          { status: 409 },
        );
      }
      return Response.json({ status: 'completed' });
    }
    return Response.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
  }

  const data = await request.formData();
  const field = (name: string) => {
    const entry = data.get(name);
    return typeof entry === 'string' ? entry.trim() : '';
  };
  if (field('action') !== 'exchange')
    return Response.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
  if (
    !isExchangeWindowOpen(order.deliveredAt, Date.now()) ||
    order.status === 'cancelled'
  )
    return Response.json(
      { error: 'EXCHANGE_EXPIRED: Đơn đã quá thời hạn đổi 72 giờ.' },
      { status: 409 },
    );
  const reason = field('reason') as
    | 'wrong_size'
    | 'defective'
    | 'wrong_item'
    | 'other';
  const description = field('description');
  const orderItemId = field('orderItemId');
  const replacementSku = field('replacementSku');
  const quantity = Number(field('quantity'));
  if (
    !['wrong_size', 'defective', 'wrong_item', 'other'].includes(reason) ||
    description.length < 5 ||
    !Number.isInteger(quantity) ||
    quantity < 1
  )
    return Response.json(
      { error: 'Thông tin yêu cầu đổi chưa hợp lệ.' },
      { status: 400 },
    );
  const [item] = await db
    .select()
    .from(orderItems)
    .where(
      and(eq(orderItems.id, orderItemId), eq(orderItems.orderId, order.id)),
    )
    .limit(1);
  if (!item || quantity > item.quantity)
    return Response.json(
      { error: 'Sản phẩm hoặc số lượng đổi không hợp lệ.' },
      { status: 400 },
    );
  const existing = await db
    .select({ requestId: exchangeRequests.id })
    .from(exchangeRequests)
    .innerJoin(
      exchangeItems,
      eq(exchangeItems.exchangeRequestId, exchangeRequests.id),
    )
    .where(
      and(
        eq(exchangeRequests.orderId, order.id),
        eq(exchangeItems.orderItemId, item.id),
        inArray(exchangeRequests.status, [...activeExchangeStatuses]),
      ),
    )
    .limit(1);
  if (existing.length)
    return Response.json(
      { error: 'Sản phẩm này đã có một yêu cầu đổi đang xử lý.' },
      { status: 409 },
    );
  if (replacementSku) {
    const [replacement] = await db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.sku, replacementSku),
          eq(productVariants.active, true),
        ),
      )
      .limit(1);
    if (
      !replacement ||
      replacement.stock - replacement.reservedStock < quantity
    )
      return Response.json(
        { error: 'SKU thay thế không còn đủ tồn kho.' },
        { status: 409 },
      );
    if (
      reason === 'wrong_size' &&
      (replacement.color !== item.color ||
        replacement.productId !== item.productId)
    )
      return Response.json(
        { error: 'Đổi size chỉ áp dụng cùng mẫu và cùng màu.' },
        { status: 400 },
      );
  } else if (reason === 'wrong_size')
    return Response.json(
      { error: 'Vui lòng chọn size/SKU thay thế còn hàng.' },
      { status: 400 },
    );
  const files = data
    .getAll('evidence')
    .filter((file): file is File => file instanceof File && file.size > 0);
  if ((reason === 'defective' || reason === 'wrong_item') && files.length === 0)
    return Response.json(
      {
        error:
          'EVIDENCE_REQUIRED: Hàng lỗi hoặc giao nhầm cần ít nhất một ảnh.',
      },
      { status: 400 },
    );
  if (files.length > 5)
    return Response.json(
      { error: 'Tối đa 5 ảnh minh chứng.' },
      { status: 400 },
    );
  for (const file of files)
    if (
      !['image/avif', 'image/jpeg', 'image/png', 'image/webp'].includes(
        file.type,
      ) ||
      file.size > 5 * 1024 * 1024
    )
      return Response.json(
        { error: 'Mỗi ảnh phải là AVIF/JPG/PNG/WebP và không quá 5MB.' },
        { status: 400 },
      );
  const requestId = crypto.randomUUID(),
    now = Date.now(),
    requestCode =
      'DX' +
      now.toString(36).toUpperCase() +
      crypto.randomUUID().slice(0, 5).toUpperCase();
  const uploads: { key: string; id: string }[] = [];
  try {
    for (const file of files) {
      const key = `exchange-evidence/${user.userId}/${requestId}/${crypto.randomUUID()}`;
      await env.FILES.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });
      uploads.push({ key, id: crypto.randomUUID() });
    }
    await atomicBatch([
      guard(
        "EXISTS (SELECT 1 FROM orders WHERE id=? AND user_id=? AND status IN ('delivered','completed') AND delivered_at IS NOT NULL AND delivered_at<=? AND delivered_at>=?)",
        [order.id, user.userId, now, now - 72 * 60 * 60 * 1000],
      ),
      guard(
        "NOT EXISTS (SELECT 1 FROM exchange_requests r JOIN exchange_items i ON i.exchange_request_id=r.id WHERE i.order_item_id=? AND r.status IN ('submitted','reviewing','approved','shipping'))",
        [item.id],
      ),
      {
        sql: 'INSERT INTO exchange_requests (id,request_code,order_id,user_id,reason,description,requested_at) VALUES (?,?,?,?,?,?,?)',
        params: [
          requestId,
          requestCode,
          order.id,
          user.userId,
          reason,
          description,
          now,
        ],
      },
      {
        sql: 'INSERT INTO exchange_items (id,exchange_request_id,order_item_id,replacement_sku,quantity) VALUES (?,?,?,?,?)',
        params: [
          crypto.randomUUID(),
          requestId,
          item.id,
          replacementSku || null,
          quantity,
        ],
      },
      ...uploads.map((upload) => ({
        sql: 'INSERT INTO exchange_evidence (id,exchange_request_id,object_key,created_at) VALUES (?,?,?,?)',
        params: [upload.id, requestId, upload.key, now],
      })),
    ]);
  } catch {
    await Promise.allSettled(
      uploads.map((upload) => env.FILES.delete(upload.key)),
    );
    return Response.json(
      {
        error:
          'Không gửi được yêu cầu: kiểm tra thời hạn 72 giờ hoặc yêu cầu trùng đang xử lý. Ảnh mới tải của lần gửi lỗi đã được dọn.',
      },
      { status: 409 },
    );
  }
  return Response.json({ status: 'created', requestCode }, { status: 201 });
}
