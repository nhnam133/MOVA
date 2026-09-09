import { env } from 'cloudflare:workers';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { customerVouchers, exchangeEvidence, exchangeItems, exchangeRequests, orderItems, orders, pointTransactions, productVariants, users } from '@/db/schema';
import { isExchangeWindowOpen } from '@/lib/business-rules';

const activeExchangeStatuses = ['submitted', 'reviewing', 'approved', 'shipping'] as const;

export async function POST(request: Request, { params }: { params: Promise<{ orderCode: string }> }) {
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const { orderCode } = await params; const db = getDb(); const [order] = await db.select().from(orders).where(and(eq(orders.orderCode, orderCode), eq(orders.userId, user.userId))).limit(1);
  if (!order) return Response.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 });
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = await request.json() as { action?: string };
    if (body.action === 'cancel') {
      if (order.paymentMethod !== 'cod' || order.status !== 'pending') return Response.json({ error: 'Chỉ được tự hủy đơn COD khi còn chờ xác nhận.' }, { status: 409 });
      const changed = await db.update(orders).set({ status: 'cancelled', cancelledAt: Date.now(), updatedAt: Date.now() }).where(and(eq(orders.id, order.id), eq(orders.status, 'pending'))).returning({ id: orders.id });
      if (!changed.length) return Response.json({ error: 'Trạng thái đơn vừa thay đổi, vui lòng tải lại.' }, { status: 409 });
      const items = await db.select({ variantId: orderItems.variantId, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, order.id));
      for (const item of items) if (item.variantId) await db.update(productVariants).set({ reservedStock: sql`MAX(0, ${productVariants.reservedStock} - ${item.quantity})`, updatedAt: Date.now() }).where(eq(productVariants.id, item.variantId));
      await db.update(customerVouchers).set({ status: 'available', orderId: null }).where(and(eq(customerVouchers.orderId, order.id), eq(customerVouchers.status, 'reserved')));
      return Response.json({ status: 'cancelled' });
    }
    if (body.action === 'receive') {
      if (order.status !== 'shipping') return Response.json({ error: 'Đơn chưa ở trạng thái đang giao.' }, { status: 409 });
      const now = Date.now(); const changed = await db.update(orders).set({ status: 'completed', deliveredAt: now, completedAt: now, updatedAt: now }).where(and(eq(orders.id, order.id), eq(orders.status, 'shipping'))).returning({ id: orders.id });
      if (!changed.length) return Response.json({ error: 'Trạng thái đơn vừa thay đổi, vui lòng tải lại.' }, { status: 409 });
      if (order.paymentStatus === 'paid' && order.pointsEarned > 0) { try { await db.insert(pointTransactions).values({ id: crypto.randomUUID(), userId: order.userId, orderId: order.id, type: 'earn', points: order.pointsEarned, note: `Điểm từ đơn ${order.orderCode}`, createdAt: now }); await db.update(users).set({ pointsBalance: sql`${users.pointsBalance} + ${order.pointsEarned}`, updatedAt: now }).where(eq(users.id, order.userId)); } catch { /* unique source prevents duplicate award */ } }
      return Response.json({ status: 'completed' });
    }
    return Response.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
  }

  const data = await request.formData();
  const field = (name: string) => { const entry = data.get(name); return typeof entry === 'string' ? entry.trim() : ''; };
  if (field('action') !== 'exchange') return Response.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
  if (!isExchangeWindowOpen(order.deliveredAt, Date.now()) || order.status === 'cancelled') return Response.json({ error: 'EXCHANGE_EXPIRED: Đơn đã quá thời hạn đổi 72 giờ.' }, { status: 409 });
  const reason = field('reason') as 'wrong_size' | 'defective' | 'wrong_item' | 'other'; const description = field('description'); const orderItemId = field('orderItemId'); const replacementSku = field('replacementSku'); const quantity = Number(field('quantity'));
  if (!['wrong_size', 'defective', 'wrong_item', 'other'].includes(reason) || description.length < 5 || !Number.isInteger(quantity) || quantity < 1) return Response.json({ error: 'Thông tin yêu cầu đổi chưa hợp lệ.' }, { status: 400 });
  const [item] = await db.select().from(orderItems).where(and(eq(orderItems.id, orderItemId), eq(orderItems.orderId, order.id))).limit(1);
  if (!item || quantity > item.quantity) return Response.json({ error: 'Sản phẩm hoặc số lượng đổi không hợp lệ.' }, { status: 400 });
  const existing = await db.select({ requestId: exchangeRequests.id }).from(exchangeRequests).innerJoin(exchangeItems, eq(exchangeItems.exchangeRequestId, exchangeRequests.id)).where(and(eq(exchangeRequests.orderId, order.id), eq(exchangeItems.orderItemId, item.id), inArray(exchangeRequests.status, [...activeExchangeStatuses]))).limit(1);
  if (existing.length) return Response.json({ error: 'Sản phẩm này đã có một yêu cầu đổi đang xử lý.' }, { status: 409 });
  if (replacementSku) {
    const [replacement] = await db.select().from(productVariants).where(and(eq(productVariants.sku, replacementSku), eq(productVariants.active, true))).limit(1);
    if (!replacement || replacement.stock < quantity) return Response.json({ error: 'SKU thay thế không còn đủ tồn kho.' }, { status: 409 });
    if (reason === 'wrong_size' && (replacement.color !== item.color || !replacement.sku.startsWith(`${item.productCode}-`))) return Response.json({ error: 'Đổi size chỉ áp dụng cùng mẫu và cùng màu.' }, { status: 400 });
  } else if (reason === 'wrong_size') return Response.json({ error: 'Vui lòng chọn size/SKU thay thế còn hàng.' }, { status: 400 });
  const files = data.getAll('evidence').filter((file): file is File => file instanceof File && file.size > 0);
  if ((reason === 'defective' || reason === 'wrong_item') && files.length === 0) return Response.json({ error: 'EVIDENCE_REQUIRED: Hàng lỗi hoặc giao nhầm cần ít nhất một ảnh.' }, { status: 400 });
  if (files.length > 5) return Response.json({ error: 'Tối đa 5 ảnh minh chứng.' }, { status: 400 });
  for (const file of files) if (!['image/avif', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return Response.json({ error: 'Mỗi ảnh phải là AVIF/JPG/PNG/WebP và không quá 5MB.' }, { status: 400 });
  const requestId = crypto.randomUUID(); const now = Date.now(); const requestCode = `DX${now.toString().slice(-9)}`;
  await db.insert(exchangeRequests).values({ id: requestId, requestCode, orderId: order.id, userId: user.userId, reason, description, requestedAt: now });
  await db.insert(exchangeItems).values({ id: crypto.randomUUID(), exchangeRequestId: requestId, orderItemId: item.id, replacementSku: replacementSku || null, quantity });
  for (const file of files) { const key = `exchange-evidence/${user.userId}/${requestId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`; await env.FILES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } }); await db.insert(exchangeEvidence).values({ id: crypto.randomUUID(), exchangeRequestId: requestId, objectKey: key, createdAt: now }); }
  return Response.json({ status: 'created', requestCode }, { status: 201 });
}
