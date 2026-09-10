'use client';

import { requestJson } from '@/lib/client-request';

import { useState, type SyntheticEvent } from 'react';
import { CheckCircle2, LoaderCircle, Send } from 'lucide-react';

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('loading');
    setError('');
    const form = event.currentTarget;
    const response = await requestJson('/api/contact', {
      method: 'POST',
      body: new FormData(form),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? 'Không thể gửi liên hệ.');
      setState('idle');
      return;
    }
    form.reset();
    setState('success');
  }
  const field =
    'mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-black focus:ring-2 focus:ring-[#dfff00]';
  return (
    <form
      onSubmit={submit}
      className="rounded-[22px] border border-black/10 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-2xl font-black">Gửi lời nhắn cho MOVA</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-500">
        Bạn chỉ cần cung cấp email hoặc số điện thoại để MOVA có thể phản hồi.
      </p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Họ và tên
          <input name="name" required minLength={2} className={field} />
        </label>
        <label className="text-sm font-bold">
          Email
          <input name="email" type="email" className={field} />
        </label>
        <label className="text-sm font-bold">
          Số điện thoại
          <input name="phone" inputMode="tel" className={field} />
        </label>
        <label className="text-sm font-bold sm:col-span-2">
          Nội dung
          <textarea
            name="message"
            required
            minLength={10}
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-black/15 bg-white p-4 text-sm outline-none focus:border-black focus:ring-2 focus:ring-[#dfff00]"
          />
        </label>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {state === 'success' && (
        <output className="mt-5 flex items-center gap-2 rounded-xl bg-lime-50 p-3 text-sm font-bold">
          <CheckCircle2 className="h-4 w-4" />
          MOVA đã nhận được lời nhắn của bạn.
        </output>
      )}
      <button
        disabled={state === 'loading'}
        className="mt-6 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-black text-white disabled:opacity-50"
      >
        {state === 'loading' ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Gửi liên hệ
      </button>
    </form>
  );
}
