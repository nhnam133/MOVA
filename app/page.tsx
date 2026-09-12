import Image from 'next/image';
import Link from '@/components/store/link';
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Gift,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';
import { getCatalogCategories, getCatalogProducts } from '@/lib/catalog-server';

export default async function Home() {
  const [products, visibleCategories] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);
  const categories = visibleCategories.filter((category) =>
    products.some((product) => product.categorySlug === category.slug),
  );
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f6f2]">
      <AnnouncementBar />
      <SiteHeader />

      <section className="mx-auto max-w-[1600px] p-3 sm:p-5">
        <div className="grid overflow-hidden rounded-[22px] bg-[#101010] text-white md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#dfff00]">
              HAUVIE · Thời trang thể thao
            </p>
            <div>
              <h1 className="mt-6 text-[clamp(2.75rem,4.5vw,4.75rem)] font-black leading-[1.1] tracking-[-0.045em]">
                Thoải mái vận động.
                <br />
                <span className="text-[#dfff00]">Tự tin mỗi ngày.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-white/75">
                Từ buổi tập đến những ngày năng động. Tìm trang phục phù hợp với
                nhịp sống của bạn.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/san-pham"
                  className="inline-flex h-13 items-center gap-5 rounded-full bg-[#dfff00] px-6 text-sm font-black text-black transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3"
                >
                  Mua sắm ngay <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#danh-muc"
                  className="inline-flex h-13 items-center rounded-full border border-white/40 px-6 text-sm font-bold transition hover:bg-white hover:text-black"
                >
                  Khám phá danh mục
                </Link>
              </div>
            </div>
            <p className="mt-10 text-sm text-white/60">
              Khám phá {categories.length} nhóm sản phẩm dành cho bạn.
            </p>
          </div>
          <div className="relative aspect-[4/3] min-h-0 bg-[#ececea] md:aspect-auto md:min-h-[520px]">
            <Image
              src="/products/qsg01-1.avif"
              alt="Quần short thể thao HAUVIE trong bộ sưu tập"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 divide-x divide-y divide-black/10 px-4 sm:px-8 lg:grid-cols-4 lg:divide-y-0 lg:px-12">
          {[
            [Truck, 'Giao hàng toàn quốc', '30.000đ · Freeship từ 499K'],
            [RotateCcw, 'Đổi hàng 72 giờ', 'Tính từ lúc nhận thực tế'],
            [ShieldCheck, 'Thanh toán an toàn', 'COD hoặc MoMo UAT'],
            [Gift, 'Tích điểm HAUVIE', '10.000đ tiền hàng = 1 điểm'],
          ].map(([Icon, title, copy]) => {
            const FeatureIcon = Icon as typeof Truck;
            return (
              <div
                key={title as string}
                className="flex min-h-28 items-center gap-4 px-3 py-6 sm:px-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dfff00]">
                  <FeatureIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold">{title as string}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {copy as string}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="danh-muc"
        className="mx-auto max-w-[1480px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">Danh mục HAUVIE</p>
            <h2 className="section-title">
              Chọn cách bạn
              <br />
              chuyển động
            </h2>
          </div>
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 text-sm font-black"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-6">
          {categories.map((category, index) => {
            const sample = products.find(
              (product) => product.categorySlug === category.slug,
            );
            return (
              <Link
                href={`/san-pham?danh-muc=${category.slug}`}
                key={category.slug}
                className="group min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:border-black"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  {sample ? (
                    <Image
                      src={sample.image}
                      alt={category.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.025]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#eceee7] px-3 text-center">
                      <span className="text-5xl font-black tracking-tight text-black/20">
                        0{index + 1}
                      </span>
                      <span className="text-sm font-medium text-neutral-600">
                        Đang bổ sung sản phẩm
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex min-h-20 items-center justify-between gap-2 p-4">
                  <h3 className="text-base font-bold">{category.name}</h3>
                  <ChevronRight className="h-5 w-5 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker">Ưu đãi đặc biệt</p>
              <h2 className="section-title">Sẵn sàng bứt phá</h2>
            </div>
            <Link
              href="/san-pham?sort=moi-nhat"
              className="inline-flex items-center gap-2 text-sm font-black"
            >
              Xem bộ sưu tập <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.code} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/10 p-16 text-center">
              Sản phẩm đang được bổ sung.
            </div>
          )}
        </div>
      </section>

      <section
        id="hauvie-club"
        className="mx-auto max-w-[1480px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="grid overflow-hidden rounded-[26px] bg-black text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[500px]">
            <Image
              src="/products/atg02-1.avif"
              alt="Áo thể thao HAUVIE"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="hauvie-grid flex flex-col justify-between p-7 sm:p-12 lg:p-16">
            <div>
              <p className="section-kicker text-[#dfff00]">
                Dành riêng cho bạn
              </p>
              <h2 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                Càng chuyển động,
                <br />
                càng nhiều ưu đãi.
              </h2>
            </div>
            <div className="mt-20 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#dfff00] p-6 text-black">
                <p className="text-xs font-extrabold uppercase tracking-wider">
                  HAUVIE Club
                </p>
                <p className="mt-8 text-4xl font-black">100 điểm</p>
                <p className="mt-1 text-sm">Đổi voucher 20.000đ</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
                <Clock3 className="h-5 w-5 text-[#dfff00]" />
                <p className="mt-8 text-xl font-black">Hiệu lực 30 ngày</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Dùng một lần cho đơn từ 200.000đ.
                </p>
              </div>
            </div>
            <Link
              href="/tai-khoan"
              className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-black text-[#dfff00]"
            >
              Xem điểm và voucher <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#dfff00] py-16 sm:py-20">
        <div className="mx-auto flex max-w-[1384px] flex-col items-start justify-between gap-7 px-4 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              HAUVIE / Performance wear
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-none tracking-[-0.055em] sm:text-6xl">
              Mặc thoải mái.
              <br />
              Chuyển động tự tin.
            </h2>
          </div>
          <Link
            href="/san-pham"
            className="inline-flex h-14 shrink-0 items-center gap-5 rounded-full bg-black px-7 text-sm font-black text-white"
          >
            Khám phá HAUVIE <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
