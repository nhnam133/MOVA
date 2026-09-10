import { env } from 'cloudflare:workers';
import { redirect } from 'next/navigation';
import { getMovaUser } from '@/lib/auth';

export async function getAdminUser() {
  const user = await getMovaUser();
  if (!user) return null;
  return env.MOVA_ADMIN_AUTH_ID && user.authId === env.MOVA_ADMIN_AUTH_ID
    ? user
    : null;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/tai-khoan');
  return user;
}
