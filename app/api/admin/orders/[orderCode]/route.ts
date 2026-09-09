import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { customerVouchers, orderItems, orders, pointTransactions, productVariants, users } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';

async function awardPoints(orderId: string) {
  const db = getDb(); const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1); if (!order || order.status !== 'completed' || order.paymentStatus !== 'paid' || order.pointsEarned <= 0) return;
  const [existing] = await db.select({ id: pointTransactions.id }).from(pointTransactions).where(and(eq(pointTransactions.orderId, order.id), eq(pointTransactions.type, 'earn'))).limit(1); if (existing) return;
  try { await db.insert(pointTransactions).values({ id: crypto.randomUUID(), userId: order.userId, orderId: order.id, type: 'earn', points: order.pointsEarned, note: `Điểm từ đơn ${order.orderCode}`, createdAt: Date.now() }); await db.update(users).set({ pointsBalance: sql`${users.pointsBalance} + ${order.pointsEarned}`, updatedAt: Date.now() }).where(eq(users.id, order.userId)); } catch { /* unique index prevents duplicate awards */ }
}

export async function POST(request: Request, { params }: { params: Promise<{ orderCode: string }> }) {
  const admin = await getAdminUser(); if (!admin) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const { action } = await request.json() as { action?: string }; const { orderCode } = await params; const db = getDb(); const [order] = await db.select().from(orders).where(eq(orders.orderCode, orderCode)).limit(1); if (!order) return Response.json({ error: 'Không tìm thấy đơn.' }, { status: 404 }); const now = Date.now();
  if (action === 'confirm' && order.status === 'pending') { await db.update(orders).set({ status: 'confirmed', updatedAt: now }).where(and(eq(orders.id, order.id), eq(orders.status, 'pending'))); await db.update(customerVouchers).set({ status: 'used' }).where(and(eq(customerVouchers.orderId, order.id), eq(customerVouchers.status, 'reserved'))); return Response.json({ status: 'confirmed' }); }
  if (action === 'ship' && order.status === 'confirmed') { const items = await db.select({ variantId: orderItems.variantId, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, order.id)); for (const item of items) if (item.variantId) { const changed = await db.update(productVariants).set({ stock: sql`${productVariants.stock} - ${item.quantity}`, reservedStock: sql`${productVariants.reservedStock} - ${item.quantity}`, updatedAt: now }).where(and(eq(productVariants.id, item.variantId), sql`${productVariants.stock} >= ${item.quantity}`, sql`${productVariants.reservedStock} >= ${item.quantity}`)).returning({ id: productVariants.id }); if (!changed.length) return Response.json({ error: 'Tồn kho/giữ hàng không còn nhất quán.' }, { status: 409 }); } await db.update(orders).set({ status: 'shipping', updatedAt: now }).where(and(eq(orders.id, order.id), eq(orders.status, 'confirmed'))); return Response.json({ status: 'shipping' }); }
  if (action === 'complete' && order.status === 'shipping') { await db.update(orders).set({ status: 'completed', deliveredAt: now, completedAt: now, updatedAt: now }).where(and(eq(orders.id, order.id), eq(orders.status, 'shipping'))); await awardPoints(order.id); return Response.json({ status: 'completed' }); }
  if (action === 'collect' && order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && order.status !== 'cancelled') { await db.update(orders).set({ paymentStatus: 'paid', updatedAt: now }).where(and(eq(orders.id, order.id), eq(orders.paymentStatus, order.paymentStatus))); await awardPoints(order.id); return Response.json({ status: 'paid' }); }
  return Response.json({ error: 'Chuyển trạng thái không hợp lệ.' }, { status: 409 });
}
