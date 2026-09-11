'use client';

import { useState, type SyntheticEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { requestJson } from '@/lib/client-request';

export function StockAdjustment({ variantId, current, reserved, updatedAt }: { variantId: string; current: number; reserved: number; updatedAt: number }) {
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); const data = new FormData(event.currentTarget);
    const response = await requestJson('/api/admin/stock', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ variantId, stock: Number(data.get('stock')), reason: data.get('reason'), updatedAt }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error || 'Không thể cập nhật kho.'); setBusy(false); return; }
    window.location.reload();
  }
  if (!open) return <button onClick={() => setOpen(true)} className="min-h-11 rounded-full border border-black px-4 text-sm font-bold transition hover:bg-black hover:text-white">Điều chỉnh</button>;
  return <form onSubmit={submit} className="mt-3 grid gap-2 rounded-xl bg-neutral-100 p-3 sm:grid-cols-[120px_1fr_auto]">
    <label className="text-xs font-bold">Tồn mới<input name="stock" type="number" min={reserved} max={1000000} defaultValue={current} required className="mt-1 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 text-base" /></label>
    <label className="text-xs font-bold">Lý do<input name="reason" minLength={5} maxLength={300} required placeholder="Nhập hàng, kiểm kê…" className="mt-1 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 text-base" /></label>
    <div className="flex items-end gap-2"><button disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-4 text-sm font-bold text-white">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}Lưu</button><button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full px-3 text-sm font-bold">Hủy</button></div>
    {message && <p role="alert" className="text-sm text-red-700 sm:col-span-3">{message}</p>}
  </form>;
}
