'use client';

import Image from 'next/image';
import Link from '@/components/store/link';
import { useState } from 'react';
import {
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

const navigation = [
  ['Sản phẩm', '/san-pham'],
  ['Áo thun', '/san-pham?danh-muc=ao-thun-the-thao'],
  ['Áo chạy bộ', '/san-pham?danh-muc=ao-chay-bo'],
  ['Quần short', '/san-pham?danh-muc=quan-short'],
  ['Quần jogger', '/san-pham?danh-muc=quan-jogger'],
  ['Set thể thao', '/san-pham?danh-muc=set-the-thao'],
  ['MOVA Club', '/#mova-club'],
  ['Liên hệ', '/lien-he'],
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
            className="group flex shrink-0 items-end gap-2"
            aria-label="MOVA - Trang chủ"
          >
            <span className="text-[31px] font-black italic leading-none tracking-[-0.09em]">
              MOVA
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
          className="hidden border-t border-black/5 lg:block"
          aria-label="Điều hướng chính"
        >
          <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-12">
            {navigation.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="py-3 text-sm font-semibold underline-offset-8 transition hover:underline"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="w-[88%] max-w-sm border-r border-black bg-white p-0 [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu MOVA</SheetTitle>
            <SheetDescription>Danh mục sản phẩm và tài khoản</SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <span className="text-2xl font-black italic tracking-[-0.08em]">
              MOVA
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black text-white"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form
            action="/san-pham"
            className="m-6 flex h-12 items-center rounded-full border border-black/15 bg-[#f4f4f0] px-4"
          >
            <Search className="h-4 w-4" />
            <input
              name="q"
              aria-label="Tìm sản phẩm"
              placeholder="Tìm sản phẩm"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            />
          </form>
          <nav
            className="divide-y divide-black/10 border-y border-black/10"
            aria-label="Menu di động"
          >
            {navigation.map(([label, href]) => (
              <Link
                onClick={() => setMenuOpen(false)}
                key={href}
                href={href}
                className="block px-6 py-4 text-lg font-bold transition hover:bg-[#dfff00]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            onClick={() => setMenuOpen(false)}
            href="/tai-khoan"
            className="mx-6 mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-black text-sm font-bold text-white"
          >
            <UserRound className="h-4 w-4" />
            Tài khoản của tôi
          </Link>
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
            {rows.length === 0 ? (
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
