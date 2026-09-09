import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ProductBuyBox } from '@/components/store/product-buy-box';
import { SiteHeader } from '@/components/store/site-header';
import { products } from '@/lib/catalog';
import { findCatalogProduct } from '@/lib/catalog-server';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await findCatalogProduct((await params).slug);
  if (!product) notFound();
  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <div className="bg-[#eaff2f] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black sm:text-xs">Freeship đơn từ 499K · Đổi size trong 72 giờ</div>
      <SiteHeader />
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-8 lg:px-12"><Link href="/san-pham" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><ArrowLeft className="h-4 w-4" />Quay lại sản phẩm</Link></div>
      <section className="mx-auto grid max-w-[1480px] gap-10 px-4 pb-20 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-12 lg:pb-28">
        <div className="relative aspect-[3/4] overflow-hidden bg-white"><Image src={product.image} alt={product.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" /></div>
        <div className="lg:sticky lg:top-32 lg:self-start"><ProductBuyBox product={product} /></div>
      </section>
    </main>
  );
}
