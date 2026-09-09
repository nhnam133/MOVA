import { getChatGPTUser } from '@/app/chatgpt-auth';
import { and, eq, gt, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { customerVouchers, orderItems, orders, productVariants, users, vouchers } from '@/db/schema';
import { getCatalogProducts } from '@/lib/catalog-server';
import { createMomoPayment } from '@/lib/momo';
import { calculateOrderTotals } from '@/lib/business-rules';

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
  voucherCode?: string;
};

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'Bạn cần đăng nhập để đặt hàng.' }, { status: 401 });
  const requestKey = request.headers.get('idempotency-key');
  if (!requestKey || requestKey.length > 100) return Response.json({ error: 'Thiếu khóa xác nhận đơn hàng.' }, { status: 400 });
  const db = getDb();
  const [previousOrder] = await db.select({ orderCode: orders.orderCode, paymentMethod: orders.paymentMethod, paymentStatus: orders.paymentStatus }).from(orders).where(and(eq(orders.userId, user.userId), eq(orders.requestKey, requestKey))).limit(1);
  if (previousOrder) return Response.json({ orderCode: previousOrder.orderCode, redirectUrl: `/tai-khoan/don-hang/${previousOrder.orderCode}` });

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
  let discount = 0; let customerVoucherId: string | null = null;
  if (body.voucherCode?.trim()) {
    const [voucher] = await db.select({ customerVoucherId: customerVouchers.id, value: vouchers.value, minimum: vouchers.minimumOrderValue }).from(customerVouchers).innerJoin(vouchers, eq(customerVouchers.voucherId, vouchers.id)).where(and(eq(customerVouchers.userId, user.userId), eq(customerVouchers.status, 'available'), eq(vouchers.code, body.voucherCode.trim().toUpperCase()), eq(vouchers.active, true), gt(customerVouchers.expiresAt, Date.now()))).limit(1);
    if (!voucher || subtotal < voucher.minimum) return Response.json({ error: 'INVALID_VOUCHER: Voucher không hợp lệ hoặc đơn chưa đủ điều kiện.' }, { status: 409 });
    discount = Math.min(voucher.value, subtotal); customerVoucherId = voucher.customerVoucherId;
  }
  const { shippingFee, total, points } = calculateOrderTotals(subtotal, discount);
  const now = Date.now();
  const orderId = crypto.randomUUID();
  const orderCode = `MV${now.toString().slice(-9)}`;

  const reserved: { id: string; quantity: number }[] = [];
  for (const entry of resolvedItems) {
    if (!entry.variant.id) continue;
    const changed = await db.update(productVariants).set({ reservedStock: sql`${productVariants.reservedStock} + ${entry.quantity}`, updatedAt: now }).where(and(eq(productVariants.id, entry.variant.id), sql`${productVariants.stock} - ${productVariants.reservedStock} >= ${entry.quantity}`)).returning({ id: productVariants.id });
    if (!changed.length) { for (const row of reserved) await db.update(productVariants).set({ reservedStock: sql`MAX(0, ${productVariants.reservedStock} - ${row.quantity})`, updatedAt: Date.now() }).where(eq(productVariants.id, row.id)); return Response.json({ error: `OUT_OF_STOCK: ${entry.variant.sku} vừa hết hoặc không đủ hàng.` }, { status: 409 }); }
    reserved.push({ id: entry.variant.id, quantity: entry.quantity });
  }

  await db.insert(users).values({ id: user.userId, email: user.email, fullName: user.fullName, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: users.id, set: { email: user.email, fullName: user.fullName, updatedAt: now } });
  try { await db.insert(orders).values({
    id: orderId, orderCode, userId: user.userId, requestKey, paymentMethod: body.paymentMethod,
    paymentStatus: body.paymentMethod === 'momo' ? 'pending' : 'unpaid',
    recipientName: body.recipientName!.trim(), recipientPhone: body.recipientPhone!.replaceAll(' ', ''), addressLine: body.addressLine!.trim(),
    ward: body.ward!.trim(), district: body.district!.trim(), province: body.province!.trim(), note: body.note?.trim() || null,
    subtotal, discount, shippingFee, total, pointsEarned: points, createdAt: now, updatedAt: now,
  });
  for (const entry of resolvedItems) {
    await db.insert(orderItems).values({
      id: crypto.randomUUID(), orderId, productId: entry.product.id ?? null, variantId: entry.variant.id ?? null, productCode: entry.product.code, productName: entry.product.name, sku: entry.variant.sku,
      color: entry.variant.color, size: entry.variant.size, unitPrice: entry.product.price, quantity: entry.quantity, lineTotal: entry.lineTotal,
    });
  }
  if (customerVoucherId) { const changed = await db.update(customerVouchers).set({ status: 'reserved', orderId }).where(and(eq(customerVouchers.id, customerVoucherId), eq(customerVouchers.status, 'available'))).returning({ id: customerVouchers.id }); if (!changed.length) throw new Error('Voucher vừa được sử dụng ở đơn khác.'); }
  } catch (error) { for (const row of reserved) await db.update(productVariants).set({ reservedStock: sql`MAX(0, ${productVariants.reservedStock} - ${row.quantity})`, updatedAt: Date.now() }).where(eq(productVariants.id, row.id)); return Response.json({ error: error instanceof Error ? error.message : 'Không thể tạo đơn hàng.' }, { status: 409 }); }

  if (body.paymentMethod === 'momo') {
    try {
      const payment = await createMomoPayment({ orderCode, amount: total, origin: new URL(request.url).origin });
      await db.update(orders).set({ momoRequestId: payment.requestId, updatedAt: Date.now() }).where(eq(orders.id, orderId));
      return Response.json({ orderCode, paymentUrl: payment.payUrl });
    } catch (error) {
      await db.update(orders).set({ paymentStatus: 'failed', updatedAt: Date.now() }).where(eq(orders.id, orderId));
      return Response.json({ error: error instanceof Error ? error.message : 'Không thể kết nối MoMo UAT.', orderCode }, { status: 503 });
    }
  }

  return Response.json({ orderCode, redirectUrl: `/thanh-toan/ket-qua?orderCode=${encodeURIComponent(orderCode)}` });
}
