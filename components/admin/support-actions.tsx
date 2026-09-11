'use client';

import { requestJson } from '@/lib/client-request';

import { useState, type SyntheticEvent } from 'react';

export function ContactStatus({ id, status, adminNote }: { id: string; status: string; adminNote?: string | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function update(value: string, note = adminNote || '') {
    setLoading(true);
    const response = await requestJson('/api/admin/support', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'contact', id, status: value, adminNote: note }),
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
    <div className="min-w-[220px]">
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
      <form onSubmit={(event: SyntheticEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const value = data.get('adminNote'); void update(status, typeof value === 'string' ? value : ''); }} className="mt-2 flex gap-2">
        <input name="adminNote" defaultValue={adminNote || ''} maxLength={1000} placeholder="Ghi chú xử lý" aria-label="Ghi chú xử lý liên hệ" className="min-h-11 min-w-0 flex-1 rounded-lg border border-black/15 px-3 text-sm" />
        <button disabled={loading} className="min-h-11 rounded-full bg-black px-4 text-xs font-bold text-white">Lưu</button>
      </form>
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
  adminReply,
}: {
  id: string;
  visible: boolean;
  adminReply?: string | null;
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
  async function reply(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); const data = new FormData(event.currentTarget);
    const response = await requestJson('/api/admin/support', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'review-reply', id, adminReply: data.get('adminReply') }) });
    if (!response.ok) { const data = await response.json() as { error?: string }; setError(data.error || 'Không thể lưu phản hồi.'); setLoading(false); return; }
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
      <form onSubmit={reply} className="mt-2 flex min-w-[240px] gap-2">
        <input name="adminReply" defaultValue={adminReply || ''} maxLength={1000} placeholder="Phản hồi của HAUVIE" aria-label="Phản hồi đánh giá" className="min-h-11 min-w-0 flex-1 rounded-lg border border-black/15 px-3 text-sm" />
        <button disabled={loading} className="min-h-11 rounded-full bg-[#dfff00] px-4 text-xs font-black">Lưu</button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
