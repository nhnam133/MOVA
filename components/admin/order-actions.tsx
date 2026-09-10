'use client';

import { requestJson } from '@/lib/client-request';

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export function AdminOrderActions({
  orderCode,
  status,
  paymentMethod,
  paymentStatus,
}: {
  orderCode: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
}) {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [receivedAt, setReceivedAt] = useState('');
  async function action(value: string) {
    setLoading(value);
    setError('');
    const response = await requestJson(`/api/admin/orders/${orderCode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: value,
        receivedAt:
          value === 'complete' ? new Date(receivedAt).getTime() : undefined,
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? 'Không thể cập nhật.');
      setLoading('');
      return;
    }
    window.location.reload();
  }
  const button =
    'h-9 cursor-pointer rounded-full border border-black px-4 text-xs font-bold disabled:opacity-40';
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'shipping' && (
        <label className="w-full text-sm">
          Thời điểm khách thực nhận
          <input
            aria-label="Thời điểm khách thực nhận"
            type="datetime-local"
            value={receivedAt}
            onChange={(event) => setReceivedAt(event.target.value)}
            className="mt-1 block h-11 max-w-full rounded-lg border px-3"
          />
        </label>
      )}
      {status === 'pending' &&
        (paymentMethod === 'cod' || paymentStatus === 'paid') && (
          <button
            disabled={Boolean(loading)}
            onClick={() => action('confirm')}
            className={button}
          >
            Xác nhận
          </button>
        )}
      {status === 'confirmed' && (
        <button
          disabled={Boolean(loading)}
          onClick={() => action('ship')}
          className={button}
        >
          Giao hàng
        </button>
      )}
      {status === 'shipping' && (
        <button
          disabled={Boolean(loading) || !receivedAt}
          onClick={() => action('complete')}
          className={button}
        >
          Đã nhận
        </button>
      )}
      {paymentMethod === 'cod' &&
        paymentStatus !== 'paid' &&
        ['shipping', 'completed'].includes(status) && (
          <button
            disabled={Boolean(loading)}
            onClick={() => action('collect')}
            className={`${button} bg-[#dfff00]`}
          >
            Đã thu COD
          </button>
        )}
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {error && (
        <p role="alert" className="w-full text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
