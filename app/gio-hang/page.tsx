'use client';

import Image from 'next/image';
import Link from '@/components/store/link';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { SiteHeader } from '@/components/store/site-header';
import { useCart } from '@/components/store/cart-provider';
import { formatMoney } from '@/lib/catalog';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  const { items, updateQuantity, removeItem, catalog, hydrated, signedIn } =
    useCart();
  const rows = items.flatMap((item) => {
    const product = catalog.find((entry) => entry.slug === item.productSlug);
    const variant = product?.variants.find((entry) => entry.sku === item.sku);
    return product && variant ? [{ item, product, variant }] : [];
  });
  const subtotal = rows.reduce(
    (sum, row) => sum + row.product.price * row.item.quantity,
    0,
  );
  const shipping = subtotal >= 499_000 ? 0 : 30_000;
  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <div className="bg-[#eaff2f] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black sm:text-xs">
        Freeship đơn từ 499K · Đổi size trong 72 giờ
      </div>
      <SiteHeader />
      <section className="mx-auto max-w-[1384px] px-4 py-12 sm:px-8 lg:px-0 lg:py-20">
        <Link
          href="/san-pham"
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Tiếp tục mua sắm
        </Link>
        <h1 className="text-5xl font-black uppercase tracking-[-0.065em] sm:text-7xl">
          Giỏ hàng
        </h1>
        {!hydrated ? (
          <div
            className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"
            aria-busy="true"
          >
            <span className="sr-only" aria-live="polite">
              Đang tải giỏ hàng
            </span>
            <div className="space-y-6 border border-black bg-white p-5 sm:p-7">
              {[1, 2].map((item) => (
                <div key={item} className="grid grid-cols-[96px_1fr] gap-5">
                  <Skeleton className="aspect-[3/4] rounded-none bg-black/10 motion-reduce:animate-none" />
                  <div className="space-y-4 py-2">
                    <Skeleton className="h-5 w-3/4 bg-black/10 motion-reduce:animate-none" />
                    <Skeleton className="h-4 w-1/3 bg-black/10 motion-reduce:animate-none" />
                    <Skeleton className="h-11 w-32 bg-black/10 motion-reduce:animate-none" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-72 rounded-none bg-black/15 motion-reduce:animate-none" />
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-10 flex min-h-80 flex-col items-center justify-center border border-black bg-white text-center">
            <ShoppingBag className="mb-5 h-10 w-10" />
            <p className="text-xl font-black uppercase">Giỏ hàng đang trống</p>
            <Link
              href="/san-pham"
              className="mt-6 bg-black px-6 py-4 text-xs font-black uppercase tracking-wider text-white"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="min-w-0 border border-black bg-white px-4 sm:px-7">
              {rows.map(({ item, product, variant }) => (
                <div
                  key={item.sku}
                  className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-3 border-b border-black/15 py-6 last:border-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5"
                >
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="relative aspect-[3/4] overflow-hidden bg-neutral-100"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-col justify-between">
                    <div className="flex min-w-0 justify-between gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                          {product.category}
                        </p>
                        <Link
                          href={`/san-pham/${product.slug}`}
                          className="mt-1 block [overflow-wrap:anywhere] font-bold hover:underline"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-2 text-xs text-neutral-500">
                          {variant.color} / {variant.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.sku)}
                        aria-label={`Xóa ${product.name}`}
                        className="inline-flex min-h-11 min-w-11 flex-none cursor-pointer items-center justify-center rounded-full transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4 flex min-w-0 flex-col items-start gap-3 sm:mt-0 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex max-w-full items-center border border-black">
                        <button
                          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity - 1)
                          }
                          aria-label={`Giảm số lượng ${product.name}`}
                        >
                          <Minus className="h-3 w-3" aria-hidden="true" />
                        </button>
                        <span className="min-w-7 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity + 1)
                          }
                          aria-label={`Tăng số lượng ${product.name}`}
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="max-w-full font-black tabular-nums">
                        {formatMoney(product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="h-fit border border-black bg-black p-6 text-white lg:sticky lg:top-28">
              <h2 className="text-xl font-black uppercase">Tóm tắt đơn</h2>
              <dl className="mt-7 space-y-4 border-b border-white/20 pb-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-white/60">Tạm tính</dt>
                  <dd>{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/60">Phí vận chuyển</dt>
                  <dd>{shipping === 0 ? 'Miễn phí' : formatMoney(shipping)}</dd>
                </div>
              </dl>
              <div className="flex justify-between py-6">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-xl font-black text-[#eaff2f]">
                  {formatMoney(subtotal + shipping)}
                </span>
              </div>
              <Link
                href="/thanh-toan"
                className="flex h-14 items-center justify-center bg-[#eaff2f] text-sm font-black uppercase tracking-wider text-black"
              >
                Tiến hành thanh toán
              </Link>
              <p className="mt-4 text-center text-xs text-white/70">
                {signedIn
                  ? 'Đơn hàng được lưu trong tài khoản HAUVIE của bạn.'
                  : 'Bạn sẽ đăng nhập trước khi xác nhận đơn hàng.'}
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
