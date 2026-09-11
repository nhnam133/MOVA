import Link from '@/components/store/link';
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-sm font-bold tracking-widest">HAUVIE / 404</p>
      <h1 className="mt-5 text-3xl font-black">Không tìm thấy trang</h1>
      <p className="mt-4 leading-7 text-neutral-600">
        Liên kết không còn tồn tại hoặc sản phẩm đang được cập nhật.
      </p>
      <Link
        href="/san-pham"
        className="mt-7 inline-flex min-h-12 items-center rounded-full bg-black px-6 font-bold text-white"
      >
        Quay lại sản phẩm
      </Link>
    </main>
  );
}
