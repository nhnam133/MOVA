'use client';

import { useState, type SyntheticEvent } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { requestJson } from '@/lib/client-request';

export function ProfileSettings({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [busy, setBusy] = useState(''); const [message, setMessage] = useState(''); const [success, setSuccess] = useState(false);
  const input = 'mt-2 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 text-base focus:border-black focus:outline-none';
  async function submit(event: SyntheticEvent<HTMLFormElement>, action: 'profile' | 'password') {
    event.preventDefault(); setBusy(action); setMessage(''); setSuccess(false); const data = new FormData(event.currentTarget);
    const response = await requestJson('/api/account/profile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, fullName: data.get('fullName'), phone: data.get('phone'), password: data.get('password'), confirmPassword: data.get('confirmPassword') }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error || 'Không thể cập nhật.'); setBusy(''); return; }
    setSuccess(true); setBusy(''); if (action === 'profile') window.setTimeout(() => window.location.reload(), 500); else event.currentTarget.reset();
  }
  return <section className="mt-12"><h2 className="mb-5 text-2xl font-black uppercase">Thông tin tài khoản</h2><div className="grid gap-5 lg:grid-cols-2">
    <form onSubmit={(event) => submit(event, 'profile')} className="rounded-2xl border border-black/15 bg-white p-5 sm:p-6"><h3 className="text-lg font-black">Hồ sơ cá nhân</h3><label className="mt-5 block text-sm font-bold">Email<input value={email} readOnly className={`${input} bg-neutral-100 text-neutral-500`} /></label><label className="mt-4 block text-sm font-bold">Họ và tên<input name="fullName" required minLength={2} maxLength={100} defaultValue={fullName} className={input} /></label><label className="mt-4 block text-sm font-bold">Số điện thoại<input name="phone" inputMode="tel" defaultValue={phone} placeholder="09xxxxxxxx" className={input} /></label><button disabled={Boolean(busy)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white">{busy === 'profile' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Lưu hồ sơ</button></form>
    <form onSubmit={(event) => submit(event, 'password')} className="rounded-2xl border border-black/15 bg-white p-5 sm:p-6"><h3 className="text-lg font-black">Đổi mật khẩu</h3><p className="mt-2 text-sm text-neutral-600">Dùng tối thiểu 8 ký tự và không chia sẻ mật khẩu với người khác.</p><label className="mt-5 block text-sm font-bold">Mật khẩu mới<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={input} /></label><label className="mt-4 block text-sm font-bold">Nhập lại mật khẩu<input name="confirmPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={input} /></label><button disabled={Boolean(busy)} className="mt-5 min-h-11 rounded-full bg-[#dfff00] px-5 text-sm font-black">{busy === 'password' ? 'Đang đổi…' : 'Đổi mật khẩu'}</button></form>
  </div>{message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</p>}{success && <output className="mt-4 block rounded-xl bg-green-50 p-4 text-sm font-bold text-green-800">Đã cập nhật thành công.</output>}</section>;
}
