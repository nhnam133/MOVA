import test from 'node:test';
import assert from 'node:assert/strict';
import {
  safeAuthReturnPath,
  isSameOriginMutation,
  validateAuth,
} from '../lib/auth-validation.ts';

test('auth redirects reject external, escaped, and reserved destinations', () => {
  for (const value of [
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/api/auth/logout',
    '/signin-with-chatgpt',
    '/auth/confirm',
    '/\n/evil.test',
  ])
    assert.equal(safeAuthReturnPath(value), '/tai-khoan');
  assert.equal(
    safeAuthReturnPath('/thanh-toan?coupon=MOVA'),
    '/thanh-toan?coupon=MOVA',
  );
});

test('cookie-auth mutations require matching origin, rejecting missing origin and cross-site fetch', () => {
  const origin = 'https://mova.example';
  assert.equal(
    isSameOriginMutation(new Request(origin, { headers: { origin } }), origin),
    true,
  );
  const invalidHeaders: Record<string, string>[] = [
    {},
    { origin: 'https://evil.test' },
    { origin: 'null' },
    { origin, 'sec-fetch-site': 'cross-site' },
  ];
  for (const headers of invalidHeaders)
    assert.equal(
      isSameOriginMutation(new Request(origin, { headers }), origin),
      false,
    );
});

test('registration validates email, name, password length, and confirmation; login permits existing password', () => {
  const valid = {
    fullName: 'Nguyễn An',
    email: 'an@example.com',
    password: 'mot cum tu de nho',
    confirmPassword: 'mot cum tu de nho',
  };
  assert.deepEqual(validateAuth(valid, 'register'), {});
  assert.equal(
    Object.keys(
      validateAuth(
        {
          fullName: '',
          email: 'not-email',
          password: '123',
          confirmPassword: '321',
        },
        'register',
      ),
    ).length,
    4,
  );
  assert.deepEqual(
    validateAuth(
      { ...valid, fullName: '', password: 'existing', confirmPassword: '' },
      'login',
    ),
    {},
  );
});
