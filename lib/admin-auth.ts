import { env } from 'cloudflare:workers';
import { redirect } from 'next/navigation';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function getAdminUser() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const configuredEmail = env.MOVA_ADMIN_EMAIL?.trim().toLowerCase();
  const isLocalAdmin = user.email.toLowerCase() === 'seedy@sites.test';
  return isLocalAdmin || (configuredEmail && user.email.toLowerCase() === configuredEmail) ? user : null;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/tai-khoan');
  return user;
}
