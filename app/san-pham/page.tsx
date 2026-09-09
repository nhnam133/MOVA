import Link from 'next/link';
import { ProductCard } from '@/components/store/product-card';
import { SiteHeader } from '@/components/store/site-header';
import { categories } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/catalog-server';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ 'danh-muc'?: string }> }) {
  const products = await getCatalogProducts();
  const selected = (await searchParams)['danh-muc'];
  const visibleProducts = selected ? products.filter((product) => product.categorySlug === selected) : products;
  const activeName = categories.find((category) => category.slug === selected)?.name;
  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <div className="bg-[#eaff2f] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black sm:text-xs">Freeship đơn từ 499K · Đổi size trong 72 giờ</div>
      <SiteHeader />
      <section className="border-b border-black bg-black px-4 py-16 text-white sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1384px]"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#eaff2f]">MOVA / Catalog</p><h1 className="mt-5 text-5xl font-black uppercase tracking-[-0.07em] sm:text-8xl">{activeName ?? 'Tất cả sản phẩm'}</h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/55">Những thiết kế sẵn sàng đồng hành cùng từng chuyển động của bạn.</p></div>
      </section>
      <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-12 flex flex-wrap gap-2">
          <Link href="/san-pham" className={`border px-4 py-2 text-xs font-bold uppercase tracking-wider ${!selected ? 'border-black bg-black text-white' : 'border-black/20 bg-white'}`}>Tất cả</Link>
          {categories.map((category) => <Link key={category.slug} href={`/san-pham?danh-muc=${category.slug}`} className={`border px-4 py-2 text-xs font-bold uppercase tracking-wider ${selected === category.slug ? 'border-black bg-black text-white' : 'border-black/20 bg-white'}`}>{category.name}</Link>)}
        </div>
        {visibleProducts.length > 0 ? <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product.code} product={product} />)}</div> : <div className="border border-black/20 bg-white px-6 py-20 text-center"><p className="text-2xl font-black uppercase">Sản phẩm đang được bổ sung</p><p className="mt-3 text-sm text-neutral-500">Danh mục này đã sẵn sàng trong hệ thống quản trị.</p></div>}
      </section>
    </main>
  );
}
