'use client';

import { useState, type SyntheticEvent } from 'react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { requestJson } from '@/lib/client-request';

export function CustomerActions({ userId, role }: { userId: string; role: 'customer' | 'admin' }) {
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  async function request(payload: object, key: string) {
    setBusy(key); setMessage('');
    const response = await requestJson('/api/admin/customers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, ...payload }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error || 'Không thể cập nhật.'); setBusy(''); return; }
    window.location.reload();
  }
  function adjust(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    void request({ action: 'points', points: Number(data.get('points')), note: data.get('note') }, 'points');
  }
  return <div className="space-y-3">
    <button onClick={() => request({ action: 'role', role: role === 'admin' ? 'customer' : 'admin' }, 'role')} disabled={Boolean(busy)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black px-4 text-sm font-bold transition hover:bg-black hover:text-white disabled:opacity-40">{busy === 'role' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}{role === 'admin' ? 'Gỡ quyền quản trị' : 'Cấp quyền quản trị'}</button>
    <form onSubmit={adjust} className="grid gap-2 sm:grid-cols-[110px_1fr_auto]">
      <input name="points" type="number" required placeholder="+/- điểm" aria-label="Số điểm điều chỉnh" className="min-h-11 rounded-lg border border-black/20 px-3 text-base" />
      <input name="note" required minLength={5} maxLength={300} placeholder="Lý do điều chỉnh" aria-label="Lý do điều chỉnh điểm" className="min-h-11 rounded-lg border border-black/20 px-3 text-base" />
      <button disabled={Boolean(busy)} className="min-h-11 rounded-full bg-[#dfff00] px-4 text-sm font-black">Điều chỉnh</button>
    </form>
    {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
  </div>;
}
