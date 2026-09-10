import { and, eq, ne } from 'drizzle-orm';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import {
  type MomoIpnPayload,
  verifyMomoIpn,
  isMomoConfigured,
} from '@/lib/momo';

export async function POST(request: Request) {
  if (!isMomoConfigured()) return new Response(null, { status: 503 });
  let payload: MomoIpnPayload;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (
    !payload ||
    typeof payload.signature !== 'string' ||
    !Number.isSafeInteger(payload.amount) ||
    !Number.isInteger(payload.resultCode) ||
    !(await verifyMomoIpn(payload))
  )
    return new Response(null, { status: 401 });
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.orderCode, payload.orderId),
        eq(orders.total, payload.amount),
        eq(orders.paymentMethod, 'momo'),
        eq(orders.momoRequestId, payload.requestId),
      ),
    )
    .limit(1);
  if (!order) return new Response(null, { status: 404 });
  // A delayed failed notification must never overwrite a confirmed payment.
  if (order.paymentStatus === 'paid' || order.paymentStatus === 'manual_refund')
    return new Response(null, { status: 204 });
  await db
    .update(orders)
    .set({
      paymentStatus: payload.resultCode === 0 ? 'paid' : 'failed',
      momoTransactionId: String(payload.transId),
      updatedAt: Date.now(),
    })
    .where(
      and(
        eq(orders.id, order.id),
        ne(orders.paymentStatus, 'paid'),
        ne(orders.paymentStatus, 'manual_refund'),
      ),
    );
  return new Response(null, { status: 204 });
}
