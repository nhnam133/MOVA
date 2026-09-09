import Link from 'next/link';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';
import { categories } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/catalog-server';

type Params = { q?: string; 'danh-muc'?: string; gender?: string; color?: string; size?: string; min?: string; max?: string; sort?: string; page?: string };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('đ', 'd').toLowerCase();

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const products = await getCatalogProducts();
  const params = await searchParams;
  const q = params.q?.trim() ?? '';
  const min = Number(params.min) || 0;
  const max = Number(params.max) || Number.MAX_SAFE_INTEGER;
  let visibleProducts = products.filter((product) => {
    if (q && !normalize(product.name).includes(normalize(q))) return false;
    if (params['danh-muc'] && product.categorySlug !== params['danh-muc']) return false;
    if (params.gender && product.gender !== params.gender) return false;
    if (product.price < min || product.price > max) return false;
    if (params.color && !product.variants.some((variant) => normalize(variant.color) === normalize(params.color!) && (!params.size || variant.size === params.size))) return false;
    if (!params.color && params.size && !product.variants.some((variant) => variant.size === params.size)) return false;
    return true;
  });
  visibleProducts = [...visibleProducts].sort((a, b) => params.sort === 'gia-tang' ? a.price - b.price : params.sort === 'gia-giam' ? b.price - a.price : b.code.localeCompare(a.code));
  const colors = [...new Set(products.flatMap((product) => product.variants.map((variant) => variant.color)))].sort();
  const sizes = [...new Set(products.flatMap((product) => product.variants.map((variant) => variant.size)))];
  const activeName = categories.find((category) => category.slug === params['danh-muc'])?.name;
  const hasFilter = Boolean(q || params['danh-muc'] || params.gender || params.color || params.size || params.min || params.max);
  const field = 'h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-[#dfff00]';

  return (
    <main className="min-h-screen bg-[#f6f6f2]">
      <AnnouncementBar /><SiteHeader />
      <section className="bg-black px-4 py-14 text-white sm:px-8 lg:px-12 lg:py-20"><div className="mx-auto max-w-[1384px]"><p className="section-kicker text-[#dfff00]">MOVA / Catalog</p><h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.07em] sm:text-7xl">{activeName ?? (q ? `Kết quả cho “${q}”` : 'Tất cả sản phẩm')}</h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/55">Lọc đúng màu và size trên cùng một biến thể. Giá và tồn kho được kiểm tra lại khi đặt hàng.</p></div></section>
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
        <form action="/san-pham" className="mb-8 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-black"><SlidersHorizontal className="h-4 w-4" />Tìm kiếm & bộ lọc</p>{hasFilter && <Link href="/san-pham" className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-black"><X className="h-3.5 w-3.5" />Xóa lọc</Link>}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            <label className="relative lg:col-span-2"><span className="sr-only">Tên sản phẩm</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" /><input name="q" defaultValue={q} placeholder="Tên sản phẩm" className={`${field} pl-10`} /></label>
            <label><span className="sr-only">Danh mục</span><select name="danh-muc" defaultValue={params['danh-muc'] ?? ''} className={field}><option value="">Tất cả danh mục</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
            <label><span className="sr-only">Đối tượng</span><select name="gender" defaultValue={params.gender ?? ''} className={field}><option value="">Nam / Nữ / Unisex</option><option value="female">Nữ</option><option value="male">Nam</option><option value="unisex">Unisex</option></select></label>
            <label><span className="sr-only">Màu</span><select name="color" defaultValue={params.color ?? ''} className={field}><option value="">Tất cả màu</option>{colors.map((color) => <option key={color}>{color}</option>)}</select></label>
            <label><span className="sr-only">Size</span><select name="size" defaultValue={params.size ?? ''} className={field}><option value="">Tất cả size</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
            <button className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-black text-white transition hover:bg-neutral-800"><Filter className="h-4 w-4" />Áp dụng</button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:max-w-2xl"><label><span className="sr-only">Giá tối thiểu</span><input name="min" defaultValue={params.min ?? ''} type="number" min="0" step="1000" placeholder="Giá từ" className={field} /></label><label><span className="sr-only">Giá tối đa</span><input name="max" defaultValue={params.max ?? ''} type="number" min="0" step="1000" placeholder="Giá đến" className={field} /></label><label><span className="sr-only">Sắp xếp</span><select name="sort" defaultValue={params.sort ?? 'moi-nhat'} className={field}><option value="moi-nhat">Mới nhất</option><option value="gia-tang">Giá tăng dần</option><option value="gia-giam">Giá giảm dần</option></select></label></div>
        </form>
        <div className="mb-7 flex items-center justify-between"><p className="text-sm text-neutral-500"><b className="text-black">{visibleProducts.length}</b> sản phẩm phù hợp</p></div>
        {visibleProducts.length > 0 ? <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">{visibleProducts.slice(0, 12).map((product) => <ProductCard key={product.code} product={product} />)}</div> : <div className="rounded-2xl border border-black/10 bg-white px-6 py-20 text-center"><p className="text-2xl font-black uppercase">Không tìm thấy sản phẩm</p><p className="mt-3 text-sm text-neutral-500">Thử bỏ bớt điều kiện hoặc tìm bằng từ khóa khác.</p><Link href="/san-pham" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Xem tất cả sản phẩm</Link></div>}
      </section>
      <SiteFooter />
    </main>
  );
}
