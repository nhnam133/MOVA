import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { type MomoIpnPayload, verifyMomoIpn } from '@/lib/momo';

export async function POST(request: Request) {
  let payload: MomoIpnPayload;
  try { payload = await request.json() as MomoIpnPayload; } catch { return new Response(null, { status: 400 }); }
  if (!(await verifyMomoIpn(payload))) return new Response(null, { status: 401 });
  const db = getDb();
  const [order] = await db.select({ id: orders.id, total: orders.total }).from(orders).where(and(eq(orders.orderCode, payload.orderId), eq(orders.total, payload.amount))).limit(1);
  if (!order) return new Response(null, { status: 404 });
  await db.update(orders).set({ paymentStatus: payload.resultCode === 0 ? 'paid' : 'failed', momoTransactionId: String(payload.transId), updatedAt: Date.now() }).where(eq(orders.id, order.id));
  return new Response(null, { status: 204 });
}
