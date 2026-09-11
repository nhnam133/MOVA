'use client';

import { requestJson } from '@/lib/client-request';

import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { LoaderCircle, Plus } from 'lucide-react';

export function ProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    const response = await requestJson('/api/admin/products', {
      method: 'POST',
      body: new FormData(event.currentTarget),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || 'Không thể thêm sản phẩm.');
      setSubmitting(false);
      return;
    }
    window.location.reload();
  }
  const input =
    'mt-2 h-11 w-full border border-black/25 bg-white px-3 text-sm outline-none focus:border-black';
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold uppercase tracking-wider">
        Mã sản phẩm
        <input name="code" required placeholder="VD: ATN01" className={input} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Tên sản phẩm
        <input name="name" required className={input} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Danh mục
        <select name="categoryId" required className={input}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Đối tượng
        <select name="gender" required className={input}>
          <option value="female">Nữ</option>
          <option value="male">Nam</option>
          <option value="unisex">Unisex</option>
        </select>
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Giá bán (VND)
        <input
          name="price"
          required
          type="number"
          min="1000"
          step="1000"
          className={input}
        />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Giá gốc (nếu có)
        <input
          name="compareAtPrice"
          type="number"
          min="1000"
          step="1000"
          className={input}
        />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Màu
        <input name="color" required placeholder="Đen" className={input} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Size, cách nhau bằng dấu phẩy
        <input
          name="sizes"
          required
          defaultValue="S,M,L,XL,XXL"
          className={input}
        />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Tồn kho mỗi size
        <input
          name="stock"
          required
          type="number"
          min="0"
          defaultValue="10"
          className={input}
        />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider">
        Trạng thái khi lưu
        <select name="status" defaultValue="active" className={input}>
          <option value="active">Công khai ngay</option>
          <option value="draft">Lưu bản nháp</option>
          <option value="hidden">Tạm ẩn</option>
        </select>
      </label>
      <label className="text-xs font-bold uppercase tracking-wider sm:col-span-2">
        Chất liệu
        <input name="material" className={input} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider sm:col-span-2">
        Mô tả
        <textarea
          name="description"
          rows={3}
          className="mt-2 w-full border border-black/25 bg-white p-3 text-sm outline-none focus:border-black"
        />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider sm:col-span-2">
        Ảnh sản phẩm
        <input
          name="image"
          required
          type="file"
          accept="image/avif,image/jpeg,image/png,image/webp"
          className="mt-2 block w-full border border-dashed border-black/30 bg-white p-4 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2">
        <input name="featured" type="checkbox" />
        Hiển thị nổi bật
      </label>
      {message && (
        <p role="alert" className="text-sm text-red-600 sm:col-span-2">
          {message}
        </p>
      )}
      <button
        disabled={submitting}
        className="flex h-12 items-center justify-center gap-2 bg-black text-xs font-black uppercase tracking-wider text-white sm:col-span-2"
      >
        {submitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Thêm sản phẩm
      </button>
    </form>
  );
}
