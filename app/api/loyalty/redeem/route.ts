import { and, eq } from 'drizzle-orm';
import { getMovaUser } from '@/lib/auth';
import { getDb } from '@/db';
import { pointTransactions } from '@/db/schema';
import { atomicBatch, guard } from '@/lib/atomic-db';

export async function POST(request: Request) {
  const user = await getMovaUser();
  if (!user)
    return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const key = request.headers.get('idempotency-key');
  if (!key || key.length > 100)
    return Response.json(
      { error: 'Thiếu khóa xác nhận yêu cầu.' },
      { status: 400 },
    );
  const requestKey = user.userId + ':' + key;
  const existing = async () =>
    (
      await getDb()
        .select()
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.userId, user.userId),
            eq(pointTransactions.requestKey, requestKey),
          ),
        )
        .limit(1)
    )[0];
  if (await existing()) return Response.json({ status: 'already_processed' });
  const now = Date.now(),
    voucherId = crypto.randomUUID(),
    code =
      'MOVA' +
      crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  try {
    await atomicBatch([
      guard('EXISTS (SELECT 1 FROM users WHERE id=? AND points_balance>=100)', [
        user.userId,
      ]),
      {
        sql: 'UPDATE users SET points_balance=points_balance-100,updated_at=? WHERE id=?',
        params: [now, user.userId],
      },
      {
        sql: 'INSERT INTO vouchers (id,code,value,minimum_order_value,points_cost,expires_at,created_at) VALUES (?,?,20000,200000,100,?,?)',
        params: [voucherId, code, expiresAt, now],
      },
      {
        sql: 'INSERT INTO customer_vouchers (id,user_id,voucher_id,expires_at,created_at) VALUES (?,?,?,?,?)',
        params: [crypto.randomUUID(), user.userId, voucherId, expiresAt, now],
      },
      {
        sql: "INSERT INTO point_transactions (id,user_id,type,points,note,request_key,created_at) VALUES (?,?,'redeem',-100,?,?,?)",
        params: [
          crypto.randomUUID(),
          user.userId,
          'Đổi voucher ' + code,
          requestKey,
          now,
        ],
      },
    ]);
  } catch {
    if (await existing()) return Response.json({ status: 'already_processed' });
    return Response.json(
      {
        error:
          'Cần đủ 100 điểm. Nếu vừa có lỗi kết nối, điểm chưa bị trừ khi cấp voucher không thành công.',
      },
      { status: 409 },
    );
  }
  return Response.json({ status: 'created', code }, { status: 201 });
}
