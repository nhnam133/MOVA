import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { authConfigured } from '@/lib/supabase-server';
import { authResponseClient } from '@/lib/auth-response';
import { ensureMovaProfile } from '@/lib/auth';

export async function GET(request: Request) {
  const destination = new URL('/tai-khoan', env.SITE_URL || request.url);
  if (!authConfigured()) return NextResponse.redirect(destination);
  const { client, redirect } = await authResponseClient();
  const code = new URL(request.url).searchParams.get('code');
  try {
    if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        await ensureMovaProfile(data.user);
        return redirect(destination);
      }
    }
  } catch {
    /* Keep provider details private; users may still sign in after confirming email. */
  }
  await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
  destination.searchParams.set('confirmation', 'check');
  return redirect(destination);
}
