'use client';

import Image from 'next/image';
import Link from '@/components/store/link';
import { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatMoney } from '@/lib/catalog';
import { useCart } from './cart-provider';

type MegaLink = {
  label: string;
  href: string;
  categorySlug?: string;
};

type MegaNavigationItem = {
  label: string;
  href: string;
  accent?: 'blue' | 'lime';
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{ title: string; links: MegaLink[] }>;
};

const categoryLink = (
  label: string,
  categorySlug: string,
  gender?: 'male' | 'female' | 'unisex',
): MegaLink => ({
  label,
  categorySlug,
  href: `/san-pham?danh-muc=${categorySlug}${gender ? `&gender=${gender}` : ''}`,
});

const megaNavigation: MegaNavigationItem[] = [
  {
    label: 'Mới',
    href: '/san-pham?sort=moi-nhat',
    accent: 'blue',
    eyebrow: 'HAUVIE / Mới nhất',
    title: 'Khởi động phong cách mới',
    description:
      'Khám phá toàn bộ sản phẩm vừa cập nhật và chọn nhanh theo đối tượng.',
    sections: [
      {
        title: 'Khám phá',
        links: [
          { label: 'Sản phẩm mới', href: '/san-pham?sort=moi-nhat' },
          { label: 'Tất cả sản phẩm', href: '/san-pham' },
          { label: 'Dành cho nam', href: '/san-pham?gender=male' },
          { label: 'Dành cho nữ', href: '/san-pham?gender=female' },
        ],
      },
      {
        title: 'Trang phục nổi bật',
        links: [
          categoryLink('Áo thun thể thao', 'ao-thun-the-thao'),
          categoryLink('Áo chạy bộ', 'ao-chay-bo'),
          categoryLink('Quần short', 'quan-short'),
          categoryLink('Áo polo', 'ao-polo'),
        ],
      },
    ],
  },
  {
    label: 'Nam',
    href: '/san-pham?gender=male',
    eyebrow: 'HAUVIE / Nam',
    title: 'Trang phục nam năng động',
    description:
      'Các thiết kế dễ phối cho tập luyện, di chuyển và mặc hằng ngày.',
    sections: [
      {
        title: 'Áo nam',
        links: [
          { label: 'Tất cả sản phẩm nam', href: '/san-pham?gender=male' },
          categoryLink('Áo thun', 'ao-thun-the-thao', 'male'),
          categoryLink('Áo chạy bộ', 'ao-chay-bo', 'male'),
          categoryLink('Áo polo', 'ao-polo', 'male'),
          categoryLink('Áo sơ mi', 'ao-so-mi', 'male'),
        ],
      },
      {
        title: 'Quần nam',
        links: [categoryLink('Quần short', 'quan-short', 'male')],
      },
    ],
  },
  {
    label: 'Nữ',
    href: '/san-pham?gender=female',
    eyebrow: 'HAUVIE / Nữ',
    title: 'Tự tin trong từng chuyển động',
    description:
      'Phom dáng linh hoạt cho buổi tập và nhịp sống năng động mỗi ngày.',
    sections: [
      {
        title: 'Áo nữ',
        links: [
          categoryLink('Áo thun', 'ao-thun-the-thao', 'female'),
          categoryLink('Áo polo', 'ao-polo', 'female'),
          categoryLink('Áo dài tay', 'ao-dai-tay', 'female'),
        ],
      },
      {
        title: 'Quần & váy',
        links: [
          categoryLink('Quần short', 'quan-short', 'female'),
          categoryLink('Quần legging', 'quan-legging', 'female'),
          categoryLink('Váy thể thao', 'vay-the-thao', 'female'),
        ],
      },
    ],
  },
  {
    label: 'Thể thao',
    href: '/san-pham?danh-muc=ao-chay-bo',
    eyebrow: 'HAUVIE / Performance',
    title: 'Sẵn sàng bứt phá',
    description:
      'Những lựa chọn ưu tiên sự thoáng nhẹ và thoải mái khi vận động.',
    sections: [
      {
        title: 'Trang phục tập luyện',
        links: [
          categoryLink('Áo chạy bộ', 'ao-chay-bo'),
          categoryLink('Áo thun thể thao', 'ao-thun-the-thao'),
          categoryLink('Quần short', 'quan-short'),
          categoryLink('Quần legging', 'quan-legging'),
          categoryLink('Váy thể thao', 'vay-the-thao'),
        ],
      },
      {
        title: 'Chọn nhanh',
        links: [
          { label: 'Đồ thể thao nam', href: '/san-pham?gender=male' },
          { label: 'Đồ thể thao nữ', href: '/san-pham?gender=female' },
          { label: 'Xem toàn bộ', href: '/san-pham' },
        ],
      },
    ],
  },
  {
    label: 'Phụ kiện',
    href: '/san-pham?danh-muc=tui',
    eyebrow: 'HAUVIE / Phụ kiện',
    title: 'Hoàn thiện buổi tập',
    description: 'Các món nhỏ gọn, dễ dùng và đồng hành cùng mọi hoạt động.',
    sections: [
      {
        title: 'Tất cả phụ kiện',
        links: [
          categoryLink('Túi', 'tui'),
          categoryLink('Găng tay dài', 'gang-tay-dai'),
          categoryLink('Khẩu trang', 'khau-trang'),
          categoryLink('Tất', 'tat'),
        ],
      },
      {
        title: 'Khám phá thêm',
        links: [
          { label: 'Sản phẩm mới', href: '/san-pham?sort=moi-nhat' },
          { label: 'Tất cả sản phẩm', href: '/san-pham' },
        ],
      },
    ],
  },
  {
    label: 'HAUVIE Club',
    href: '/#hauvie-club',
    accent: 'lime',
    eyebrow: 'Thành viên HAUVIE',
    title: 'Tích điểm, nhận ưu đãi',
    description:
      'Theo dõi điểm, đổi voucher và quản lý quyền lợi ngay trong tài khoản.',
    sections: [
      {
        title: 'Quyền lợi thành viên',
        links: [
          { label: 'Xem điểm & voucher', href: '/tai-khoan' },
          { label: 'Đơn hàng của tôi', href: '/tai-khoan' },
          { label: 'Chính sách đổi hàng', href: '/chinh-sach/doi-hang' },
        ],
      },
    ],
  },
];

