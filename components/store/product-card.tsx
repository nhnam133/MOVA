'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatMoney } from '@/lib/catalog';
import { useCart } from './cart-provider';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const defaultVariant = product.variants.find((variant) => variant.size === 'M') ?? product.variants[0];
  return (
    <article className="group">
      <div className="relative">
        <Link href={`/san-pham/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-[#efefe9]">
          <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" sizes="(max-width: 768px) 50vw, 25vw" />
          {product.badge && <span className="absolute left-3 top-3 bg-black px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">{product.badge}</span>}
        </Link>
        <button onClick={() => addItem(product.slug, defaultVariant.sku)} className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-3 items-center justify-center bg-[#eaff2f] text-black opacity-0 shadow-sm transition-all hover:bg-white group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100" aria-label={`Thêm nhanh ${product.name}, size ${defaultVariant.size}`}><ShoppingBag className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{product.category}</p><Link href={`/san-pham/${product.slug}`}><h3 className="mt-1 text-sm font-bold hover:underline sm:text-base">{product.name}</h3></Link></div><p className="shrink-0 text-sm font-black">{formatMoney(product.price)}</p></div>
    </article>
  );
}
