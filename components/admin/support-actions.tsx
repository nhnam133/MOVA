'use client';

import { useState } from 'react';

export function ContactStatus({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);
  async function update(value: string) {
    setLoading(true);
    await fetch('/api/admin/support', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'contact', id, status: value }),
    });
    window.location.reload();
  }
  return (
    <select
      disabled={loading}
      value={status}
      onChange={(event) => update(event.target.value)}
      className="h-9 rounded-lg border border-black/15 bg-white px-3 text-xs"
    >
      <option value="new">Mới</option>
      <option value="processing">Đang xử lý</option>
      <option value="resolved">Đã xử lý</option>
    </select>
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
  async function toggle() {
    setLoading(true);
    await fetch('/api/admin/support', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: 'review',
        id,
        visible: !visible,
        hiddenReason: visible ? 'Nội dung chưa phù hợp quy tắc hiển thị' : null,
      }),
    });
    window.location.reload();
  }
  return (
    <button
      disabled={loading}
      onClick={toggle}
      className="h-9 cursor-pointer rounded-full border border-black px-4 text-xs font-bold"
    >
      {visible ? 'Ẩn đánh giá' : 'Hiện lại'}
    </button>
  );
}
