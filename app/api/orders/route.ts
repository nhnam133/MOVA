import { getMovaUser } from '@/lib/auth';
import { and, eq, gt } from 'drizzle-orm';
import { getDb } from '@/db';
import { customerVouchers, orders, vouchers } from '@/db/schema';
import { getCatalogProducts } from '@/lib/catalog-server';
import { createMomoPayment, isMomoConfigured } from '@/lib/momo';
import { calculateOrderTotals } from '@/lib/business-rules';
import { atomicBatch, guard, type SqlCommand } from '@/lib/atomic-db';

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
  const user = await getMovaUser();
  if (!user)
    return Response.json(
      { error: 'Bạn cần đăng nhập để đặt hàng.' },
      { status: 401 },
    );
  const key = request.headers.get('idempotency-key');
  if (!key || key.length > 100)
    return Response.json(
      { error: 'Thiếu khóa xác nhận đơn hàng.' },
      { status: 400 },
    );
  const requestKey = user.userId + ':' + key;
  const db = getDb();
  const findPrevious = async () =>
    (
      await db
        .select({ orderCode: orders.orderCode })
        .from(orders)
        .where(
          and(
            eq(orders.userId, user.userId),
            eq(orders.requestKey, requestKey),
          ),
        )
        .limit(1)
    )[0];
  const previous = await findPrevious();
  if (previous)
    return Response.json({
      orderCode: previous.orderCode,
      redirectUrl: '/tai-khoan/don-hang/' + previous.orderCode,
    });

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object')
    return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
  const required = [
    body.recipientName,
    body.recipientPhone,
    body.addressLine,
    body.ward,
    body.district,
    body.province,
  ];
  if (
    required.some(
      (value) =>
        typeof value !== 'string' || !value.trim() || value.length > 250,
    )
  )
    return Response.json(
      {
        error: 'Vui lòng nhập đủ thông tin nhận hàng (tối đa 250 ký tự mỗi ô).',
      },
      { status: 400 },
    );
  if (
    (body.note != null &&
      (typeof body.note !== 'string' || body.note.length > 2000)) ||
    (body.voucherCode != null && typeof body.voucherCode !== 'string')
  )
    return Response.json(
      { error: 'Ghi chú hoặc mã voucher không hợp lệ.' },
      { status: 400 },
    );
  if (!/^0\d{9}$/.test(body.recipientPhone!.replaceAll(' ', '')))
    return Response.json(
      { error: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.' },
      { status: 400 },
    );
  if (body.paymentMethod !== 'cod' && body.paymentMethod !== 'momo')
    return Response.json(
      { error: 'Phương thức thanh toán không hợp lệ.' },
      { status: 400 },
    );
  if (body.paymentMethod === 'momo' && !isMomoConfigured())
    return Response.json(
      {
        error:
          'MoMo UAT chưa được kết nối. Bạn có thể chọn COD; chưa có đơn hay giao dịch nào được tạo.',
      },
      { status: 503 },
    );
  if (
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > 50
  )
    return Response.json(
      { error: 'Giỏ hàng phải có từ 1 đến 50 dòng sản phẩm.' },
      { status: 400 },
    );

  const catalog = await getCatalogProducts();
  const unique = new Set<string>();
  const resolved = [];
  for (const item of body.items) {
    const product =
      item && catalog.find((entry) => entry.slug === item.productSlug);
    const variant = product?.variants.find((entry) => entry.sku === item.sku);
    if (
      !product?.id ||
      !variant?.id ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > variant.stock ||
      unique.has(item.sku)
    )
      return Response.json(
        {
          error:
            'Sản phẩm không hợp lệ, trùng SKU hoặc không đủ tồn kho. Vui lòng kiểm tra lại giỏ.',
        },
        { status: 409 },
      );
    unique.add(item.sku);
    resolved.push({
      product,
      variant,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    });
  }
  const subtotal = resolved.reduce((sum, item) => sum + item.lineTotal, 0);
  let discount = 0;
  let customerVoucherId: string | null = null;
  if (body.voucherCode?.trim()) {
    const [voucher] = await db
      .select({
        id: customerVouchers.id,
        value: vouchers.value,
        minimum: vouchers.minimumOrderValue,
      })
      .from(customerVouchers)
      .innerJoin(vouchers, eq(customerVouchers.voucherId, vouchers.id))
      .where(
        and(
          eq(customerVouchers.userId, user.userId),
          eq(customerVouchers.status, 'available'),
          eq(vouchers.code, body.voucherCode.trim().toUpperCase()),
          eq(vouchers.active, true),
          gt(customerVouchers.expiresAt, Date.now()),
        ),
      )
      .limit(1);
    if (!voucher || subtotal < voucher.minimum)
      return Response.json(
        { error: 'Voucher không hợp lệ hoặc đơn chưa đủ điều kiện.' },
        { status: 409 },
      );
    discount = Math.min(voucher.value, subtotal);
    customerVoucherId = voucher.id;
  }
  const { shippingFee, total, points } = calculateOrderTotals(
    subtotal,
    discount,
  );
  const now = Date.now(),
    orderId = crypto.randomUUID();
  const orderCode =
    'MV' +
    now.toString(36).toUpperCase() +
    crypto.randomUUID().slice(0, 5).toUpperCase();
  const momoRequestId =
    body.paymentMethod === 'momo' ? crypto.randomUUID() : null;
  const commands: SqlCommand[] = [
    {
      sql: 'INSERT INTO users (id,email,full_name,created_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,full_name=excluded.full_name,updated_at=excluded.updated_at',
      params: [user.userId, user.email, user.fullName ?? null, now, now],
    },
  ];
  for (const entry of resolved)
    commands.push(
      guard(
        'EXISTS (SELECT 1 FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.id=? AND v.active=1 AND p.status=? AND p.price=? AND v.stock-v.reserved_stock>=?)',
        [entry.variant.id!, 'active', entry.product.price, entry.quantity],
      ),
      {
        sql: 'UPDATE product_variants SET reserved_stock=reserved_stock+?, updated_at=? WHERE id=?',
        params: [entry.quantity, now, entry.variant.id!],
      },
    );
  if (customerVoucherId)
    commands.push(
      guard(
        'EXISTS (SELECT 1 FROM customer_vouchers c JOIN vouchers v ON v.id=c.voucher_id WHERE c.id=? AND c.user_id=? AND c.status=? AND c.expires_at>? AND v.active=1 AND v.minimum_order_value<=? AND v.value=?)',
        [customerVoucherId, user.userId, 'available', now, subtotal, discount],
      ),
    );
  commands.push({
    sql: 'INSERT INTO orders (id,order_code,user_id,request_key,payment_method,payment_status,momo_request_id,recipient_name,recipient_phone,address_line,ward,district,province,note,subtotal,discount,shipping_fee,total,points_earned,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    params: [
      orderId,
      orderCode,
      user.userId,
      requestKey,
      body.paymentMethod,
      body.paymentMethod === 'momo' ? 'pending' : 'unpaid',
      momoRequestId,
      body.recipientName!.trim(),
      body.recipientPhone!.replaceAll(' ', ''),
      body.addressLine!.trim(),
      body.ward!.trim(),
      body.district!.trim(),
      body.province!.trim(),
      body.note?.trim() || null,
      subtotal,
      discount,
      shippingFee,
      total,
      points,
      now,
      now,
    ],
  });
  for (const entry of resolved)
    commands.push({
      sql: 'INSERT INTO order_items (id,order_id,product_id,variant_id,product_code,product_name,sku,color,size,unit_price,quantity,line_total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      params: [
        crypto.randomUUID(),
        orderId,
        entry.product.id!,
        entry.variant.id!,
        entry.product.code,
        entry.product.name,
        entry.variant.sku,
        entry.variant.color,
        entry.variant.size,
        entry.product.price,
        entry.quantity,
        entry.lineTotal,
      ],
    });
  if (customerVoucherId)
    commands.push({
      sql: 'UPDATE customer_vouchers SET status=?,order_id=? WHERE id=?',
      params: ['reserved', orderId, customerVoucherId],
    });
  try {
    await atomicBatch(commands);
  } catch {
    const concurrent = await findPrevious();
    if (concurrent)
      return Response.json({
        orderCode: concurrent.orderCode,
        redirectUrl: '/tai-khoan/don-hang/' + concurrent.orderCode,
      });
    return Response.json(
      {
        error:
          'Giá, tồn kho hoặc voucher vừa thay đổi. Chưa tạo đơn và chưa trừ tiền; vui lòng tải lại giỏ hàng.',
      },
      { status: 409 },
    );
  }
  if (body.paymentMethod === 'momo') {
    try {
      const payment = await createMomoPayment({
        orderCode,
        amount: total,
        origin: new URL(request.url).origin,
        requestId: momoRequestId!,
      });
      return Response.json({ orderCode, paymentUrl: payment.payUrl });
    } catch {
      // A network timeout is not proof of payment failure. Preserve the order for reconciliation.
      return Response.json({
        orderCode,
        redirectUrl: '/tai-khoan/don-hang/' + orderCode,
        warning:
          'Chưa nhận được liên kết MoMo. Kiểm tra đơn hàng hoặc liên hệ MOVA, không thanh toán lại.',
      });
    }
  }
  return Response.json({
    orderCode,
    redirectUrl:
      '/thanh-toan/ket-qua?orderCode=' + encodeURIComponent(orderCode),
  });
}
