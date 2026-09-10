'use client';

import { requestJson } from '@/lib/client-request';

import { useState, type SyntheticEvent } from 'react';
import { LoaderCircle, Star } from 'lucide-react';

export function ReviewForm({
  productSlug,
  signedIn,
}: {
  productSlug: string;
  signedIn: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const data = new FormData(event.currentTarget);
    const response = await requestJson('/api/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productSlug,
        rating,
        content: data.get('content'),
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error ?? 'Không thể gửi đánh giá.');
      setLoading(false);
      return;
    }
    window.location.reload();
  }
  if (!signedIn)
    return (
      <p className="rounded-xl bg-[#f6f6f2] p-4 text-sm text-neutral-500">
        Đăng nhập và hoàn thành đơn có sản phẩm này để viết đánh giá.
      </p>
    );
  return (
    <form onSubmit={submit} className="rounded-2xl bg-[#f6f6f2] p-5">
      <p className="text-sm font-black">Đánh giá của bạn</p>
      <div className="mt-3 flex gap-1" aria-label={`${rating} sao`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setRating(value)}
            className="cursor-pointer p-1"
            aria-label={`Chọn ${value} sao`}
          >
            <Star
              className={`h-5 w-5 ${value <= rating ? 'fill-[#dfff00] text-black' : 'text-neutral-300'}`}
            />
          </button>
        ))}
      </div>
      <textarea
        name="content"
        required
        minLength={5}
        rows={3}
        placeholder="Chia sẻ trải nghiệm thật về sản phẩm"
        className="mt-3 w-full resize-none rounded-xl border border-black/15 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#dfff00]"
      />
      {message && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {message}
        </p>
      )}
      <button
        disabled={loading}
        className="mt-3 flex h-10 cursor-pointer items-center gap-2 rounded-full bg-black px-5 text-xs font-black text-white"
      >
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}Gửi / cập
        nhật đánh giá
      </button>
    </form>
  );
}
