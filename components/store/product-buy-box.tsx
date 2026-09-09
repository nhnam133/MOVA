'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatMoney } from '@/lib/catalog';
import { useCart } from './cart-provider';

export function ProductBuyBox({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [sku, setSku] = useState(product.variants.find((variant) => variant.size === 'M')?.sku ?? product.variants[0].sku);
  const [quantity, setQuantity] = useState(1);
  const selected = useMemo(() => product.variants.find((variant) => variant.sku === sku)!, [product, sku]);

  return (
    <div>
      <div className="flex items-start justify-between gap-6 border-b border-black/15 pb-7">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">{product.category} / {product.code}</p><h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.055em] sm:text-6xl">{product.name}</h1></div>
        {product.badge && <span className="shrink-0 bg-[#eaff2f] px-3 py-2 text-[10px] font-black uppercase tracking-wider">{product.badge}</span>}
      </div>
      <p className="py-7 text-2xl font-black">{formatMoney(product.price)}</p>
      <p className="max-w-xl text-sm leading-7 text-neutral-600">{product.description}</p>

      <div className="mt-9">
        <div className="mb-3 flex justify-between text-sm"><span className="font-bold">Chọn size</span><button className="text-xs underline underline-offset-4">Hướng dẫn chọn size</button></div>
        <div className="grid grid-cols-4 gap-2">
          {product.variants.map((variant) => (
            <button key={variant.sku} onClick={() => setSku(variant.sku)} className={`h-12 border text-sm font-bold transition-colors ${sku === variant.sku ? 'border-black bg-black text-white' : 'border-black/20 bg-white hover:border-black'}`}>{variant.size}</button>
          ))}
        </div>
        <p className="mt-3 text-xs text-neutral-500">Màu: {selected.color} · Còn {selected.stock} sản phẩm</p>
      </div>

      <div className="mt-8 flex gap-3">
        <div className="flex h-14 items-center border border-black bg-white">
          <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-full px-4" aria-label="Giảm số lượng"><Minus className="h-4 w-4" /></button>
          <span className="w-6 text-center text-sm font-bold">{quantity}</span>
          <button onClick={() => setQuantity((value) => Math.min(selected.stock, value + 1))} className="h-full px-4" aria-label="Tăng số lượng"><Plus className="h-4 w-4" /></button>
        </div>
        <button onClick={() => addItem(product.slug, sku, quantity)} className="flex h-14 flex-1 items-center justify-center gap-3 bg-black px-5 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-[#eaff2f] hover:text-black"><ShoppingBag className="h-4 w-4" />Thêm vào giỏ</button>
      </div>

      <dl className="mt-10 divide-y divide-black/15 border-y border-black/15 text-sm">
        <div className="flex justify-between py-4"><dt className="text-neutral-500">Chất liệu</dt><dd className="font-medium">{product.material}</dd></div>
        <div className="flex justify-between py-4"><dt className="text-neutral-500">Đổi size</dt><dd className="font-medium">Trong 72 giờ từ lúc nhận</dd></div>
        <div className="flex justify-between py-4"><dt className="text-neutral-500">Giao hàng</dt><dd className="font-medium">30.000đ · Miễn phí từ 499K</dd></div>
      </dl>
    </div>
  );
}
