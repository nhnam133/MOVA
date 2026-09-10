import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import type { User } from '@supabase/supabase-js';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { authConfigured, readAuthClient } from '@/lib/supabase-server';
import { safeAuthReturnPath } from '@/lib/auth-validation';

export type MovaUser = {
  userId: string;
  authId: string;
  email: string;
  fullName: string | null;
  displayName: string;
};

export async function ensureMovaProfile(identity: User): Promise<MovaUser> {
  if (!identity.email || !identity.email_confirmed_at)
    throw new Error('MOVA_EMAIL_NOT_CONFIRMED');
  const db = getDb();
  const email = identity.email.trim().toLowerCase();
  let userId = `sb:${identity.id}`;
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing && existing.id !== userId) {
    // Only the explicitly configured administrator UID may retain their legacy
    // profile. A public registration must never claim another account by email.
    if (
      identity.id !== env.MOVA_ADMIN_AUTH_ID ||
      email !== env.MOVA_ADMIN_EMAIL?.trim().toLowerCase()
    )
      throw new Error('MOVA_LEGACY_ACCOUNT');
    userId = existing.id;
  }
  const name =
    typeof identity.user_metadata?.full_name === 'string'
      ? identity.user_metadata.full_name.trim().slice(0, 100)
      : null;
  const now = Date.now();
  if (!existing)
    await db
      .insert(users)
      .values({
        id: userId,
        email,
        fullName: name,
        role: 'customer',
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  return {
    userId,
    authId: identity.id,
    email,
    fullName: name,
    displayName: name || email,
  };
}

export const getMovaUser = cache(async (): Promise<MovaUser | null> => {
  if (!authConfigured()) return null;
  const jar = await cookies();
  if (
    !jar
      .getAll()
      .some(({ name }) => name === 'mova-auth' || name.startsWith('mova-auth.'))
  )
    return null;
  const client = await readAuthClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email_confirmed_at) return null;
  return ensureMovaProfile(data.user);
});

export function movaSignInPath(returnTo: string) {
  return `/tai-khoan?return_to=${encodeURIComponent(safeAuthReturnPath(returnTo))}`;
}

export async function requireMovaUser(returnTo: string): Promise<MovaUser> {
  const user = await getMovaUser();
  if (user) return user;
  redirect(movaSignInPath(returnTo));
}