export function AnnouncementBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-[#dfff00] px-4 py-2 text-center text-xs font-semibold text-black sm:text-sm">
      <span>Miễn phí vận chuyển cho đơn từ 499.000đ</span>
      <Link
        href="/chinh-sach/doi-hang"
        className="hidden underline-offset-4 hover:underline sm:inline"
      >
        Hỗ trợ đổi hàng trong 72 giờ →
      </Link>
    </div>
  );
}

export function SiteHeader() {
  const {
    items,
    itemCount,
    hydrated,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    catalog,
    signedIn,
  } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const rows = items.flatMap((item) => {
    const product = catalog.find((entry) => entry.slug === item.productSlug);
    const variant = product?.variants.find((entry) => entry.sku === item.sku);
    return product && variant ? [{ item, product, variant }] : [];
  });
  const subtotal = rows.reduce(
    (sum, row) => sum + row.product.price * row.item.quantity,
    0,
  );
  const categoryLinks = Array.from(
    new Map(catalog.map((product) => [product.categorySlug, product.category])),
  ).map(([slug, name]) => [name, `/san-pham?danh-muc=${slug}`]);
  const availableCategorySlugs = new Set(
    catalog.map((product) => product.categorySlug),
  );
  const visibleMegaNavigation = megaNavigation.map((item) => ({
    ...item,
    sections: item.sections
      .map((section) => ({
        ...section,
        links: section.links.filter(
          (link) =>
            !link.categorySlug || availableCategorySlugs.has(link.categorySlug),
        ),
      }))
      .filter((section) => section.links.length > 0),
  }));
  const mobileNavigation = [
    ['Tất cả sản phẩm', '/san-pham'],
    ...categoryLinks,
    ['HAUVIE Club', '/#hauvie-club'],
    ['Liên hệ', '/lien-he'],
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-[0_4px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-[1480px] flex-wrap items-center gap-2 px-4 py-3 sm:gap-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="group flex min-h-11 shrink-0 items-center gap-2 px-1 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="HAUVIE - Trang chủ"
          >
            <span className="text-[31px] font-black italic leading-none tracking-[-0.09em]">
              HAUVIE
            </span>
            <span className="mb-0.5 h-2.5 w-2.5 rounded-sm bg-[#dfff00] transition-transform group-hover:rotate-45" />
          </Link>
          <form
            action="/san-pham"
            className="order-last flex h-11 w-full min-w-0 items-center rounded-full border border-black/15 bg-neutral-50 pl-4 focus-within:border-black md:order-none md:mx-auto md:w-auto md:max-w-xl md:flex-1"
          >
            <input
              name="q"
              aria-label="Tìm sản phẩm"
              placeholder="Tìm áo, quần, đồ thể thao…"
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500 focus-visible:outline-none"
            />
            <button
              type="submit"
              className="flex h-11 w-12 shrink-0 items-center justify-center rounded-full hover:bg-[#dfff00]"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link
              href="/tai-khoan"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/20 bg-white px-3 text-sm font-bold transition hover:border-black hover:bg-[#dfff00] sm:px-5"
            >
              <UserRound className="hidden h-5 w-5 min-[380px]:block" />
              <span>{signedIn ? 'Tài khoản' : 'Đăng nhập'}</span>
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-black px-3.5 text-xs font-extrabold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfff00] sm:px-5"
              aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dfff00] px-1 text-[10px] text-black">
                {itemCount}
              </span>
            </button>
          </div>
        </div>
        <nav
          className="relative hidden border-t border-black/10 lg:block"
          aria-label="Điều hướng chính"
        >
          <ul className="mx-auto flex h-14 max-w-[1180px] items-stretch justify-between px-8">
            {visibleMegaNavigation.map((item) => (
              <li key={item.label} className="group static flex items-stretch">
                <Link
                  href={item.href}
                  aria-haspopup="true"
                  className={`relative flex min-w-24 items-center justify-center gap-1.5 px-4 text-[15px] font-black uppercase tracking-[-0.02em] transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${
                    item.accent === 'blue'
                      ? 'text-[#2848d8]'
                      : item.accent === 'lime'
                        ? 'text-black'
                        : 'text-black'
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                  <span
                    className={`absolute inset-x-4 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none ${
                      item.accent === 'blue' ? 'bg-[#2848d8]' : 'bg-[#dfff00]'
                    }`}
                    aria-hidden="true"
                  />
                </Link>
                <div className="pointer-events-none invisible absolute inset-x-0 top-full z-50 translate-y-1 border-y border-black/10 bg-white opacity-0 shadow-[0_28px_70px_rgba(0,0,0,0.14)] transition duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none">
                  <div className="mx-auto grid max-w-[1480px] grid-cols-[minmax(280px,0.9fr)_2fr] gap-14 px-12 py-10">
                    <div className="border-r border-black/10 pr-12">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                        {item.eyebrow}
                      </p>
                      <p className="mt-4 max-w-sm text-3xl font-black uppercase leading-[1.04] tracking-[-0.05em]">
                        {item.title}
                      </p>
                      <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500">
                        {item.description}
                      </p>
                      <Link
                        href={item.href}
                        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white transition hover:bg-[#dfff00] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Xem bộ sưu tập
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                    <div
                      className={`grid gap-x-12 gap-y-8 ${
                        item.sections.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {item.sections.map((section) => (
                        <div key={section.title}>
                          <p className="flex items-center gap-3 text-sm font-black uppercase">
                            {section.title}
                            <ArrowRight
                              className="h-4 w-4 text-[#2848d8]"
                              aria-hidden="true"
                            />
                          </p>
                          <div className="mt-5 grid gap-1">
                            {section.links.map((link) => (
                              <Link
                                key={`${item.label}-${link.label}`}
                                href={link.href}
                                className="flex min-h-10 items-center rounded-lg px-3 text-[15px] font-medium text-neutral-600 transition hover:bg-[#efffb3] hover:text-black focus-visible:bg-[#efffb3] focus-visible:text-black focus-visible:outline-2 focus-visible:outline-offset-1"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="h-dvh max-h-dvh w-[88%] max-w-sm gap-0 overflow-hidden border-r border-black bg-white p-0 [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu HAUVIE</SheetTitle>
            <SheetDescription>Danh mục sản phẩm và tài khoản</SheetDescription>
          </SheetHeader>
          <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-5">
            <span className="text-2xl font-black italic tracking-[-0.08em]">
              HAUVIE
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfff00]"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form
            action="/san-pham"
            className="m-6 mb-4 flex h-12 shrink-0 items-center rounded-full border border-black/15 bg-[#f4f4f0] px-4 focus-within:border-black"
          >
            <Search className="h-4 w-4" />
            <input
              name="q"
              aria-label="Tìm sản phẩm"
              placeholder="Tìm sản phẩm"
              className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none"
            />
          </form>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <nav
              className="divide-y divide-black/10 border-y border-black/10"
              aria-label="Menu di động"
            >
              {mobileNavigation.map(([label, href]) => (
                <Link
                  onClick={() => setMenuOpen(false)}
                  key={href}
                  href={href}
                  className="block min-h-14 px-6 py-4 text-lg font-bold transition hover:bg-[#dfff00] focus-visible:bg-[#dfff00] focus-visible:outline-none"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <Link
              onClick={() => setMenuOpen(false)}
              href="/tai-khoan"
              className="mx-6 mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-black text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfff00]"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {signedIn ? 'Tài khoản của tôi' : 'Đăng nhập / Đăng ký'}
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-full flex-col border-l border-black bg-[#f7f7f2] p-0 sm:max-w-md">
          <SheetHeader className="border-b border-black px-6 py-6 text-left">
            <SheetTitle className="text-2xl font-black uppercase tracking-tight">
              Giỏ hàng ({itemCount})
            </SheetTitle>
            <SheetDescription>
              Kiểm tra sản phẩm trước khi thanh toán.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6">
            {!hydrated ? (
              <div className="space-y-5 py-6" aria-busy="true">
                <span className="sr-only" aria-live="polite">
                  Đang tải giỏ hàng
                </span>
                {[1, 2].map((item) => (
                  <div key={item} className="grid grid-cols-[82px_1fr] gap-4">
                    <div className="aspect-[3/4] animate-pulse rounded-lg bg-black/10 motion-reduce:animate-none" />
                    <div className="space-y-3 py-1">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-black/10 motion-reduce:animate-none" />
                      <div className="h-3 w-2/5 animate-pulse rounded bg-black/10 motion-reduce:animate-none" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
                <ShoppingBag className="mb-4 h-9 w-9" />
                <p className="font-bold">Giỏ hàng đang trống</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Chọn sản phẩm phù hợp để bắt đầu.
                </p>
              </div>
            ) : (
              rows.map(({ item, product, variant }) => (
                <div
                  key={item.sku}
                  className="grid grid-cols-[82px_1fr] gap-4 border-b border-black/15 py-5"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="82px"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {variant.color} / {variant.size}
                        </p>
                      </div>
                      <button
                        className="cursor-pointer"
                        onClick={() => removeItem(item.sku)}
                        aria-label={`Xóa ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex items-center rounded-full border border-black">
                        <button
                          className="cursor-pointer p-2"
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity - 1)
                          }
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          className="cursor-pointer p-2"
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity + 1)
                          }
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-black">
                        {formatMoney(product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-black bg-white p-6">
            <div className="mb-4 flex justify-between">
              <span className="text-sm">Tạm tính</span>
              <span className="font-black">{formatMoney(subtotal)}</span>
            </div>
            <p className="mb-5 text-xs text-neutral-500">
              Phí vận chuyển và voucher được tính ở bước thanh toán.
            </p>
            <Link
              href="/gio-hang"
              onClick={() => setCartOpen(false)}
              className={`flex h-13 items-center justify-center rounded-full bg-black text-sm font-black uppercase tracking-wider text-white ${rows.length === 0 ? 'pointer-events-none opacity-40' : ''}`}
            >
              Xem giỏ hàng
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
