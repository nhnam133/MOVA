import { env } from 'cloudflare:workers';

/** Bounded, atomic fixed-window throttling; neither emails nor IPs are stored. */
export async function allowAuthAttempt(
  request: Request,
  mode: 'login' | 'register',
) {
  const ip = request.headers.get('cf-connecting-ip') || 'local-or-unknown';
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${mode}:${ip}`),
  );
  const id = Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  const now = Date.now();
  const windowMs = mode === 'register' ? 600000 : 60000;
  await env.DB.prepare(
    'DELETE FROM auth_rate_limits WHERE id IN (SELECT id FROM auth_rate_limits WHERE expires_at < ? LIMIT 50)',
  )
    .bind(now - 86400000)
    .run();
  const result =
    await env.DB.prepare(`INSERT INTO auth_rate_limits (id, attempts, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(id) DO UPDATE SET attempts = CASE WHEN expires_at <= ? THEN 1 ELSE attempts + 1 END,
    expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`)
      .bind(id, now + windowMs, now, now)
      .first<{ attempts: number }>();
  return Boolean(result && result.attempts <= (mode === 'register' ? 5 : 15));
}
