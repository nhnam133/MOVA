'use client';

import { requestJson } from '@/lib/client-request';

import { useState } from 'react';

export function ContactStatus({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function update(value: string) {
    setLoading(true);
    const response = await requestJson('/api/admin/support', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'contact', id, status: value }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? 'Không thể cập nhật.');
      setLoading(false);
      return;
    }
    window.location.reload();
  }
  return (
    <div>
      <select
        aria-label="Trạng thái liên hệ"
        disabled={loading}
        value={status}
        onChange={(event) => update(event.target.value)}
        className="h-9 rounded-lg border border-black/15 bg-white px-3 text-xs"
      >
        <option value="new">Mới</option>
        <option value="processing">Đang xử lý</option>
        <option value="resolved">Đã xử lý</option>
      </select>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function ReviewModeration({
  id,
  visible,
}: {
  id: string;
  visible: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function toggle() {
    setLoading(true);
    const response = await requestJson('/api/admin/support', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: 'review',
        id,
        visible: !visible,
        hiddenReason: visible ? 'Nội dung chưa phù hợp quy tắc hiển thị' : null,
      }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? 'Không thể cập nhật.');
      setLoading(false);
      return;
    }
    window.location.reload();
  }
  return (
    <div>
      <button
        disabled={loading}
        onClick={toggle}
        className="h-9 cursor-pointer rounded-full border border-black px-4 text-xs font-bold"
      >
        {visible ? 'Ẩn đánh giá' : 'Hiện lại'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
