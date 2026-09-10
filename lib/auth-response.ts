import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthClient } from '@/lib/supabase-server';
import type { CookieOptions } from '@supabase/ssr';

export async function authResponseClient() {
  const jar = await cookies();
  const pending: { name: string; value: string; options: CookieOptions }[] = [];
  const client = createAuthClient({
    getAll: () => jar.getAll(),
    setAll(values) {
      pending.push(...values);
    },
  });
  function json(body: unknown, status = 200) {
    const response = NextResponse.json(body, {
      status,
      headers: { 'Cache-Control': 'private, no-store' },
    });
    pending.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    return response;
  }
  function redirect(url: URL) {
    const response = NextResponse.redirect(url, 303);
    response.headers.set('Cache-Control', 'private, no-store');
    pending.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    return response;
  }
  return { client, json, redirect };
}
