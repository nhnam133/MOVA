import { env } from 'cloudflare:workers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { getMovaUser } from '@/lib/auth';

export async function getAdminUser() {
  const user = await getMovaUser();
  if (!user) return null;
  if (env.MOVA_ADMIN_AUTH_ID && user.authId === env.MOVA_ADMIN_AUTH_ID)
    return user;
  const [profile] = await getDb()
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);
  return profile?.role === 'admin' ? user : null;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/tai-khoan');
  return user;
}
