'use client';

import { useState, type SyntheticEvent } from 'react';
import { LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { requestJson } from '@/lib/client-request';

type Category = { id: string; name: string; slug: string; isVisible: boolean; sortOrder: number; productCount: number };

export function CategoryManager({ initial }: { initial: Category[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const field = 'min-h-11 rounded-lg border border-black/20 bg-white px-3 text-base';

  async function create(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('new'); setMessage('');
    const data = new FormData(event.currentTarget);
    const response = await requestJson('/api/admin/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), visible: true }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error || 'Không thể tạo danh mục.'); setBusy(''); return; }
    window.location.reload();
  }
  async function save(row: Category) {
    setBusy(row.id); setMessage('');
    const response = await requestJson('/api/admin/categories', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: row.id, name: row.name, visible: row.isVisible, sortOrder: row.sortOrder }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error || 'Không thể lưu danh mục.'); setBusy(''); return; }
    window.location.reload();
  }
  async function remove(row: Category) {
    if (!window.confirm(`Xóa danh mục “${row.name}”?`)) return;
    setBusy(row.id); setMessage('');
    const response = await requestJson('/api/admin/categories', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: row.id }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error || 'Không thể xóa danh mục.'); setBusy(''); return; }
    window.location.reload();
  }
  function change(id: string, value: Partial<Category>) { setRows((current) => current.map((row) => row.id === id ? { ...row, ...value } : row)); }

  return <div className="space-y-6">
    <form onSubmit={create} className="flex flex-col gap-3 rounded-2xl border border-black bg-[#dfff00] p-5 sm:flex-row sm:items-end">
      <label className="flex-1 text-sm font-black">Tên danh mục mới<input name="name" required maxLength={80} placeholder="Ví dụ: Áo khoác thể thao" className={`mt-2 w-full ${field}`} /></label>
      <button disabled={Boolean(busy)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white"><Plus className="h-4 w-4" />Thêm danh mục</button>
    </form>
    {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>}
    <div className="space-y-3">
      {rows.map((row) => <article key={row.id} className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-[1fr_160px_150px_auto] md:items-end">
        <label className="text-sm font-bold">Tên danh mục<input value={row.name} onChange={(event) => change(row.id, { name: event.target.value })} className={`mt-2 w-full ${field}`} /></label>
        <label className="text-sm font-bold">Thứ tự<input type="number" min={0} max={10000} value={row.sortOrder} onChange={(event) => change(row.id, { sortOrder: Number(event.target.value) })} className={`mt-2 w-full ${field}`} /></label>
        <label className="flex min-h-11 items-center gap-3 text-sm font-bold"><input type="checkbox" checked={row.isVisible} onChange={(event) => change(row.id, { isVisible: event.target.checked })} />Hiện trên cửa hàng</label>
        <div className="flex gap-2">
          <button onClick={() => save(row)} disabled={Boolean(busy)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-4 text-sm font-bold text-white">{busy === row.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu</button>
          <button onClick={() => remove(row)} disabled={Boolean(busy) || row.productCount > 0} aria-label={`Xóa ${row.name}`} title={row.productCount > 0 ? 'Không thể xóa danh mục đang có sản phẩm' : 'Xóa danh mục'} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-black/20 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
        </div>
        <p className="text-xs text-neutral-500 md:col-span-4">Đường dẫn: {row.slug} · {row.productCount} sản phẩm</p>
      </article>)}
    </div>
  </div>;
}
