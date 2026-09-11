import Link from '@/components/store/link';
import { ArrowUpRight, MapPin } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-[#111] text-white">
      <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-5xl font-black italic tracking-[-0.08em] sm:text-7xl">
              MOVA<span className="text-[#dfff00]">.</span>
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
              Trang phục thể thao trẻ trung cho từng nhịp chạy, buổi tập và
              chuyển động hằng ngày.
            </p>
            <Link
              href="/lien-he"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#dfff00]"
            >
              Liên hệ với MOVA <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm lg:col-span-2 lg:grid-cols-3">
            <div className="space-y-3">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                Mua sắm
              </p>
              <Link href="/san-pham" className="block hover:text-[#dfff00]">
                Tất cả sản phẩm
              </Link>
              <Link
                href="/san-pham?danh-muc=ao-thun-the-thao"
                className="block hover:text-[#dfff00]"
              >
                Áo thể thao
              </Link>
              <Link
                href="/san-pham?danh-muc=quan-short"
                className="block hover:text-[#dfff00]"
              >
                Quần short
              </Link>
              <Link href="/tai-khoan" className="block hover:text-[#dfff00]">
                MOVA Club
              </Link>
            </div>
            <div className="space-y-3">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                Hỗ trợ
              </p>
              <Link
                href="/chinh-sach/van-chuyen"
                className="block hover:text-[#dfff00]"
              >
                Vận chuyển
              </Link>
              <Link
                href="/chinh-sach/doi-hang"
                className="block hover:text-[#dfff00]"
              >
                Đổi hàng 72 giờ
              </Link>
              <Link
                href="/huong-dan-chon-size"
                className="block hover:text-[#dfff00]"
              >
                Hướng dẫn chọn size
              </Link>
              <Link
                href="/chinh-sach/bao-mat"
                className="block hover:text-[#dfff00]"
              >
                Bảo mật
              </Link>
              <Link href="/chinh-sach/bao-hanh" className="block hover:text-[#dfff00]">
                Bảo hành
              </Link>
              <Link href="/chinh-sach/dieu-khoan" className="block hover:text-[#dfff00]">
                Điều khoản sử dụng
              </Link>
            </div>
            <div className="col-span-2 space-y-3 lg:col-span-1">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                Điểm liên hệ
              </p>
              <p className="flex items-start gap-2 leading-6 text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#dfff00]" />
                Địa điểm minh họa: UTH cơ sở 1, số 2 Võ Oanh, TP.HCM
              </p>
              <Link
                href="/lien-he"
                className="inline-block text-xs font-semibold text-[#dfff00] hover:underline"
              >
                Xem bản đồ Google Maps
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© 2026 MOVA · Đồ án thương mại điện tử</p>
          <p>COD · MoMo UAT · Đổi hàng trong 72 giờ</p>
        </div>
      </div>
    </footer>
  );
}
