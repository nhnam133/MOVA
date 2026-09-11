import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { cartItems, productVariants, products } from '@/db/schema';
import { getMovaUser } from '@/lib/auth';
import { sanitizeCart, type StoredCartItem } from '@/lib/cart-rules';
import { getCatalogProducts } from '@/lib/catalog-server';

export async function GET() {
  const user = await getMovaUser();
  if (!user) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const rows = await getDb().select({ productSlug: products.slug, sku: productVariants.sku, quantity: cartItems.quantity }).from(cartItems).innerJoin(productVariants, eq(cartItems.variantId, productVariants.id)).innerJoin(products, eq(productVariants.productId, products.id)).where(eq(cartItems.userId, user.userId));
  return Response.json({ items: sanitizeCart(rows, await getCatalogProducts()) });
}

export async function PUT(request: Request) {
  const user = await getMovaUser();
  if (!user) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  let body: { items?: StoredCartItem[] };
  try { body = await request.json(); } catch { return Response.json({ error: 'Giỏ hàng không hợp lệ.' }, { status: 400 }); }
  const items = sanitizeCart(body.items, await getCatalogProducts()).slice(0, 50);
  const db = getDb(); const now = Date.now();
  const variants = await db.select({ id: productVariants.id, sku: productVariants.sku }).from(productVariants);
  const bySku = new Map(variants.map((variant) => [variant.sku, variant.id]));
  await db.batch([
    db.delete(cartItems).where(eq(cartItems.userId, user.userId)),
    ...items.map((item) => db.insert(cartItems).values({ id: crypto.randomUUID(), userId: user.userId, variantId: bySku.get(item.sku)!, quantity: item.quantity, createdAt: now, updatedAt: now })),
  ]);
  return Response.json({ status: 'saved', items });
}
