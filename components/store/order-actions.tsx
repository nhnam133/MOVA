'use client';

import { requestJson } from '@/lib/client-request';

import { useState, type SyntheticEvent } from 'react';
import { CheckCircle2, LoaderCircle, RotateCcw, XCircle } from 'lucide-react';

export function OrderActions({
  orderCode,
  canCancel,
  canReceive,
  canExchange,
  items,
  variants,
}: {
  orderCode: string;
  canCancel: boolean;
  canReceive: boolean;
  canExchange: boolean;
  items: { id: string; label: string; sku: string; quantity: number }[];
  variants: { sku: string; label: string }[];
}) {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [showExchange, setShowExchange] = useState(false);
  const [receivedAt, setReceivedAt] = useState('');
  async function action(kind: 'cancel' | 'receive') {
    setLoading(kind);
    setError('');
    const response = await requestJson(
      `/api/orders/${encodeURIComponent(orderCode)}/actions`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: kind,
          receivedAt:
            kind === 'receive' ? new Date(receivedAt).getTime() : undefined,
        }),
      },
    );
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? 'Không thể xử lý yêu cầu.');
      setLoading('');
      return;
    }
    window.location.reload();
  }
  async function exchange(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading('exchange');
    setError('');
    const data = new FormData(event.currentTarget);
    data.set('action', 'exchange');
    const response = await requestJson(
      `/api/orders/${encodeURIComponent(orderCode)}/actions`,
      { method: 'POST', body: data },
    );
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? 'Không thể gửi yêu cầu đổi.');
      setLoading('');
      return;
    }
    window.location.reload();
  }
  const field =
    'mt-2 h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#dfff00]';
  return (
    <div className="mt-8">
      {canReceive && (
        <label className="mb-4 block text-sm font-bold">
          Thời điểm bạn thực tế nhận hàng
          <input
            type="datetime-local"
            value={receivedAt}
            onChange={(event) => setReceivedAt(event.target.value)}
            className="mt-2 block h-11 max-w-full rounded-lg border bg-white px-3"
          />
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        {canCancel && (
          <button
            onClick={() => action('cancel')}
            disabled={Boolean(loading)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-red-300 bg-white px-5 text-sm font-bold text-red-700"
          >
            <XCircle className="h-4 w-4" />
            Hủy đơn COD
          </button>
        )}
        {canReceive && (
          <button
            onClick={() => action('receive')}
            disabled={Boolean(loading) || !receivedAt}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            Tôi đã nhận hàng
          </button>
        )}
        {canExchange && (
          <button
            onClick={() => setShowExchange((value) => !value)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#dfff00] px-5 text-sm font-black"
          >
            <RotateCcw className="h-4 w-4" />
            Yêu cầu đổi hàng
          </button>
        )}
        {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {showExchange && (
        <form
          onSubmit={exchange}
          className="mt-6 rounded-[20px] border border-black/10 bg-[#f6f6f2] p-5 sm:p-6"
        >
          <h3 className="text-xl font-black">Thông tin đổi hàng</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Sản phẩm
              <select name="orderItemId" required className={field}>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} · SL tối đa {item.quantity}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              Số lượng
              <input
                name="quantity"
                type="number"
                required
                min="1"
                defaultValue="1"
                className={field}
              />
            </label>
            <label className="text-sm font-bold">
              Lý do
              <select name="reason" required className={field}>
                <option value="wrong_size">Chọn sai size</option>
                <option value="defective">Sản phẩm có vấn đề</option>
                <option value="wrong_item">Giao nhầm sản phẩm</option>
                <option value="other">Trường hợp khác</option>
              </select>
            </label>
            <label className="text-sm font-bold">
              Size/SKU muốn đổi
              <select name="replacementSku" className={field}>
                <option value="">Để MOVA hỗ trợ</option>
                {variants.map((variant) => (
                  <option key={variant.sku} value={variant.sku}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold sm:col-span-2">
              Mô tả
              <textarea
                name="description"
                required
                minLength={5}
                rows={3}
                className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#dfff00]"
              />
            </label>
            <label className="text-sm font-bold sm:col-span-2">
              Ảnh minh chứng{' '}
              <span className="font-normal text-neutral-500">
                (bắt buộc nếu hàng lỗi hoặc giao nhầm)
              </span>
              <input
                name="evidence"
                type="file"
                multiple
                accept="image/avif,image/jpeg,image/png,image/webp"
                className="mt-2 block w-full rounded-xl border border-dashed border-black/20 bg-white p-4 text-sm"
              />
            </label>
          </div>
          <button
            disabled={Boolean(loading)}
            className="mt-5 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-black text-white"
          >
            {loading === 'exchange' && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            Gửi yêu cầu
          </button>
        </form>
      )}
    </div>
  );
}
