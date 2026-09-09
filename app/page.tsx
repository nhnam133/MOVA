import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, ChevronRight, Clock3, Gift, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';
import { categories } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/catalog-server';

const categoryVisuals = [
  { image: '/products/atg01-1.avif', className: 'md:col-span-2 md:row-span-2' },
  { image: '/products/atg02-1.avif', className: '' },
  { image: '/products/qsg01-1.avif', className: '' },
  { image: '/products/qsg02-1.avif', className: '' },
  { image: '/products/atg03-1.avif', className: '' },
];

export default async function Home() {
  const products = await getCatalogProducts();
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f6f2]">
      <AnnouncementBar />
      <SiteHeader />

      <section className="mx-auto max-w-[1600px] p-3 sm:p-5">
        <div className="relative min-h-[660px] overflow-hidden rounded-[26px] bg-black text-white sm:min-h-[720px]">
          <Image src="/products/qsg01-1.avif" alt="Trang phục thể thao MOVA" fill priority className="object-cover object-center opacity-80" sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.52)_48%,rgba(0,0,0,.12)_100%)]" />
          <div className="relative z-10 flex min-h-[660px] max-w-3xl flex-col justify-between px-6 py-9 sm:min-h-[720px] sm:px-12 sm:py-14 lg:px-20 lg:py-20">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#dfff00]" />Bộ sưu tập chuyển động 2026</div>
            <div>
              <h1 className="text-[clamp(4.5rem,10vw,9rem)] font-black italic uppercase leading-[0.78] tracking-[-0.09em]">Move<br />your<br /><span className="text-[#dfff00]">way.</span></h1>
              <p className="mt-8 max-w-lg text-base leading-7 text-white/75 sm:text-lg">Thoải mái để tập trung. Linh hoạt để bứt phá. MOVA đồng hành trong mọi chuyển động của bạn.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href="/san-pham" className="inline-flex h-13 items-center gap-5 rounded-full bg-[#dfff00] px-6 text-sm font-black text-black transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3">Mua sắm ngay <ArrowRight className="h-4 w-4" /></Link><Link href="#danh-muc" className="inline-flex h-13 items-center rounded-full border border-white/40 px-6 text-sm font-bold transition hover:bg-white hover:text-black">Khám phá danh mục</Link></div>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-white/65"><span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#dfff00]" />Sản phẩm demo có thể chỉnh sửa</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#dfff00]" />COD & MoMo UAT</span></div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 divide-x divide-y divide-black/10 px-4 sm:px-8 lg:grid-cols-4 lg:divide-y-0 lg:px-12">
          {[[Truck, 'Giao hàng toàn quốc', '30.000đ · Freeship từ 499K'], [RotateCcw, 'Đổi hàng 72 giờ', 'Tính từ lúc nhận thực tế'], [ShieldCheck, 'Thanh toán an toàn', 'COD hoặc MoMo UAT'], [Gift, 'Tích điểm MOVA', '10.000đ tiền hàng = 1 điểm']].map(([Icon, title, copy]) => { const FeatureIcon = Icon as typeof Truck; return <div key={title as string} className="flex min-h-28 items-center gap-4 px-3 py-6 sm:px-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dfff00]"><FeatureIcon className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">{title as string}</p><p className="mt-1 text-xs leading-5 text-neutral-500">{copy as string}</p></div></div>; })}
        </div>
      </section>

      <section id="danh-muc" className="mx-auto max-w-[1480px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-kicker">Danh mục MOVA</p><h2 className="section-title">Chọn cách bạn<br />chuyển động</h2></div><Link href="/san-pham" className="inline-flex items-center gap-2 text-sm font-black">Xem tất cả <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid auto-rows-[280px] gap-4 md:grid-cols-4">
          {categories.map((category, index) => <Link href={`/san-pham?danh-muc=${category.slug}`} key={category.slug} className={`group relative overflow-hidden rounded-[20px] bg-neutral-200 ${categoryVisuals[index].className}`}><Image src={categoryVisuals[index].image} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" sizes="(max-width: 768px) 100vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-6"><div><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#dfff00]">0{index + 1}</span><h3 className="mt-1 text-xl font-black sm:text-2xl">{category.name}</h3></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1"><ChevronRight className="h-5 w-5" /></span></div></Link>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-neutral-500">Một số danh mục đang dùng hình minh họa và sẽ được cập nhật khi có ảnh đúng nhóm.</p>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-kicker">Ưu đãi đặc biệt</p><h2 className="section-title">Sẵn sàng bứt phá</h2></div><Link href="/san-pham?sort=moi-nhat" className="inline-flex items-center gap-2 text-sm font-black">Xem bộ sưu tập <ArrowRight className="h-4 w-4" /></Link></div>
          {products.length > 0 ? <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.code} product={product} />)}</div> : <div className="rounded-2xl border border-black/10 p-16 text-center">Sản phẩm đang được bổ sung.</div>}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid overflow-hidden rounded-[26px] bg-black text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[500px]"><Image src="/products/atg02-1.avif" alt="Áo thể thao MOVA" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /></div>
          <div className="mova-grid flex flex-col justify-between p-7 sm:p-12 lg:p-16"><div><p className="section-kicker text-[#dfff00]">Dành riêng cho bạn</p><h2 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">Càng chuyển động,<br />càng nhiều ưu đãi.</h2></div><div className="mt-20 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#dfff00] p-6 text-black"><p className="text-xs font-extrabold uppercase tracking-wider">MOVA Club</p><p className="mt-8 text-4xl font-black">100 điểm</p><p className="mt-1 text-sm">Đổi voucher 20.000đ</p></div><div className="rounded-2xl border border-white/15 bg-white/5 p-6"><Clock3 className="h-5 w-5 text-[#dfff00]" /><p className="mt-8 text-xl font-black">Hiệu lực 30 ngày</p><p className="mt-2 text-sm leading-6 text-white/55">Dùng một lần cho đơn từ 200.000đ.</p></div></div><Link href="/tai-khoan" className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-black text-[#dfff00]">Xem điểm và voucher <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="bg-[#dfff00] py-16 sm:py-20">
        <div className="mx-auto flex max-w-[1384px] flex-col items-start justify-between gap-7 px-4 sm:flex-row sm:items-center sm:px-8"><div><p className="text-xs font-black uppercase tracking-[0.2em]">MOVA / Performance wear</p><h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-none tracking-[-0.055em] sm:text-6xl">Mặc thoải mái.<br />Chuyển động tự tin.</h2></div><Link href="/san-pham" className="inline-flex h-14 shrink-0 items-center gap-5 rounded-full bg-black px-7 text-sm font-black text-white">Khám phá MOVA <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <SiteFooter />
    </main>
  );
}
