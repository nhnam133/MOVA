import { and, eq } from 'drizzle-orm';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { customerVouchers, pointTransactions, users, vouchers } from '@/db/schema';

export async function POST(request: Request) {
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const requestKey = request.headers.get('idempotency-key'); if (!requestKey || requestKey.length > 100) return Response.json({ error: 'Thiếu khóa xác nhận yêu cầu.' }, { status: 400 });
  const db = getDb(); const [existing] = await db.select().from(pointTransactions).where(and(eq(pointTransactions.userId, user.userId), eq(pointTransactions.requestKey, requestKey))).limit(1);
  if (existing) return Response.json({ status: 'already_processed' });
  const [profile] = await db.select().from(users).where(eq(users.id, user.userId)).limit(1); if (!profile || profile.pointsBalance < 100) return Response.json({ error: 'Bạn cần đủ 100 điểm để đổi voucher.' }, { status: 409 });
  const now = Date.now(); const voucherId = crypto.randomUUID(); const code = `MOVA${now.toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`; const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  const changed = await db.update(users).set({ pointsBalance: profile.pointsBalance - 100, updatedAt: now }).where(and(eq(users.id, user.userId), eq(users.pointsBalance, profile.pointsBalance))).returning({ id: users.id });
  if (!changed.length) return Response.json({ error: 'Số điểm vừa thay đổi, vui lòng thử lại.' }, { status: 409 });
  try { await db.insert(vouchers).values({ id: voucherId, code, value: 20_000, minimumOrderValue: 200_000, pointsCost: 100, expiresAt, createdAt: now }); await db.insert(customerVouchers).values({ id: crypto.randomUUID(), userId: user.userId, voucherId, expiresAt, createdAt: now }); await db.insert(pointTransactions).values({ id: crypto.randomUUID(), userId: user.userId, type: 'redeem', points: -100, note: `Đổi voucher ${code}`, requestKey, createdAt: now }); }
  catch { await db.update(users).set({ pointsBalance: profile.pointsBalance, updatedAt: Date.now() }).where(eq(users.id, user.userId)); return Response.json({ error: 'Không thể cấp voucher, điểm của bạn đã được giữ nguyên.' }, { status: 500 }); }
  return Response.json({ status: 'created', code }, { status: 201 });
}
