import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowUpRight, ChevronRight, RotateCcw, ShieldCheck, Truck,
} from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { SiteHeader } from '@/components/store/site-header';
import { categories } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/catalog-server';

export default async function Home() {
  const products = await getCatalogProducts();
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f2]">
      <div className="bg-[#eaff2f] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black sm:text-xs">
        Freeship đơn từ 499K · Đổi size trong 72 giờ
      </div>

      <SiteHeader />

      <section className="bg-black text-white">
        <div className="mova-grid mx-auto grid min-h-[640px] max-w-[1600px] lg:grid-cols-[1.04fr_0.96fr]">
          <div className="flex flex-col justify-between px-5 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#eaff2f]"><span className="h-px w-10 bg-[#eaff2f]" />Bộ sưu tập 2026</div>
            <div className="py-16 lg:py-24">
              <h1 className="max-w-4xl text-[clamp(4rem,10vw,9.5rem)] font-black uppercase leading-[0.78] tracking-[-0.09em]">
                Move<br />Your<br /><span className="text-[#eaff2f]">Way.</span>
              </h1>
              <p className="mt-8 max-w-md text-base leading-7 text-white/65 sm:text-lg">Thiết kế linh hoạt cho từng nhịp chạy, từng buổi tập và mọi chuyển động hằng ngày.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="#san-pham" className="group inline-flex h-14 items-center gap-8 bg-[#eaff2f] px-6 text-sm font-black uppercase tracking-wider text-black">
                Mua ngay<ArrowDownRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
              </Link>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">MOVA / Performance wear</span>
            </div>
          </div>
          <div className="relative min-h-[540px] overflow-hidden border-t border-white/15 lg:border-l lg:border-t-0">
            <Image src="/products/qsg01-1.avif" alt="Quần short thể thao MOVA" fill priority className="object-cover object-center transition-transform duration-700 hover:scale-[1.025]" sizes="(max-width: 1024px) 100vw, 48vw" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 to-transparent p-6 pt-28 sm:p-10">
              <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#eaff2f]">Featured / QSG01</p><p className="mt-2 text-2xl font-bold">Quần short Pace</p></div>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black"><ArrowUpRight className="h-5 w-5" /></span>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-black bg-[#eaff2f] py-3">
        <div className="marquee-track flex w-max items-center text-sm font-black uppercase tracking-[0.15em]">
          {[...Array(2)].map((_, group) => (
            <div className="flex items-center" key={group}>
              {['Chuyển động không giới hạn', 'Thoải mái mỗi ngày', 'Tự tin theo cách của bạn'].map((item) => (
                <span className="flex items-center gap-8 px-8" key={`${group}-${item}`}>{item}<span className="text-lg">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section id="danh-muc" className="mx-auto max-w-[1480px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-5 border-b border-black pb-6">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Tìm đúng chuyển động</p><h2 className="text-4xl font-black uppercase tracking-[-0.055em] sm:text-6xl">Danh mục</h2></div>
          <p className="hidden max-w-xs text-right text-sm leading-6 text-neutral-500 md:block">Năm nhóm sản phẩm cốt lõi. Danh mục mới có thể thêm trong trang quản trị.</p>
        </div>
        <div className="divide-y divide-black border-b border-black">
          {categories.map((category) => (
            <Link href={`/san-pham?danh-muc=${category.slug}`} key={category.slug} className="group grid grid-cols-[52px_1fr_auto] items-center py-5 transition-all hover:bg-black hover:px-5 hover:text-white sm:grid-cols-[90px_1fr_auto] sm:py-7">
              <span className="font-mono text-xs text-neutral-500 group-hover:text-[#eaff2f]">/{category.order}</span><span className="text-2xl font-bold tracking-[-0.035em] sm:text-4xl">{category.name}</span><ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <section id="san-pham" className="border-y border-black bg-white">
        <div className="mx-auto max-w-[1480px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Sản phẩm nổi bật</p><h2 className="text-4xl font-black uppercase tracking-[-0.055em] sm:text-6xl">Ready to move</h2></div>
            <Link href="/san-pham" className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider">Xem tất cả<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => <ProductCard key={product.code} product={product} />)}
          </div>
        </div>
      </section>

      <section id="mova-club" className="bg-black px-4 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1384px] overflow-hidden border border-white/20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[420px] flex-col justify-between bg-[#eaff2f] p-7 text-black sm:p-12">
            <span className="text-xs font-black uppercase tracking-[0.22em]">MOVA Club</span>
            <div><p className="text-[clamp(5rem,12vw,10rem)] font-black leading-none tracking-[-0.1em]">100</p><p className="max-w-sm text-2xl font-bold leading-tight tracking-tight">điểm đổi voucher 20.000đ</p></div>
            <p className="max-w-md text-sm leading-6">Mỗi 10.000đ giá trị sản phẩm = 1 điểm. Đăng nhập để mua hàng, theo dõi điểm và đổi ưu đãi.</p>
          </div>
          <div className="mova-grid flex flex-col justify-between gap-16 p-7 sm:p-12 lg:p-16">
            <h2 className="max-w-2xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">Càng chuyển động,<br /><span className="text-[#eaff2f]">càng nhiều ưu đãi.</span></h2>
            <div className="grid gap-7 sm:grid-cols-3">
              {[['01', 'Mua sắm', 'Nhận điểm khi đơn đã hoàn tất'], ['02', 'Tích điểm', '1 điểm cho mỗi 10.000đ'], ['03', 'Đổi voucher', 'Dùng ngay cho đơn tiếp theo']].map(([num, title, copy]) => (
                <div key={num} className="border-t border-white/25 pt-4"><p className="font-mono text-xs text-[#eaff2f]">/{num}</p><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{copy}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid border-y border-black bg-white sm:grid-cols-3">
        {[[Truck, 'Giao hàng toàn quốc', 'Đồng giá 30.000đ'], [RotateCcw, 'Đổi size trong 72 giờ', 'Tính từ lúc nhận hàng'], [ShieldCheck, 'Thanh toán an toàn', 'COD hoặc MoMo']].map(([Icon, title, copy], index) => {
          const FeatureIcon = Icon as typeof Truck;
          return <div key={title as string} className={`flex gap-5 px-6 py-9 sm:px-8 ${index > 0 ? 'border-t border-black sm:border-l sm:border-t-0' : ''}`}><FeatureIcon className="h-6 w-6 shrink-0" /><div><p className="font-bold">{title as string}</p><p className="mt-1 text-sm text-neutral-500">{copy as string}</p></div></div>;
        })}
      </section>

      <footer id="cau-chuyen" className="bg-[#f7f7f2] px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1384px]">
          <div className="grid gap-10 border-b border-black pb-12 md:grid-cols-[1.2fr_0.8fr]">
            <div><p className="text-5xl font-black tracking-[-0.075em] sm:text-7xl">MOVA<span className="text-[#a7b900]">.</span></p><p className="mt-5 max-w-md text-sm leading-6 text-neutral-500">Thời trang thể thao cho thế hệ luôn tiến về phía trước.</p></div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-3"><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Mua sắm</p><Link href="#san-pham" className="block hover:underline">Sản phẩm</Link><Link href="#danh-muc" className="block hover:underline">Danh mục</Link><Link href="#mova-club" className="block hover:underline">MOVA Club</Link></div>
              <div className="space-y-3"><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Hỗ trợ</p><span className="block">Chính sách đổi size</span><span className="block">Hướng dẫn chọn size</span><span className="block">Liên hệ</span></div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-neutral-500 sm:flex-row"><p>© 2026 MOVA. Dự án thương mại điện tử.</p><p>Designed for movement.</p></div>
        </div>
      </footer>
    </main>
  );
}
