'use client';

import type { SyntheticEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, LoaderCircle, Smartphone, Ticket, Truck } from 'lucide-react';
import { useCart } from './cart-provider';
import { formatMoney } from '@/lib/catalog';

export function CheckoutForm({ customerName, customerEmail }: { customerName: string; customerEmail: string }) {
  const { items, clearCart, catalog } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [discount, setDiscount] = useState(0);
  const requestKey = useRef(crypto.randomUUID());
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = catalog.find((entry) => entry.slug === item.productSlug);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
    const merchandiseTotal = Math.max(0, subtotal - discount);
    const shipping = merchandiseTotal >= 499_000 ? 0 : 30_000;
    return { subtotal, shipping, total: merchandiseTotal + shipping };
  }, [items, catalog, discount]);

  async function applyVoucher() {
    setVoucherError(''); setDiscount(0); const code = voucherCode.trim().toUpperCase(); if (!code) return;
    const response = await fetch(`/api/vouchers/validate?code=${encodeURIComponent(code)}&subtotal=${totals.subtotal}`); const result = await response.json() as { error?: string; discount?: number };
    if (!response.ok) { setVoucherError(result.error ?? 'Voucher không hợp lệ.'); return; } setVoucherCode(code); setDiscount(result.discount ?? 0);
  }

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json', 'Idempotency-Key': requestKey.current }, body: JSON.stringify({
      items, paymentMethod, voucherCode: discount > 0 ? voucherCode : undefined, recipientName: data.get('recipientName'), recipientPhone: data.get('recipientPhone'), addressLine: data.get('addressLine'), ward: data.get('ward'), district: data.get('district'), province: data.get('province'), note: data.get('note'),
    }) });
    const result = await response.json() as { error?: string; redirectUrl?: string; paymentUrl?: string };
    if (!response.ok) { setError(result.error || 'Không thể tạo đơn hàng.'); setSubmitting(false); return; }
    clearCart();
    window.location.href = result.paymentUrl || result.redirectUrl || '/tai-khoan';
  }

  if (items.length === 0) return <div className="border border-black bg-white px-6 py-16 text-center"><p className="text-xl font-black uppercase">Giỏ hàng đang trống</p><Link href="/san-pham" className="mt-6 inline-flex bg-black px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Chọn sản phẩm</Link></div>;
  const fieldClass = 'mt-2 h-12 w-full border border-black/25 bg-white px-4 text-sm outline-none transition focus:border-black';
  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_390px]">
      <div className="space-y-8">
        <section className="border border-black bg-white p-6 sm:p-8"><div className="mb-7 flex items-end justify-between"><h2 className="text-2xl font-black uppercase">Thông tin nhận hàng</h2><span className="text-xs text-neutral-500">{customerEmail}</span></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Họ và tên<input name="recipientName" required defaultValue={customerName} className={fieldClass} /></label><label className="text-sm font-bold">Số điện thoại<input name="recipientPhone" required inputMode="tel" placeholder="09xxxxxxxx" className={fieldClass} /></label><label className="text-sm font-bold sm:col-span-2">Số nhà, tên đường<input name="addressLine" required className={fieldClass} /></label><label className="text-sm font-bold">Phường/Xã<input name="ward" required className={fieldClass} /></label><label className="text-sm font-bold">Quận/Huyện<input name="district" required className={fieldClass} /></label><label className="text-sm font-bold sm:col-span-2">Tỉnh/Thành phố<input name="province" required defaultValue="TP. Hồ Chí Minh" className={fieldClass} /></label><label className="text-sm font-bold sm:col-span-2">Ghi chú<textarea name="note" rows={3} className="mt-2 w-full resize-none border border-black/25 bg-white p-4 text-sm outline-none focus:border-black" /></label></div></section>
        <section className="border border-black bg-white p-6 sm:p-8"><h2 className="mb-6 text-2xl font-black uppercase">Thanh toán</h2><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setPaymentMethod('cod')} className={`flex min-h-24 items-center gap-4 border p-4 text-left ${paymentMethod === 'cod' ? 'border-black bg-[#eaff2f]' : 'border-black/20'}`}><Truck className="h-6 w-6" /><span><b className="block">COD</b><small>Trả tiền khi nhận hàng</small></span></button><button type="button" onClick={() => setPaymentMethod('momo')} className={`flex min-h-24 items-center gap-4 border p-4 text-left ${paymentMethod === 'momo' ? 'border-black bg-[#eaff2f]' : 'border-black/20'}`}><Smartphone className="h-6 w-6" /><span><b className="block">MoMo UAT</b><small>Thanh toán thử nghiệm</small></span></button></div></section>
        <section className="border border-black bg-white p-6 sm:p-8"><h2 className="flex items-center gap-2 text-2xl font-black uppercase"><Ticket className="h-5 w-5" />Voucher</h2><div className="mt-5 flex gap-2"><input value={voucherCode} onChange={(event) => { setVoucherCode(event.target.value); setDiscount(0); }} placeholder="Nhập mã voucher cá nhân" className="h-12 min-w-0 flex-1 border border-black/25 px-4 text-sm outline-none focus:border-black" /><button type="button" onClick={applyVoucher} className="h-12 bg-black px-5 text-xs font-black uppercase text-white">Áp dụng</button></div>{discount > 0 && <p className="mt-3 flex items-center gap-2 text-sm font-bold text-green-700"><BadgeCheck className="h-4 w-4" />Đã giảm {formatMoney(discount)}</p>}{voucherError && <p role="alert" className="mt-3 text-sm text-red-600">{voucherError}</p>}</section>
      </div>
      <aside className="h-fit border border-black bg-black p-6 text-white lg:sticky lg:top-28"><h2 className="text-xl font-black uppercase">Đơn hàng</h2><div className="my-6 space-y-3 border-y border-white/20 py-5 text-sm">{items.map((item) => { const product = catalog.find((entry) => entry.slug === item.productSlug); return product ? <div key={item.sku} className="flex justify-between gap-4"><span className="text-white/65">{product.name} × {item.quantity}</span><span>{formatMoney(product.price * item.quantity)}</span></div> : null; })}</div><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt className="text-white/55">Tạm tính</dt><dd>{formatMoney(totals.subtotal)}</dd></div>{discount > 0 && <div className="flex justify-between text-[#eaff2f]"><dt>Voucher</dt><dd>-{formatMoney(discount)}</dd></div>}<div className="flex justify-between"><dt className="text-white/55">Vận chuyển</dt><dd>{totals.shipping === 0 ? 'Miễn phí' : formatMoney(totals.shipping)}</dd></div><div className="flex justify-between border-t border-white/20 pt-5 text-lg font-black"><dt>Tổng cộng</dt><dd className="text-[#eaff2f]">{formatMoney(totals.total)}</dd></div></dl>{error && <p role="alert" className="mt-5 bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}<button disabled={submitting} className="mt-6 flex h-14 w-full items-center justify-center gap-2 bg-[#eaff2f] text-sm font-black uppercase tracking-wider text-black disabled:opacity-50">{submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}Đặt hàng</button><p className="mt-4 text-center text-[11px] leading-5 text-white/45">Điểm được cộng khi đơn hoàn tất và đã thanh toán.</p></aside>
    </form>
  );
}
