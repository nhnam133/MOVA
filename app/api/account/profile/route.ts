import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { getMovaUser } from '@/lib/auth';
import { authResponseClient } from '@/lib/auth-response';
import { isSameOriginMutation } from '@/lib/auth-validation';

export async function POST(request: Request) {
  const user = await getMovaUser();
  if (!user) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  if (!isSameOriginMutation(request, env.SITE_URL)) return Response.json({ error: 'Yêu cầu không hợp lệ. Vui lòng tải lại trang.' }, { status: 403 });
  let body: { action?: string; fullName?: string; phone?: string; password?: string; confirmPassword?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  const { client, json } = await authResponseClient();
  if (body.action === 'profile') {
    const fullName = body.fullName?.trim() || ''; const phone = body.phone?.trim().replace(/[ .-]/g, '') || '';
    if (fullName.length < 2 || fullName.length > 100 || (phone && !/^0\d{8,10}$/.test(phone))) return json({ error: 'Họ tên phải có 2–100 ký tự; số điện thoại Việt Nam gồm 9–11 chữ số và bắt đầu bằng 0.' }, 400);
    const { error } = await client.auth.updateUser({ data: { full_name: fullName } });
    if (error) return json({ error: 'Chưa thể cập nhật hồ sơ. Vui lòng thử lại.' }, 503);
    await getDb().update(users).set({ fullName, phone: phone || null, updatedAt: Date.now() }).where(eq(users.id, user.userId));
    return json({ status: 'updated' });
  }
  if (body.action === 'password') {
    const password = body.password || '';
    if (password.length < 8 || password.length > 72 || password !== body.confirmPassword) return json({ error: 'Mật khẩu phải có 8–72 ký tự và hai lần nhập phải giống nhau.' }, 400);
    const { error } = await client.auth.updateUser({ password });
    if (error) return json({ error: error.code === 'same_password' ? 'Mật khẩu mới phải khác mật khẩu hiện tại.' : 'Chưa thể đổi mật khẩu. Vui lòng đăng nhập lại và thử lại.' }, 400);
    return json({ status: 'updated' });
  }
  return json({ error: 'Thao tác không hợp lệ.' }, 400);
}
