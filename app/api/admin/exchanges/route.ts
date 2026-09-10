import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  exchangeRequests,
  exchangeItems,
  orderItems,
  productVariants,
} from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { atomicBatch, guard, type SqlCommand } from '@/lib/atomic-db';

export async function POST(request: Request) {
  if (!(await getAdminUser()))
    return Response.json(
      { error: 'Bạn không có quyền quản trị.' },
      { status: 403 },
    );
  let body: {
    id?: string;
    action?: string;
    replacementSku?: string;
    responsibility?: string;
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
  }
  if (!body || typeof body.id !== 'string')
    return Response.json({ error: 'Thiếu mã yêu cầu.' }, { status: 400 });
  const db = getDb(),
    now = Date.now();
  const [entry] = await db
    .select()
    .from(exchangeRequests)
    .where(eq(exchangeRequests.id, body.id))
    .limit(1);
  if (!entry)
    return Response.json({ error: 'Không tìm thấy yêu cầu.' }, { status: 404 });
  const [item] = await db
    .select({
      id: exchangeItems.id,
      quantity: exchangeItems.quantity,
      sku: exchangeItems.replacementSku,
      productId: orderItems.productId,
      color: orderItems.color,
    })
    .from(exchangeItems)
    .innerJoin(orderItems, eq(exchangeItems.orderItemId, orderItems.id))
    .where(eq(exchangeItems.exchangeRequestId, entry.id))
    .limit(1);
  if (!item)
    return Response.json(
      { error: 'Yêu cầu thiếu chi tiết sản phẩm, cần kiểm tra dữ liệu.' },
      { status: 409 },
    );
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  const commands: SqlCommand[] = [
    guard('EXISTS (SELECT 1 FROM exchange_requests WHERE id=? AND status=?)', [
      entry.id,
      entry.status,
    ]),
  ];
  let status: string;
  if (body.action === 'review' && entry.status === 'submitted')
    status = 'reviewing';
  else if (
    body.action === 'reject' &&
    ['submitted', 'reviewing'].includes(entry.status)
  ) {
    if (note.length < 5 || note.length > 2000)
      return Response.json(
        { error: 'Cần ghi rõ lý do từ chối.' },
        { status: 400 },
      );
    status = 'rejected';
    commands.push({
      sql: 'UPDATE exchange_requests SET admin_note=?,reviewed_at=? WHERE id=?',
      params: [note, now, entry.id],
    });
  } else if (
    body.action === 'approve' &&
    ['submitted', 'reviewing'].includes(entry.status)
  ) {
    if (
      !['seller', 'customer'].includes(body.responsibility ?? '') ||
      note.length < 5 ||
      note.length > 2000 ||
      typeof body.replacementSku !== 'string'
    )
      return Response.json(
        { error: 'Chọn SKU, bên chịu phí và ghi kết luận.' },
        { status: 400 },
      );
    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.sku, body.replacementSku))
      .limit(1);
    if (
      !variant ||
      !variant.active ||
      (entry.reason === 'wrong_size' &&
        (variant.productId !== item.productId || variant.color !== item.color))
    )
      return Response.json(
        { error: 'Đổi sai size phải giữ đúng sản phẩm và màu đã mua.' },
        { status: 400 },
      );
    commands.push(
      guard(
        'EXISTS (SELECT 1 FROM product_variants WHERE id=? AND active=1 AND stock-reserved_stock>=?)',
        [variant.id, item.quantity],
      ),
      {
        sql: 'UPDATE product_variants SET reserved_stock=reserved_stock+?,updated_at=? WHERE id=?',
        params: [item.quantity, now, variant.id],
      },
      {
        sql: 'UPDATE exchange_items SET replacement_sku=? WHERE id=?',
        params: [variant.sku, item.id],
      },
      {
        sql: 'UPDATE exchange_requests SET responsibility=?,admin_note=?,reviewed_at=? WHERE id=?',
        params: [body.responsibility!, note, now, entry.id],
      },
    );
    status = 'approved';
  } else if (
    body.action === 'ship' &&
    entry.status === 'approved' &&
    item.sku
  ) {
    commands.push(
      guard(
        'EXISTS (SELECT 1 FROM product_variants WHERE sku=? AND stock>=? AND reserved_stock>=?)',
        [item.sku, item.quantity, item.quantity],
      ),
      {
        sql: 'UPDATE product_variants SET stock=stock-?,reserved_stock=reserved_stock-?,updated_at=? WHERE sku=?',
        params: [item.quantity, item.quantity, now, item.sku],
      },
    );
    // Returned goods are not automatically put back on sale without a quality check.
    status = 'shipping';
  } else if (body.action === 'complete' && entry.status === 'shipping') {
    commands.push({
      sql: 'UPDATE exchange_requests SET completed_at=? WHERE id=?',
      params: [now, entry.id],
    });
    status = 'completed';
  } else
    return Response.json(
      { error: 'Trạng thái không cho phép thao tác này.' },
      { status: 409 },
    );
  commands.push({
    sql: 'UPDATE exchange_requests SET status=? WHERE id=?',
    params: [status, entry.id],
  });
  try {
    await atomicBatch(commands);
  } catch {
    return Response.json(
      { error: 'Tồn kho hoặc trạng thái vừa thay đổi; chưa áp dụng thao tác.' },
      { status: 409 },
    );
  }
  return Response.json({ status });
}
