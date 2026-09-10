import Link from '@/components/store/link';
import {
  ArrowLeft,
  Camera,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';

const pages = {
  'van-chuyen': {
    title: 'Chính sách vận chuyển',
    kicker: 'Giao hàng',
    icon: Truck,
    intro: 'MOVA áp dụng một cách tính phí rõ ràng cho đơn hàng toàn quốc.',
    sections: [
      [
        'Phí vận chuyển',
        'Đồng giá 30.000đ. Miễn phí vận chuyển khi tiền hàng thực trả sau voucher từ 499.000đ.',
      ],
      [
        'Cách tính',
        'Phí được tính lại sau khi áp dụng voucher. Ví dụ tiền hàng còn 498.999đ sẽ tính 30.000đ; từ đúng 499.000đ được miễn phí.',
      ],
      [
        'Thời gian giao',
        'Thời gian giao dự kiến chưa được công bố như một cam kết cố định. Trạng thái đơn được cập nhật trong tài khoản.',
      ],
    ],
  },
  'doi-hang': {
    title: 'Chính sách đổi hàng',
    kicker: 'Đổi size 72 giờ',
    icon: Clock3,
    intro:
      'Yêu cầu được tính từ thời điểm khách thực tế nhận hàng đến thời điểm gửi yêu cầu.',
    sections: [
      [
        'Điều kiện thời gian',
        'Gửi trong vòng 72 giờ; đúng mốc 72 giờ vẫn được tiếp nhận, quá một giây sẽ hết hạn. Sản phẩm khách làm dơ không đủ điều kiện.',
      ],
      [
        'Trường hợp hỗ trợ',
        'Chọn sai size, sản phẩm có vấn đề, giao nhầm sản phẩm và trường hợp khác để MOVA xem xét. Hàng lỗi hoặc giao nhầm bắt buộc có ít nhất một ảnh.',
      ],
      [
        'Phí đổi hàng',
        'Nếu lỗi thuộc MOVA, MOVA chịu phí vận chuyển đổi. Nếu khách chọn sai size, khách chịu phí. Khi chưa rõ nguồn lỗi, hệ thống không tự gán phí cho khách.',
      ],
      [
        'Hàng thay thế',
        'Chỉ chọn và duyệt size còn tồn kho. MOVA không tự động chờ nhập hoặc hoàn tiền; trường hợp ngoại lệ được admin liên hệ xử lý.',
      ],
    ],
  },
  'bao-mat': {
    title: 'Bảo mật & điều khoản',
    kicker: 'Thông tin',
    icon: ShieldCheck,
    intro:
      'MOVA chỉ sử dụng dữ liệu cần thiết để vận hành luồng mua hàng của đồ án.',
    sections: [
      [
        'Dữ liệu tài khoản',
        'Thông tin định danh do hệ thống đăng nhập cung cấp được dùng để bảo vệ đơn, điểm và voucher của đúng chủ tài khoản.',
      ],
      [
        'Thông tin đơn hàng',
        'Tên người nhận, số điện thoại và địa chỉ được lưu để tạo và theo dõi đơn. Không hiển thị công khai dữ liệu người mua hoặc người gửi liên hệ.',
      ],
      [
        'Thanh toán thử nghiệm',
        'MoMo chỉ hoạt động trong môi trường UAT. Khóa tích hợp được giữ phía máy chủ; trang khách quay về không tự quyết định giao dịch thành công.',
      ],
      [
        'Phạm vi đồ án',
        'Website là sản phẩm học tập với dữ liệu demo, chưa phải tư vấn pháp lý hoặc cam kết kinh doanh thật.',
      ],
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = pages[(await params).slug as keyof typeof pages];
  if (!page) notFound();
  const Icon = page.icon;
  return (
    <main className="min-h-screen bg-[#f6f6f2]">
      <AnnouncementBar />
      <SiteHeader />
      <section className="bg-black px-4 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-white/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
          <Icon className="h-8 w-8 text-[#dfff00]" />
          <p className="mt-6 section-kicker text-[#dfff00]">{page.kicker}</p>
          <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.07em] sm:text-7xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">
            {page.intro}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8 lg:px-0 lg:py-24">
        <div className="grid gap-4">
          {page.sections.map(([title, content], index) => (
            <article
              key={title}
              className="grid gap-4 rounded-[20px] border border-black/10 bg-white p-6 shadow-sm sm:grid-cols-[80px_1fr] sm:p-8"
            >
              <span className="text-sm font-black text-neutral-300">
                0{index + 1}
              </span>
              <div>
                <h2 className="text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600">
                  {content}
                </p>
              </div>
            </article>
          ))}
        </div>
        {page === pages['doi-hang'] && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [Camera, 'Ảnh minh chứng', 'Bắt buộc cho hàng lỗi và giao nhầm'],
              [
                CircleDollarSign,
                'Bên gây lỗi chịu phí',
                'MOVA hoặc khách theo kết luận',
              ],
              [PackageCheck, 'Kiểm tra tồn', 'Không duyệt vượt SKU còn hàng'],
            ].map(([FeatureIcon, title, copy]) => {
              const CardIcon = FeatureIcon as typeof Camera;
              return (
                <div
                  key={title as string}
                  className="rounded-[20px] bg-[#dfff00] p-6"
                >
                  <CardIcon className="h-5 w-5" />
                  <p className="mt-8 font-black">{title as string}</p>
                  <p className="mt-2 text-sm leading-6">{copy as string}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
