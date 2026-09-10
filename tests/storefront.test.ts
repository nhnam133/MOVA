import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCart } from '../lib/cart-rules.ts';
import { requestJson } from '../lib/client-request.ts';

const catalog = [
  {
    slug: 'ao',
    variants: [
      { sku: 'A-M', stock: 3 },
      { sku: 'A-L', stock: 0 },
    ],
  },
];
test('cart rejects malformed, hidden, unavailable and fractional entries', () => {
  assert.deepEqual(
    sanitizeCart(
      [
        null,
        {},
        { productSlug: 'ao', sku: 'A-M', quantity: 1.5 },
        { productSlug: 'ao', sku: 'A-L', quantity: 1 },
        { productSlug: 'hidden', sku: 'A-M', quantity: 1 },
      ],
      catalog,
    ),
    [],
  );
  assert.deepEqual(sanitizeCart({}, catalog), []);
});
test('cart merges duplicate SKU and caps by available stock', () => {
  assert.deepEqual(
    sanitizeCart(
      [
        { productSlug: 'ao', sku: 'A-M', quantity: 2 },
        { productSlug: 'ao', sku: 'A-M', quantity: 2 },
      ],
      catalog,
    ),
    [{ productSlug: 'ao', sku: 'A-M', quantity: 3 }],
  );
});
test('failed connection returns actionable JSON, never leaves an unhandled rejection', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('offline');
  });
  const response = await requestJson('/api/orders', { method: 'POST' });
  assert.equal(response.status, 503);
  assert.match(
    ((await response.json()) as { error: string }).error,
    /lịch sử đơn/,
  );
});
test('expired session HTML cannot crash a form JSON handler', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('<html>Sign in</html>'),
  );
  assert.equal((await requestJson('/api/orders')).status, 503);
});
test('validation responses preserve server status and message', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Không đủ hàng' }, { status: 409 }),
  );
  const response = await requestJson('/api/orders');
  assert.equal(response.status, 409);
  assert.equal(
    ((await response.json()) as { error: string }).error,
    'Không đủ hàng',
  );
});
