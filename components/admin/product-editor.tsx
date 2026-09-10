'use client';
import { useState, type SyntheticEvent } from 'react';
import { requestJson } from '@/lib/client-request';

type Variant = {
  id?: string;
  color: string;
  size: string;
  stock: number;
  reservedStock?: number;
  active: boolean;
};
export type EditableProduct = {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  gender: string;
  price: number;
  compareAtPrice: number | null;
  material: string;
  description: string;
  status: string;
  featured: boolean;
  updatedAt: number;
};
export function ProductEditor({
  product,
  variants: initial,
  categories,
}: {
  product: EditableProduct;
  variants: Variant[];
  categories: { id: string; name: string }[];
}) {
  const [variants, setVariants] = useState(initial),
    [loading, setLoading] = useState(false),
    [message, setMessage] = useState('');
  const field =
    'mt-2 block min-h-11 w-full rounded-lg border bg-white px-3 text-base';
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const data = new FormData(event.currentTarget);
    data.set('variants', JSON.stringify(variants));
    data.set('updatedAt', String(product.updatedAt));
    const response = await requestJson(
      '/api/admin/products/' + encodeURIComponent(product.id),
      { method: 'PATCH', body: data },
    );
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error ?? 'Không thể lưu.');
      setLoading(false);
      return;
    }
    window.location.reload();
  }
  function update(index: number, change: Partial<Variant>) {
    setVariants((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...change } : row)),
    );
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-7 rounded-2xl bg-white p-5 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Tên sản phẩm
          <input
            name="name"
            required
            maxLength={150}
            defaultValue={product.name}
            className={field}
          />
        </label>
        <label className="text-sm font-semibold">
          Danh mục
          <select
            name="categoryId"
            defaultValue={product.categoryId}
            className={field}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Giá bán
          <input
            name="price"
            type="number"
            min={1000}
            step={1000}
            required
            defaultValue={product.price}
            className={field}
          />
        </label>
        <label className="text-sm font-semibold">
          Giá gốc (để trống nếu không giảm)
          <input
            name="compareAtPrice"
            type="number"
            min={1000}
            step={1000}
            defaultValue={product.compareAtPrice ?? ''}
            className={field}
          />
        </label>
        <label className="text-sm font-semibold">
          Đối tượng
          <select name="gender" defaultValue={product.gender} className={field}>
            <option value="female">Nữ</option>
            <option value="male">Nam</option>
            <option value="unisex">Unisex</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Hiển thị
          <select name="status" defaultValue={product.status} className={field}>
            <option value="active">Đang bán</option>
            <option value="hidden">Ẩn khỏi cửa hàng</option>
            <option value="draft">Bản nháp</option>
          </select>
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Chất liệu
          <input
            name="material"
            maxLength={500}
            defaultValue={product.material}
            className={field}
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Mô tả
          <textarea
            name="description"
            maxLength={5000}
            rows={4}
            defaultValue={product.description}
            className={field + ' p-3'}
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={product.featured}
          />
          Sản phẩm nổi bật
        </label>
      </div>
      <section>
        <h2 className="text-xl font-black">Màu, size và tồn kho</h2>
        <p className="mt-2 text-sm text-neutral-600">
          SKU đã tạo giữ nguyên màu và size để bảo toàn lịch sử đơn. Bạn có thể
          thêm biến thể mới hoặc tạm ẩn biến thể cũ.
        </p>
        <div className="mt-4 space-y-3">
          {variants.map((v, index) => (
            <div
              key={v.id ?? 'new-' + index}
              className="grid gap-3 rounded-xl border bg-neutral-50 p-4 sm:grid-cols-4"
            >
              <label className="text-sm">
                Màu
                <input
                  aria-label={'Màu biến thể ' + (index + 1)}
                  value={v.color}
                  required
                  readOnly={Boolean(v.id)}
                  onChange={(e) => update(index, { color: e.target.value })}
                  className={field}
                />
              </label>
              <label className="text-sm">
                Size
                <select
                  aria-label={'Size biến thể ' + (index + 1)}
                  value={v.size}
                  disabled={Boolean(v.id)}
                  onChange={(e) => update(index, { size: e.target.value })}
                  className={field}
                >
                  {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Tồn (giữ {v.reservedStock ?? 0})
                <input
                  aria-label={'Tồn kho biến thể ' + (index + 1)}
                  type="number"
                  min={v.reservedStock ?? 0}
                  max={1000000}
                  value={v.stock}
                  onChange={(e) =>
                    update(index, { stock: Number(e.target.value) })
                  }
                  required
                  className={field}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.active}
                  onChange={(e) => update(index, { active: e.target.checked })}
                />
                Đang bán
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setVariants((rows) => [
              ...rows,
              { color: '', size: 'M', stock: 0, active: true },
            ])
          }
          disabled={variants.length >= 50}
          className="mt-4 min-h-11 rounded-full border border-black px-5 text-sm font-bold"
        >
          + Thêm màu / size
        </button>
      </section>
      <label className="block text-sm font-semibold">
        Bổ sung ảnh (tối đa 5 ảnh/lần, mỗi ảnh 5MB)
        <input
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="mt-3 block w-full rounded-xl border border-dashed p-4"
        />
        <span className="mt-2 block font-normal text-neutral-600">
          Ảnh mới được thêm vào bộ ảnh hiện có; không xóa ảnh đang dùng.
        </span>
      </label>
      {message && (
        <p role="alert" className="text-sm text-red-700">
          {message}
        </p>
      )}
      <button
        disabled={loading}
        className="min-h-12 rounded-full bg-black px-7 font-bold text-white disabled:opacity-50"
      >
        {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}
