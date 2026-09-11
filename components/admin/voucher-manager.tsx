'use client';

import { useState, type SyntheticEvent } from 'react';
import { LoaderCircle, Plus, Save } from 'lucide-react';
import { requestJson } from '@/lib/client-request';
import { formatMoney } from '@/lib/catalog';

type Voucher = { id: string; code: string; value: number; minimumOrderValue: number; pointsCost: number; expiresAt: number | null; active: boolean; assignedCount: number };

function toDate(value: number | null) { return value ? new Date(value).toLocaleDateString('en-CA') : ''; }

export function VoucherManager({ initial }: { initial: Voucher[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const input = 'mt-2 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 text-base';
  function change(id: string, value: Partial<Voucher>) { setRows((current) => current.map((row) => row.id === id ? { ...row, ...value } : row)); }
  async function send(method: 'POST' | 'PATCH', payload: object, key: string) {
    setBusy(key); setMessage('');
    const response = await requestJson('/api/admin/vouchers', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error || 'Không thể lưu voucher.'); setBusy(''); return; }
    window.location.reload();
  }
  async function create(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const dateValue = data.get('expiresAt'); const expires = typeof dateValue === 'string' ? dateValue : '';
    await send('POST', { code: data.get('code'), value: Number(data.get('value')), minimumOrderValue: Number(data.get('minimumOrderValue')), pointsCost: Number(data.get('pointsCost')), expiresAt: expires ? new Date(`${expires}T23:59:59+07:00`).getTime() : null, active: true }, 'new');
  }
  function save(row: Voucher) { void send('PATCH', { ...row, expiresAt: row.expiresAt }, row.id); }
  return <div className="space-y-6">
    <form onSubmit={create} className="grid gap-4 rounded-2xl border border-black bg-[#dfff00] p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <label className="text-sm font-black">Mã voucher<input name="code" required placeholder="HAUVIE20" className={input} /></label>
      <label className="text-sm font-black">Giá trị giảm<input name="value" type="number" min={1000} step={1000} required defaultValue={20000} className={input} /></label>
      <label className="text-sm font-black">Đơn tối thiểu<input name="minimumOrderValue" type="number" min={1000} step={1000} required defaultValue={200000} className={input} /></label>
      <label className="text-sm font-black">Điểm cần đổi<input name="pointsCost" type="number" min={0} required defaultValue={100} className={input} /></label>
      <label className="text-sm font-black">Hạn sử dụng<input name="expiresAt" type="date" className={input} /></label>
      <button disabled={Boolean(busy)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white sm:col-span-2 lg:col-span-5"><Plus className="h-4 w-4" />Tạo voucher</button>
    </form>
    {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      {rows.map((row) => <article key={row.id} className="rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xl font-black">{row.code}</p><p className="mt-1 text-sm text-neutral-500">Đã cấp {row.assignedCount} lượt</p></div><label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={row.active} onChange={(event) => change(row.id, { active: event.target.checked })} />Đang hoạt động</label></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold">Giá trị<input type="number" min={1000} step={1000} value={row.value} onChange={(event) => change(row.id, { value: Number(event.target.value) })} className={input} /></label>
          <label className="text-sm font-bold">Đơn tối thiểu<input type="number" min={1000} step={1000} value={row.minimumOrderValue} onChange={(event) => change(row.id, { minimumOrderValue: Number(event.target.value) })} className={input} /></label>
          <label className="text-sm font-bold">Điểm cần đổi<input type="number" min={0} value={row.pointsCost} onChange={(event) => change(row.id, { pointsCost: Number(event.target.value) })} className={input} /></label>
          <label className="text-sm font-bold">Hạn sử dụng<input type="date" value={toDate(row.expiresAt)} onChange={(event) => change(row.id, { expiresAt: event.target.value ? new Date(`${event.target.value}T23:59:59+07:00`).getTime() : null })} className={input} /></label>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4"><p className="text-sm">Giảm <strong>{formatMoney(row.value)}</strong></p><button onClick={() => save(row)} disabled={Boolean(busy)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white">{busy === row.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu</button></div>
      </article>)}
    </div>
  </div>;
}
