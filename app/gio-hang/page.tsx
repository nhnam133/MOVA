'use client';

import Image from 'next/image';
import Link from '@/components/store/link';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { SiteHeader } from '@/components/store/site-header';
import { useCart } from '@/components/store/cart-provider';
import { formatMoney } from '@/lib/catalog';

export default function CartPage() {
  const { items, updateQuantity, removeItem, catalog } = useCart();
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
        {rows.length === 0 ? (
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
            <div className="border border-black bg-white px-5 sm:px-7">
              {rows.map(({ item, product, variant }) => (
                <div
                  key={item.sku}
                  className="grid grid-cols-[96px_1fr] gap-5 border-b border-black/15 py-6 last:border-0 sm:grid-cols-[120px_1fr]"
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
                  <div className="flex flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                          {product.category}
                        </p>
                        <Link
                          href={`/san-pham/${product.slug}`}
                          className="mt-1 block font-bold hover:underline"
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex items-center border border-black">
                        <button
                          className="p-2.5"
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          className="p-2.5"
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-black">
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
              <p className="mt-4 text-center text-xs text-white/45">
                Bạn cần đăng nhập để đặt hàng
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
