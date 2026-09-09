'use client';

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export function AdminOrderActions({ orderCode, status, paymentMethod, paymentStatus }: { orderCode: string; status: string; paymentMethod: string; paymentStatus: string }) {
  const [loading, setLoading] = useState(''); const [error, setError] = useState('');
  async function action(value: string) { setLoading(value); setError(''); const response = await fetch(`/api/admin/orders/${orderCode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: value }) }); const result = await response.json() as { error?: string }; if (!response.ok) { setError(result.error ?? 'Không thể cập nhật.'); setLoading(''); return; } window.location.reload(); }
  const button = 'h-9 cursor-pointer rounded-full border border-black px-4 text-xs font-bold disabled:opacity-40';
  return <div className="flex flex-wrap items-center gap-2">{status === 'pending' && <button onClick={() => action('confirm')} className={button}>Xác nhận</button>}{status === 'confirmed' && <button onClick={() => action('ship')} className={button}>Giao hàng</button>}{status === 'shipping' && <button onClick={() => action('complete')} className={button}>Đã nhận</button>}{paymentMethod === 'cod' && paymentStatus !== 'paid' && status !== 'cancelled' && <button onClick={() => action('collect')} className={`${button} bg-[#dfff00]`}>Đã thu COD</button>}{loading && <LoaderCircle className="h-4 w-4 animate-spin" />}{error && <p role="alert" className="w-full text-xs text-red-600">{error}</p>}</div>;
}
