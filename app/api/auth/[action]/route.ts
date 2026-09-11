import { env } from 'cloudflare:workers';
import { authConfigured } from '@/lib/supabase-server';
import { authResponseClient } from '@/lib/auth-response';
import { ensureMovaProfile } from '@/lib/auth';
import {
  isSameOriginMutation,
  safeAuthReturnPath,
  validateAuth,
  type AuthFields,
} from '@/lib/auth-validation';
import { allowAuthAttempt } from '@/lib/auth-rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  const fail = (error: string, status: number) =>
    Response.json(
      { error },
      { status, headers: { 'Cache-Control': 'private, no-store' } },
    );
  if (!['login', 'register', 'logout'].includes(action))
    return fail('Không tìm thấy chức năng.', 404);
  if (!isSameOriginMutation(request, env.SITE_URL))
    return fail('Yêu cầu không hợp lệ. Vui lòng tải lại trang.', 403);
  if (!authConfigured())
    return fail(
      'Đăng nhập và đăng ký đang được thiết lập. Vui lòng quay lại sau.',
      503,
    );
  const { client, json } = await authResponseClient();
  try {
    if (action === 'logout') {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error)
        return json({ error: 'Chưa thể đăng xuất. Vui lòng thử lại.' }, 503);
      return json({ redirectTo: '/' });
    }
    if (!request.headers.get('content-type')?.includes('application/json'))
      return fail('Định dạng không hợp lệ.', 415);
    if (Number(request.headers.get('content-length') || 0) > 4096)
      return fail('Thông tin quá dài.', 413);
    const text = await request.text();
    if (text.length > 4096) return fail('Thông tin quá dài.', 413);
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text);
    } catch {
      return fail('Thông tin không hợp lệ.', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return fail('Thông tin không hợp lệ.', 400);
    const mode = action === 'register' ? 'register' : 'login';
    const field = (key: string) =>
      typeof body[key] === 'string' ? (body[key] as string) : '';
    const fields: AuthFields = {
      email: field('email'),
      password: field('password'),
      fullName: field('fullName'),
      confirmPassword: field('confirmPassword'),
    };
    const errors = validateAuth(fields, mode);
    if (Object.keys(errors).length)
      return json({ error: 'Vui lòng kiểm tra thông tin.', errors }, 400);
    if (!(await allowAuthAttempt(request, mode)))
      return json(
        { error: 'Bạn đã thử nhiều lần. Vui lòng đợi vài phút rồi thử lại.' },
        429,
      );
    const email = fields.email.trim().toLowerCase();
    if (mode === 'register') {
      if (!env.SITE_URL)
        return fail('Chưa thiết lập địa chỉ xác nhận tài khoản.', 503);
      const { data, error } = await client.auth.signUp({
        email,
        password: fields.password,
        options: {
          data: { full_name: fields.fullName.trim() },
          emailRedirectTo: `${new URL(env.SITE_URL).origin}/auth/confirm`,
        },
      });
      if (error)
        return json(
          {
            error:
              error.status === 429
                ? 'Gửi yêu cầu quá nhanh. Vui lòng đợi vài phút.'
                : error.code === 'weak_password'
                  ? 'Mật khẩu chưa đủ an toàn. Hãy chọn mật khẩu khác.'
                  : 'Chưa thể tạo tài khoản. Vui lòng thử lại hoặc đăng nhập nếu bạn đã đăng ký.',
          },
          error.status === 429 ? 429 : 400,
        );
      if (data.session && data.user) {
        await ensureMovaProfile(data.user);
        return json({ redirectTo: safeAuthReturnPath(body.returnTo) });
      }
      return json({
        message:
          'Nếu email có thể đăng ký, thư xác nhận sẽ được gửi đến hộp thư của bạn. Hãy kiểm tra cả thư rác, xác nhận email rồi quay lại đăng nhập.',
      });
    }
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: fields.password,
    });
    if (error || !data.user)
      return json(
        {
          error:
            error?.code === 'email_not_confirmed'
              ? 'Bạn cần xác nhận email trước khi đăng nhập. Hãy kiểm tra hộp thư và thư rác.'
              : 'Email hoặc mật khẩu không đúng, hoặc tài khoản chưa sẵn sàng.',
        },
        401,
      );
    await ensureMovaProfile(data.user);
    return json({ redirectTo: safeAuthReturnPath(body.returnTo) });
  } catch (error) {
    // Never log passwords, request bodies, access tokens, or provider responses.
    await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
    return json(
      {
        error:
          error instanceof Error && error.message === 'MOVA_LEGACY_ACCOUNT'
            ? 'Email này có dữ liệu tài khoản cũ. Vui lòng liên hệ HAUVIE để chuyển tài khoản an toàn.'
            : 'Dịch vụ tài khoản tạm thời chưa phản hồi. Vui lòng thử lại sau.',
      },
      503,
    );
  }
}
