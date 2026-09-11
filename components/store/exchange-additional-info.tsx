'use client';

import { useState, type SyntheticEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { requestJson } from '@/lib/client-request';

export function ExchangeAdditionalInfo({ orderCode, requestId }: { orderCode: string; requestId: string }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(event: SyntheticEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(''); const data = new FormData(event.currentTarget); data.set('action','add_exchange_info'); data.set('requestId', requestId); const response = await requestJson(`/api/orders/${encodeURIComponent(orderCode)}/actions`, { method:'POST', body:data }); const result = await response.json() as { error?: string }; if (!response.ok) { setError(result.error || 'Không thể gửi thông tin.'); setBusy(false); return; } window.location.reload(); }
  return <form onSubmit={submit} className="mt-4 rounded-xl bg-[#f1f1eb] p-4"><p className="text-sm font-black">Bổ sung thông tin theo yêu cầu của MOVA</p><textarea name="description" required minLength={5} maxLength={2000} rows={3} placeholder="Mô tả thông tin cần bổ sung" className="mt-3 w-full rounded-lg border border-black/20 bg-white p-3 text-base" /><input name="evidence" type="file" multiple accept="image/avif,image/jpeg,image/png,image/webp" className="mt-3 block w-full rounded-lg border border-dashed border-black/20 bg-white p-3 text-sm" /><button disabled={busy} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}Gửi bổ sung</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</form>;
}
