'use client';

import { useState } from 'react';
import { requestJson } from '@/lib/client-request';

export function ExchangeActions({
  id,
  status,
  replacementSku,
  variants,
}: {
  id: string;
  status: string;
  replacementSku: string | null;
  variants: { sku: string; label: string }[];
}) {
  const [loading, setLoading] = useState(false),
    [error, setError] = useState('');
  const [sku, setSku] = useState(replacementSku ?? ''),
    [note, setNote] = useState(''),
    [responsibility, setResponsibility] = useState('pending');
  async function act(action: string) {
    setLoading(true);
    setError('');
    const response = await requestJson('/api/admin/exchanges', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id,
        action,
        replacementSku: sku,
        responsibility,
        note,
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? 'Không thể xử lý yêu cầu.');
      setLoading(false);
      return;
    }
    window.location.reload();
  }
  const button =
    'min-h-11 rounded-full border border-black px-4 text-sm font-bold disabled:opacity-40';
  return (
    <div className="mt-4 space-y-3">
      {['submitted', 'reviewing'].includes(status) && (
        <>
          <label className="block text-sm">
            SKU thay thế
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border bg-white px-3"
            >
              <option value="">Chọn sản phẩm thay thế</option>
              {variants.map((v) => (
                <option key={v.sku} value={v.sku}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Bên chịu phí
            <select
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border bg-white px-3"
            >
              <option value="pending">Chưa xác định</option>
              <option value="seller">MOVA chịu phí (lỗi của MOVA)</option>
              <option value="customer">Khách chịu phí (lỗi của khách)</option>
            </select>
          </label>
          <label className="block text-sm">
            Kết luận / lý do
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border bg-white p-3"
            />
          </label>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {status === 'submitted' && (
          <button
            disabled={loading}
            className={button}
            onClick={() => act('review')}
          >
            Tiếp nhận
          </button>
        )}
        {['submitted', 'reviewing'].includes(status) && (
          <>
            <button
              disabled={
                loading ||
                !sku ||
                responsibility === 'pending' ||
                note.trim().length < 5
              }
              className={button + ' bg-[#dfff00]'}
              onClick={() => act('approve')}
            >
              Duyệt đổi
            </button>
            <button
              disabled={loading || note.trim().length < 5}
              className={button}
              onClick={() => act('reject')}
            >
              Từ chối
            </button>
          </>
        )}
        {status === 'approved' && (
          <button
            disabled={loading}
            className={button}
            onClick={() => act('ship')}
          >
            Đã nhận hàng cũ, gửi hàng đổi
          </button>
        )}
        {status === 'shipping' && (
          <button
            disabled={loading}
            className={button}
            onClick={() => act('complete')}
          >
            Khách đã nhận hàng đổi
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
