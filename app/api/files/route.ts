import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { exchangeEvidence, exchangeRequests } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key');
  if (!key || key.includes('..'))
    return new Response('Invalid key', { status: 400 });
  const isPublicProduct = key.startsWith('products/');
  if (!isPublicProduct) {
    const user = await getChatGPTUser();
    if (!user) return new Response('Unauthorized', { status: 401 });
    const admin = await getAdminUser();
    if (!admin) {
      const [requestRow] = await getDb()
        .select({ userId: exchangeRequests.userId })
        .from(exchangeEvidence)
        .innerJoin(
          exchangeRequests,
          eq(exchangeEvidence.exchangeRequestId, exchangeRequests.id),
        )
        .where(eq(exchangeEvidence.objectKey, key))
        .limit(1);
      if (!requestRow || requestRow.userId !== user.userId)
        return new Response('Forbidden', { status: 403 });
    }
  }
  const object = await env.FILES.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('x-content-type-options', 'nosniff');
  headers.set(
    'cache-control',
    isPublicProduct
      ? 'public, max-age=31536000, immutable'
      : 'private, no-store',
  );
  return new Response(object.body, { headers });
}
