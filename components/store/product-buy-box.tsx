'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatMoney } from '@/lib/catalog';
import Link from './link';
import { useCart } from './cart-provider';

export function ProductBuyBox({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const initial =
    product.variants.find((v) => v.size === 'M' && v.stock > 0) ??
    product.variants.find((v) => v.stock > 0) ??
    product.variants[0];
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [quantity, setQuantity] = useState(1);
  const selected = product.variants.find((v) => v.sku === sku);
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const available = Math.max(
    0,
    (selected?.stock ?? 0) -
      (items.find((item) => item.sku === sku)?.quantity ?? 0),
  );
  const amount = Math.max(1, Math.min(quantity, available));
  const choose = (nextSku: string) => {
    setSku(nextSku);
    setQuantity(1);
  };
  return (
    <div>
      <p className="text-sm font-semibold text-neutral-500">
        {product.category} / {product.code}
      </p>
      <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-5 text-2xl font-black">{formatMoney(product.price)}</p>
      <p className="mt-4 text-base leading-7 text-neutral-600">
        {product.description}
      </p>
      <div className="mt-7">
        <p className="mb-3 text-sm font-bold">
          Màu: {selected?.color ?? 'Chưa có biến thể'}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              type="button"
              key={color}
              aria-pressed={selected?.color === color}
              onClick={() => {
                const variant =
                  product.variants.find(
                    (v) => v.color === color && v.size === selected?.size,
                  ) ?? product.variants.find((v) => v.color === color);
                if (variant) choose(variant.sku);
              }}
              className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${selected?.color === color ? 'border-black bg-[#dfff00]' : 'border-black/20 bg-white hover:border-black'}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-bold">Chọn size</span>
          <Link
            href="/huong-dan-chon-size"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-4"
          >
            Hướng dẫn chọn size ↗
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.variants
            .filter((v) => v.color === selected?.color)
            .map((variant) => (
              <button
                type="button"
                key={variant.sku}
                disabled={variant.stock < 1}
                aria-pressed={sku === variant.sku}
                onClick={() => choose(variant.sku)}
                className={`h-12 min-w-14 rounded-lg border px-4 text-sm font-bold disabled:opacity-35 disabled:line-through ${sku === variant.sku ? 'border-black bg-black text-white' : 'border-black/20 bg-white hover:border-black'}`}
              >
                {variant.size}
              </button>
            ))}
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-neutral-500">
          {available > 0
            ? `Có thể thêm ${available} sản phẩm`
            : selected?.stock
              ? 'Bạn đã thêm tối đa số lượng vào giỏ.'
              : 'Phiên bản này hiện chưa có hàng.'}
        </p>
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <div className="flex h-12 items-center rounded-full border border-black/20 bg-white">
          <button
            type="button"
            disabled={amount <= 1}
            onClick={() => setQuantity(amount - 1)}
            className="h-12 w-11 disabled:opacity-30"
            aria-label="Giảm số lượng"
          >
            <Minus className="mx-auto h-4 w-4" />
          </button>
          <span className="w-7 text-center text-sm font-bold">{amount}</span>
          <button
            type="button"
            disabled={amount >= available}
            onClick={() => setQuantity(amount + 1)}
            className="h-12 w-11 disabled:opacity-30"
            aria-label="Tăng số lượng"
          >
            <Plus className="mx-auto h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={!available}
          onClick={() => addItem(product.slug, sku, amount)}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-40"
        >
          <ShoppingBag className="h-5 w-5" />
          Thêm vào giỏ
        </button>
      </div>
      <dl className="mt-8 divide-y divide-black/10 border-y border-black/10 text-sm">
        {[
          ['Chất liệu', product.material],
          ['Đổi hàng', 'Trong 72 giờ từ lúc nhận'],
          ['Giao hàng', '30.000đ · Miễn phí từ 499K'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 py-4">
            <dt className="shrink-0 text-neutral-500">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
