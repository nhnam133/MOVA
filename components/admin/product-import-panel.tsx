'use client';

import { useRef, useState } from 'react';
import { LoaderCircle, Images } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export function ProductImportPanel({ codes }: { codes: string[] }) {
  const [includeNew, setIncludeNew] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const lock = useRef(false);
  async function run() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage('');
    setCount(0);
    try {
      for (let index = 0; index < codes.length; index++) {
        const response = await fetch('/api/admin/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: codes[index],
            includeNewCategories: includeNew,
          }),
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok)
          throw new Error(
            `Chưa nhập xong mã ${codes[index]}. Các mã đã nhập được giữ nguyên; bạn có thể chạy lại.`,
          );
        setCount(index + 1);
      }
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Kết nối gián đoạn. Có thể thử nhập lại.',
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="mt-8 rounded-2xl border border-black/15 bg-white p-6">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <Images aria-hidden="true" className="size-6" />
        Bộ ảnh sản phẩm mới
      </h2>
      <p className="mt-3 text-base text-neutral-600">
        76 ảnh cho 37 mã đã sẵn sàng. Nhập bổ sung ảnh cho mã có sẵn và tạo sản
        phẩm mới với dữ liệu demo. Không thay giá hay tồn kho của sản phẩm đang
        có.
      </p>
      <label
        htmlFor="include-new-categories"
        className="mt-5 flex min-h-11 items-center gap-3 text-sm font-medium"
      >
        <Checkbox
          id="include-new-categories"
          checked={includeNew}
          onCheckedChange={(checked) => setIncludeNew(checked === true)}
          disabled={busy}
        />
        Đưa cả các nhóm mới (polo, sơ mi, váy, phụ kiện…) lên cửa hàng
      </label>
      <p className="mt-1 text-sm text-neutral-600">
        Nếu không chọn, sản phẩm ngoài các nhóm đã chốt sẽ được lưu dưới dạng
        bản nháp.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-black px-5 py-3 text-base font-bold text-white disabled:opacity-50"
      >
        {busy && (
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin motion-reduce:animate-none"
          />
        )}
        {busy
          ? `Đang nhập ${count}/${codes.length}`
          : 'Nhập bộ sản phẩm và ảnh'}
      </button>
      {message && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {message}
        </p>
      )}
    </section>
  );
}
