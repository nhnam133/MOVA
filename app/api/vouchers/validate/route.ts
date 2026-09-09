import { and, eq, gt } from 'drizzle-orm';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { customerVouchers, vouchers } from '@/db/schema';
import { calculateOrderTotals } from '@/lib/business-rules';

export async function GET(request: Request) {
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const url = new URL(request.url); const code = (url.searchParams.get('code') ?? '').trim().toUpperCase(); const subtotal = Number(url.searchParams.get('subtotal'));
  if (!code || !Number.isInteger(subtotal) || subtotal < 0) return Response.json({ error: 'Mã hoặc giá trị đơn không hợp lệ.' }, { status: 400 });
  const [voucher] = await getDb().select({ value: vouchers.value, minimum: vouchers.minimumOrderValue }).from(customerVouchers).innerJoin(vouchers, eq(customerVouchers.voucherId, vouchers.id)).where(and(eq(customerVouchers.userId, user.userId), eq(customerVouchers.status, 'available'), eq(vouchers.code, code), eq(vouchers.active, true), gt(customerVouchers.expiresAt, Date.now()))).limit(1);
  if (!voucher) return Response.json({ error: 'Voucher không tồn tại, đã dùng hoặc đã hết hạn.' }, { status: 404 }); if (subtotal < voucher.minimum) return Response.json({ error: `Đơn cần tối thiểu ${voucher.minimum.toLocaleString('vi-VN')}đ trước voucher.` }, { status: 409 });
  const totals = calculateOrderTotals(subtotal, voucher.value);
  return Response.json({ discount: totals.discount, shippingFee: totals.shippingFee, total: totals.total });
}
