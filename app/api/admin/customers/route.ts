import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { atomicBatch, guard } from '@/lib/atomic-db';

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = await request.json() as { action?: string; userId?: string; role?: 'customer' | 'admin'; points?: number; note?: string };
  if (!body.userId) return Response.json({ error: 'Thiếu tài khoản khách hàng.' }, { status: 400 });
  const db = getDb();
  const [customer] = await db.select().from(users).where(eq(users.id, body.userId)).limit(1);
  if (!customer) return Response.json({ error: 'Không tìm thấy tài khoản.' }, { status: 404 });
  if (body.action === 'role') {
    if (!['customer', 'admin'].includes(body.role || '')) return Response.json({ error: 'Vai trò không hợp lệ.' }, { status: 400 });
    if (body.userId === admin.userId && body.role !== 'admin') return Response.json({ error: 'Bạn không thể tự xóa quyền quản trị của chính mình.' }, { status: 409 });
    await db.update(users).set({ role: body.role!, updatedAt: Date.now() }).where(eq(users.id, body.userId));
    return Response.json({ status: 'updated' });
  }
  if (body.action === 'points') {
    const points = Number(body.points);
    const note = body.note?.trim() || '';
    if (!Number.isSafeInteger(points) || points === 0 || Math.abs(points) > 100000 || note.length < 5 || note.length > 300) return Response.json({ error: 'Nhập số điểm khác 0 và ghi rõ lý do điều chỉnh.' }, { status: 400 });
    const now = Date.now();
    try {
      await atomicBatch([
        guard('EXISTS (SELECT 1 FROM users WHERE id=? AND points_balance+?>=0)', [body.userId, points]),
        { sql: 'UPDATE users SET points_balance=points_balance+?,updated_at=? WHERE id=?', params: [points, now, body.userId] },
        { sql: "INSERT INTO point_transactions (id,user_id,type,points,note,request_key,created_at) VALUES (?,?,'adjust',?,?,?,?)", params: [crypto.randomUUID(), body.userId, points, note, crypto.randomUUID(), now] },
      ]);
    } catch { return Response.json({ error: 'Số dư điểm không đủ hoặc dữ liệu vừa thay đổi.' }, { status: 409 }); }
    return Response.json({ status: 'updated' });
  }
  return Response.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
}
