'use client';

import { useRef, useState } from 'react';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error();
      window.location.assign('/');
    } catch {
      setError('Chưa thể đăng xuất. Vui lòng thử lại.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={logout}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold disabled:opacity-50"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {busy ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
