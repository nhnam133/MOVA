'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, Minus, Plus, Search, ShoppingBag, Trash2, UserRound } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatMoney } from '@/lib/catalog';
import { useCart } from './cart-provider';

export function SiteHeader() {
  const { items, itemCount, isCartOpen, setCartOpen, updateQuantity, removeItem, catalog } = useCart();
  const rows = items.flatMap((item) => {
    const product = catalog.find((entry) => entry.slug === item.productSlug);
    const variant = product?.variants.find((entry) => entry.sku === item.sku);
    return product && variant ? [{ item, product, variant }] : [];
  });
  const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/15 bg-[#f7f7f2]/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between px-4 sm:px-8 lg:px-12">
          <button className="inline-flex h-10 w-10 items-center justify-center lg:hidden" aria-label="Mở menu"><Menu className="h-5 w-5" /></button>
          <Link href="/" className="group flex items-end gap-2" aria-label="MOVA - Trang chủ"><span className="text-[30px] font-black leading-none tracking-[-0.08em]">MOVA</span><span className="mb-0.5 h-2.5 w-2.5 bg-[#eaff2f] transition-transform group-hover:rotate-45" /></Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex" aria-label="Điều hướng chính">
            <Link href="/#san-pham" className="transition-opacity hover:opacity-55">Sản phẩm</Link><Link href="/#danh-muc" className="transition-opacity hover:opacity-55">Danh mục</Link><Link href="/#mova-club" className="transition-opacity hover:opacity-55">MOVA Club</Link><Link href="/#cau-chuyen" className="transition-opacity hover:opacity-55">Câu chuyện</Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="hidden h-10 w-10 items-center justify-center sm:inline-flex" aria-label="Tìm kiếm"><Search className="h-5 w-5" /></button>
            <Link href="/tai-khoan" className="hidden h-10 w-10 items-center justify-center sm:inline-flex" aria-label="Tài khoản"><UserRound className="h-5 w-5" /></Link>
            <button onClick={() => setCartOpen(true)} className="relative inline-flex h-10 items-center gap-2 border border-black bg-black px-3 text-xs font-bold uppercase tracking-wider text-white sm:px-4" aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}>
              <ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">Giỏ hàng</span><span className="flex h-5 min-w-5 items-center justify-center bg-[#eaff2f] px-1 text-[10px] text-black">{itemCount}</span>
            </button>
          </div>
        </div>
      </header>

      <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-full flex-col border-l border-black bg-[#f7f7f2] p-0 sm:max-w-md">
          <SheetHeader className="border-b border-black px-6 py-6 text-left"><SheetTitle className="text-2xl font-black uppercase tracking-tight">Giỏ hàng ({itemCount})</SheetTitle><SheetDescription>Kiểm tra sản phẩm trước khi thanh toán.</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto px-6">
            {rows.length === 0 ? <div className="flex h-full min-h-72 flex-col items-center justify-center text-center"><ShoppingBag className="mb-4 h-9 w-9" /><p className="font-bold">Giỏ hàng đang trống</p><p className="mt-2 text-sm text-neutral-500">Chọn sản phẩm phù hợp để bắt đầu.</p></div> : rows.map(({ item, product, variant }) => (
              <div key={item.sku} className="grid grid-cols-[82px_1fr] gap-4 border-b border-black/15 py-5">
                <div className="relative aspect-[3/4] overflow-hidden bg-white"><Image src={product.image} alt={product.name} fill className="object-cover" sizes="82px" /></div>
                <div className="flex flex-col justify-between"><div className="flex justify-between gap-3"><div><p className="font-bold">{product.name}</p><p className="mt-1 text-xs text-neutral-500">{variant.color} / {variant.size}</p></div><button onClick={() => removeItem(item.sku)} aria-label={`Xóa ${product.name}`}><Trash2 className="h-4 w-4" /></button></div><div className="flex items-end justify-between"><div className="flex items-center border border-black"><button className="p-2" onClick={() => updateQuantity(item.sku, item.quantity - 1)} aria-label="Giảm số lượng"><Minus className="h-3 w-3" /></button><span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span><button className="p-2" onClick={() => updateQuantity(item.sku, item.quantity + 1)} aria-label="Tăng số lượng"><Plus className="h-3 w-3" /></button></div><p className="text-sm font-black">{formatMoney(product.price * item.quantity)}</p></div></div>
              </div>
            ))}
          </div>
          <div className="border-t border-black bg-white p-6"><div className="mb-4 flex justify-between"><span className="text-sm">Tạm tính</span><span className="font-black">{formatMoney(subtotal)}</span></div><p className="mb-5 text-xs text-neutral-500">Phí vận chuyển và voucher được tính ở bước thanh toán.</p><Link href="/gio-hang" onClick={() => setCartOpen(false)} className={`flex h-13 items-center justify-center bg-black text-sm font-black uppercase tracking-wider text-white ${rows.length === 0 ? 'pointer-events-none opacity-40' : ''}`}>Xem giỏ hàng</Link></div>
        </SheetContent>
      </Sheet>
    </>
  );
}
