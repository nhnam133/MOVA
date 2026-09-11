'use client';

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { requestJson } from '@/lib/client-request';

export function ExchangeActions({ id, status, replacementSku, variants, originalSku, initialFeeAmount, initialFeeStatus }: { id: string; status: string; replacementSku: string | null; variants: { sku: string; label: string }[]; originalSku: string; initialFeeAmount: number; initialFeeStatus: string }) {
  const [loading, setLoading] = useState(''); const [error, setError] = useState('');
  const [sku, setSku] = useState(replacementSku || ''); const [note, setNote] = useState(''); const [responsibility, setResponsibility] = useState('pending');
  const [feeAmount, setFeeAmount] = useState(initialFeeAmount); const [feePaid, setFeePaid] = useState(initialFeeStatus === 'paid'); const [returnedSku, setReturnedSku] = useState(originalSku); const [returnCondition, setReturnCondition] = useState('accepted'); const [restockDecision, setRestockDecision] = useState('restock');
  async function act(action: string) {
    setLoading(action); setError('');
    const response = await requestJson('/api/admin/exchanges', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, action, replacementSku: sku, responsibility, note, feeAmount, feePaid, returnedSku, returnCondition, restockDecision }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setError(data.error || 'Không thể xử lý yêu cầu.'); setLoading(''); return; }
    window.location.reload();
  }
  const button = 'min-h-11 rounded-full border border-black px-4 text-sm font-bold transition hover:bg-black hover:text-white disabled:opacity-40';
  const field = 'mt-2 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 text-base';
  const reviewable = ['submitted', 'reviewing', 'needs_info'].includes(status);
  return <div className="mt-5 space-y-4 border-t border-black/10 pt-5">
    {reviewable && <>
      <label className="block text-sm font-bold">SKU thay thế<select value={sku} onChange={(event) => setSku(event.target.value)} className={field}><option value="">Chọn sản phẩm thay thế</option>{variants.map((variant) => <option key={variant.sku} value={variant.sku}>{variant.label}</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Bên chịu phí<select value={responsibility} onChange={(event) => { setResponsibility(event.target.value); if (event.target.value === 'seller') setFeeAmount(0); }} className={field}><option value="pending">Chưa xác định</option><option value="seller">MOVA chịu phí</option><option value="customer">Khách chịu phí</option></select></label><label className="text-sm font-bold">Phí khách phải trả<input type="number" min={0} step={1000} value={feeAmount} disabled={responsibility === 'seller'} onChange={(event) => setFeeAmount(Number(event.target.value))} className={field} /></label></div>
    </>}
    {status === 'return_shipping' && <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">SKU thực tế nhận lại<input value={returnedSku} onChange={(event) => setReturnedSku(event.target.value)} className={field} /></label><label className="text-sm font-bold">Kết quả kiểm tra<select value={returnCondition} onChange={(event) => setReturnCondition(event.target.value)} className={field}><option value="accepted">Đạt điều kiện đổi</option><option value="rejected">Không đạt: bẩn/hư do khách</option></select></label><label className="text-sm font-bold">Xử lý hàng cũ<select value={restockDecision} onChange={(event) => setRestockDecision(event.target.value)} className={field}><option value="restock">Nhập lại kho</option><option value="quarantine">Đưa vào khu hàng lỗi</option></select></label><label className="flex min-h-11 items-end gap-3 pb-2 text-sm font-bold"><input type="checkbox" checked={feePaid} onChange={(event) => setFeePaid(event.target.checked)} />Đã thu phí đổi của khách</label></div>}
    {(reviewable || status === 'return_shipping') && <label className="block text-sm font-bold">Kết luận / ghi chú<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={2000} className="mt-2 w-full rounded-lg border border-black/20 bg-white p-3 text-base" /></label>}
    <div className="flex flex-wrap gap-2">
      {['submitted', 'needs_info'].includes(status) && <button disabled={Boolean(loading)} className={button} onClick={() => act('review')}>Tiếp nhận xử lý</button>}
      {['submitted', 'reviewing'].includes(status) && <button disabled={Boolean(loading) || note.trim().length < 5} className={button} onClick={() => act('needs_info')}>Yêu cầu bổ sung</button>}
      {reviewable && <><button disabled={Boolean(loading) || !sku || responsibility === 'pending' || note.trim().length < 5} className={`${button} bg-[#dfff00]`} onClick={() => act('approve')}>Duyệt đổi</button><button disabled={Boolean(loading) || note.trim().length < 5} className={button} onClick={() => act('reject')}>Từ chối</button></>}
      {status === 'approved' && <button disabled={Boolean(loading)} className={`${button} bg-[#dfff00]`} onClick={() => act('request_return')}>Chờ khách gửi hàng cũ</button>}
      {status === 'return_shipping' && <button disabled={Boolean(loading) || note.trim().length < 5 || !returnedSku} className={`${button} bg-[#dfff00]`} onClick={() => act('receive_return')}>Xác nhận đã kiểm tra hàng cũ</button>}
      {status === 'received' && <button disabled={Boolean(loading)} className={`${button} bg-[#dfff00]`} onClick={() => act('ship')}>Gửi sản phẩm đổi</button>}
      {status === 'shipping' && <button disabled={Boolean(loading)} className={`${button} bg-[#dfff00]`} onClick={() => act('complete')}>Khách đã nhận hàng đổi</button>}
      {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div>;
}
