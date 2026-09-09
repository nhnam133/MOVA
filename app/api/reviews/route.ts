import { and, eq } from 'drizzle-orm';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { orderItems, orders, products, reviews } from '@/db/schema';

export async function POST(request: Request) {
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const body = await request.json() as { productSlug?: string; rating?: number; content?: string }; const rating = Number(body.rating); const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!body.productSlug || !Number.isInteger(rating) || rating < 1 || rating > 5 || content.length < 5 || content.length > 1000) return Response.json({ error: 'Đánh giá cần 1–5 sao và nội dung từ 5 đến 1000 ký tự.' }, { status: 400 });
  const db = getDb(); const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, body.productSlug)).limit(1); if (!product) return Response.json({ error: 'Không tìm thấy sản phẩm.' }, { status: 404 });
  const [purchased] = await db.select({ id: orderItems.id }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id)).where(and(eq(orderItems.productId, product.id), eq(orders.userId, user.userId), eq(orders.status, 'completed'))).limit(1); if (!purchased) return Response.json({ error: 'Chỉ khách đã hoàn thành đơn có sản phẩm này mới được đánh giá.' }, { status: 403 });
  const now = Date.now(); await db.insert(reviews).values({ id: crypto.randomUUID(), userId: user.userId, productId: product.id, rating, content, createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: [reviews.userId, reviews.productId], set: { rating, content, visible: true, updatedAt: now } });
  return Response.json({ status: 'saved' });
}
