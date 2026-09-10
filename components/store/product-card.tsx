'use client';

import Image from 'next/image';
import Link from '@/components/store/link';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatMoney } from '@/lib/catalog';
import { useCart } from './cart-provider';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const defaultVariant =
    product.variants.find(
      (variant) => variant.size === 'M' && variant.stock > 0,
    ) ?? product.variants.find((variant) => variant.stock > 0);
  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link
          href={`/san-pham/${product.slug}`}
          className="relative block aspect-[3/4] overflow-hidden rounded-[18px] bg-[#efefe9] shadow-[0_8px_35px_rgba(0,0,0,0.06)] focus-visible:outline-2 focus-visible:outline-offset-3"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-[1.025]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
              {product.badge}
            </span>
          )}
        </Link>
        {defaultVariant && (
          <button
            onClick={() => addItem(product.slug, defaultVariant.sku)}
            className="absolute bottom-3 right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#dfff00] text-black shadow-lg transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label={`Thêm nhanh ${product.name}, size ${defaultVariant.size}`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
          {product.category}
        </p>
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="mt-1 truncate text-sm font-bold hover:underline sm:text-base">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm font-black">{formatMoney(product.price)}</p>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <p className="text-xs text-neutral-400 line-through">
              {formatMoney(product.compareAtPrice)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
