import { NextResponse, type NextRequest } from 'next/server';
import { authConfigured, createAuthClient } from '@/lib/supabase-server';
import { isSameOriginMutation } from '@/lib/auth-validation';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/assets/') ||
    path.startsWith('/products/') ||
    /\.(svg|png|jpg|jpeg|gif|webp|avif|woff|woff2|ico)$/.test(path)
  )
    return NextResponse.next();
  if (
    path.startsWith('/api/') &&
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
    path !== '/api/momo/ipn'
  ) {
    if (!isSameOriginMutation(request))
      return NextResponse.json(
        { error: 'Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.' },
        { status: 403 },
      );
  }
  let response = NextResponse.next({ request });
  // Catalog images are immutable public files; do not refresh auth on images.
  if (
    path === '/api/files' &&
    request.nextUrl.searchParams.get('key')?.startsWith('products/')
  )
    return response;
  response.headers.set('Cache-Control', 'private, no-store');
  if (
    !authConfigured() ||
    !request.cookies
      .getAll()
      .some(({ name }) => name === 'mova-auth' || name.startsWith('mova-auth.'))
  )
    return response;
  const client = createAuthClient({
    getAll: () => request.cookies.getAll(),
    setAll(values, cacheHeaders) {
      values.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      values.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options),
      );
      Object.entries(cacheHeaders).forEach(([name, value]) =>
        response.headers.set(name, value),
      );
      response.headers.set('Cache-Control', 'private, no-store');
    },
  });
  await client.auth.getClaims();
  return response;
}

export const config = { matcher: ['/:path*'] };
