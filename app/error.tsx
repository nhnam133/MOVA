'use client';
import Link from '@/components/store/link';

export default function ErrorPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-sm font-bold tracking-widest">HAUVIE</p>
      <h1 className="mt-5 text-3xl font-black">Chưa tải được trang</h1>
      <p className="mt-4 leading-7 text-neutral-600">
        Kết nối có thể đang gián đoạn. Nếu bạn vừa đặt hàng, hãy kiểm tra tài
        khoản trước khi gửi lại đơn.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="min-h-12 rounded-full bg-black px-6 font-bold text-white"
        >
          Thử tải lại
        </button>
        <Link
          href="/tai-khoan"
          className="inline-flex min-h-12 items-center rounded-full border border-black px-6 font-bold"
        >
          Xem tài khoản
        </Link>
      </div>
    </main>
  );
}
