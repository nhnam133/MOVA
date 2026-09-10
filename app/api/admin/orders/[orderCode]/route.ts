import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { atomicBatch, guard, type SqlCommand } from '@/lib/atomic-db';
import { earnPointsCommands, shipOrderCommands } from '@/lib/commerce-commands';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  if (!(await getAdminUser()))
    return Response.json(
      { error: 'Bạn không có quyền quản trị.' },
      { status: 403 },
    );
  let body: { action?: string; receivedAt?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
  }
  const { orderCode } = await params;
  const [order] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.orderCode, orderCode))
    .limit(1);
  if (!order)
    return Response.json({ error: 'Không tìm thấy đơn.' }, { status: 404 });
  const now = Date.now();
  let commands: SqlCommand[] = [],
    status = '';
  if (body?.action === 'confirm' && order.status === 'pending') {
    if (order.paymentMethod === 'momo' && order.paymentStatus !== 'paid')
      return Response.json(
        {
          error:
            'MoMo chưa xác nhận đã thanh toán, chưa được xác nhận giao hàng.',
        },
        { status: 409 },
      );
    commands = [
      guard(
        "EXISTS (SELECT 1 FROM orders WHERE id=? AND status='pending' AND (payment_method='cod' OR payment_status='paid'))",
        [order.id],
      ),
      {
        sql: "UPDATE orders SET status='confirmed',updated_at=? WHERE id=?",
        params: [now, order.id],
      },
      {
        sql: "UPDATE customer_vouchers SET status='used' WHERE order_id=? AND status='reserved'",
        params: [order.id],
      },
    ];
    status = 'confirmed';
  } else if (body?.action === 'ship' && order.status === 'confirmed') {
    commands = shipOrderCommands(order.id, now);
    status = 'shipping';
  } else if (body?.action === 'complete' && order.status === 'shipping') {
    const receivedAt = body.receivedAt;
    if (
      !Number.isSafeInteger(receivedAt) ||
      receivedAt! < order.createdAt ||
      receivedAt! > now
    )
      return Response.json(
        {
          error:
            'Nhập thời điểm khách thực tế nhận hàng, không trước ngày đặt hoặc trong tương lai.',
        },
        { status: 400 },
      );
    commands = [
      guard("EXISTS (SELECT 1 FROM orders WHERE id=? AND status='shipping')", [
        order.id,
      ]),
      {
        sql: "UPDATE orders SET status='completed',delivered_at=?,completed_at=?,updated_at=? WHERE id=?",
        params: [receivedAt!, now, now, order.id],
      },
      ...earnPointsCommands(order.id, now),
    ];
    status = 'completed';
  } else if (
    body?.action === 'collect' &&
    order.paymentMethod === 'cod' &&
    ['shipping', 'completed'].includes(order.status) &&
    order.paymentStatus !== 'paid'
  ) {
    commands = [
      guard(
        "EXISTS (SELECT 1 FROM orders WHERE id=? AND payment_method='cod' AND status IN ('shipping','completed') AND payment_status<>'paid')",
        [order.id],
      ),
      {
        sql: "UPDATE orders SET payment_status='paid',updated_at=? WHERE id=?",
        params: [now, order.id],
      },
      ...earnPointsCommands(order.id, now),
    ];
    status = 'paid';
  } else
    return Response.json(
      { error: 'Thao tác không phù hợp trạng thái đơn hiện tại.' },
      { status: 409 },
    );
  try {
    await atomicBatch(commands);
  } catch {
    return Response.json(
      {
        error:
          'Trạng thái hoặc tồn kho vừa thay đổi. Chưa áp dụng thao tác; vui lòng tải lại.',
      },
      { status: 409 },
    );
  }
  return Response.json({ status });
}
