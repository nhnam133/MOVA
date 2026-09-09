import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { orderItems, orders, users } from '@/db/schema';
import { getCatalogProducts } from '@/lib/catalog-server';
import { createMomoPayment } from '@/lib/momo';

type CheckoutBody = {
  items?: { productSlug: string; sku: string; quantity: number }[];
  recipientName?: string;
  recipientPhone?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  province?: string;
  note?: string;
  paymentMethod?: 'cod' | 'momo';
};

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'Bạn cần đăng nhập để đặt hàng.' }, { status: 401 });

  let body: CheckoutBody;
  try { body = await request.json() as CheckoutBody; } catch { return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  const required = [body.recipientName, body.recipientPhone, body.addressLine, body.ward, body.district, body.province];
  if (required.some((value) => !value?.trim())) return Response.json({ error: 'Vui lòng nhập đủ thông tin nhận hàng.' }, { status: 400 });
  if (!/^0\d{9}$/.test(body.recipientPhone!.replaceAll(' ', ''))) return Response.json({ error: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.' }, { status: 400 });
  if (body.paymentMethod !== 'cod' && body.paymentMethod !== 'momo') return Response.json({ error: 'Phương thức thanh toán không hợp lệ.' }, { status: 400 });
  if (!Array.isArray(body.items) || body.items.length === 0) return Response.json({ error: 'Giỏ hàng đang trống.' }, { status: 400 });

  const catalog = await getCatalogProducts();
  const resolvedItems = [];
  for (const item of body.items) {
    const product = catalog.find((entry) => entry.slug === item.productSlug);
    const variant = product?.variants.find((entry) => entry.sku === item.sku);
    if (!product || !variant || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > variant.stock) {
      return Response.json({ error: `Sản phẩm ${item.sku || ''} không hợp lệ hoặc không đủ tồn kho.` }, { status: 400 });
    }
    resolvedItems.push({ product, variant, quantity: item.quantity, lineTotal: product.price * item.quantity });
  }

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = subtotal >= 499_000 ? 0 : 30_000;
  const total = subtotal + shippingFee;
  const now = Date.now();
  const orderId = crypto.randomUUID();
  const orderCode = `MV${now.toString().slice(-9)}`;
  const db = getDb();

  await db.insert(users).values({ id: user.userId, email: user.email, fullName: user.fullName, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: users.id, set: { email: user.email, fullName: user.fullName, updatedAt: now } });
  await db.insert(orders).values({
    id: orderId, orderCode, userId: user.userId, paymentMethod: body.paymentMethod,
    paymentStatus: body.paymentMethod === 'momo' ? 'pending' : 'unpaid',
    recipientName: body.recipientName!.trim(), recipientPhone: body.recipientPhone!.replaceAll(' ', ''), addressLine: body.addressLine!.trim(),
    ward: body.ward!.trim(), district: body.district!.trim(), province: body.province!.trim(), note: body.note?.trim() || null,
    subtotal, discount: 0, shippingFee, total, pointsEarned: Math.floor(subtotal / 10_000), createdAt: now, updatedAt: now,
  });
  for (const entry of resolvedItems) {
    await db.insert(orderItems).values({
      id: crypto.randomUUID(), orderId, productCode: entry.product.code, productName: entry.product.name, sku: entry.variant.sku,
      color: entry.variant.color, size: entry.variant.size, unitPrice: entry.product.price, quantity: entry.quantity, lineTotal: entry.lineTotal,
    });
  }

  if (body.paymentMethod === 'momo') {
    try {
      const payment = await createMomoPayment({ orderCode, amount: total, origin: new URL(request.url).origin });
      await db.update(orders).set({ momoRequestId: payment.requestId, updatedAt: Date.now() }).where((await import('drizzle-orm')).eq(orders.id, orderId));
      return Response.json({ orderCode, paymentUrl: payment.payUrl });
    } catch (error) {
      await db.update(orders).set({ paymentStatus: 'failed', updatedAt: Date.now() }).where((await import('drizzle-orm')).eq(orders.id, orderId));
      return Response.json({ error: error instanceof Error ? error.message : 'Không thể kết nối MoMo UAT.', orderCode }, { status: 503 });
    }
  }

  return Response.json({ orderCode, redirectUrl: `/thanh-toan/ket-qua?orderCode=${encodeURIComponent(orderCode)}` });
}
