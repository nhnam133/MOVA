import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';

export function authConfigured() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY);
}

export function createAuthClient(cookieMethods: CookieMethodsServer) {
  if (!authConfigured()) throw new Error('MOVA_AUTH_NOT_CONFIGURED');
  return createServerClient(env.SUPABASE_URL!, env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: {
      name: 'mova-auth',
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: !env.SITE_URL?.startsWith('http://localhost:'),
    },
    cookies: cookieMethods,
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
    },
  });
}

export async function readAuthClient() {
  const jar = await cookies();
  // Middleware refreshes tokens before server rendering. Read-only components
  // must never silently rotate a refresh token without delivering its cookie.
  return createAuthClient({ getAll: () => jar.getAll() });
}
