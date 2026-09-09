'use client';

import { useState } from 'react';
import { Gift, LoaderCircle } from 'lucide-react';

export function LoyaltyRedeem({ points }: { points: number }) {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState('');
  async function redeem() { setLoading(true); setMessage(''); const response = await fetch('/api/loyalty/redeem', { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() } }); const result = await response.json() as { error?: string; code?: string }; if (!response.ok) { setMessage(result.error ?? 'Không thể đổi voucher.'); setLoading(false); return; } setMessage(`Đổi thành công voucher ${result.code}. Đang cập nhật...`); window.setTimeout(() => window.location.reload(), 700); }
  return <div className="mt-5"><button onClick={redeem} disabled={loading || points < 100} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#dfff00] px-5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-40">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}Đổi 100 điểm</button>{message && <output className="mt-3 block text-xs leading-5 text-white/70">{message}</output>}</div>;
}
