export type AuthMode = 'login' | 'register';
export type AuthFields = {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
};
export type AuthErrors = Partial<Record<keyof AuthFields, string>>;

export function validateAuth(fields: AuthFields, mode: AuthMode): AuthErrors {
  const errors: AuthErrors = {};
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ||
    fields.email.length > 254
  )
    errors.email = 'Nhập địa chỉ email hợp lệ.';
  if (!fields.password || fields.password.length > 128)
    errors.password = 'Nhập mật khẩu, tối đa 128 ký tự.';
  if (mode === 'register') {
    if (
      fields.fullName.trim().length < 2 ||
      fields.fullName.trim().length > 100
    )
      errors.fullName = 'Họ tên cần từ 2 đến 100 ký tự.';
    if (fields.password.length < 10 || fields.password.length > 128)
      errors.password = 'Mật khẩu cần từ 10 đến 128 ký tự.';
    if (fields.confirmPassword !== fields.password)
      errors.confirmPassword = 'Mật khẩu nhập lại chưa khớp.';
  }
  return errors;
}

export function safeAuthReturnPath(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.includes('\\') ||
    value.split('').some((character) => character.charCodeAt(0) <= 32)
  )
    return '/tai-khoan';
  try {
    const url = new URL(value, 'https://mova.local');
    if (
      url.origin !== 'https://mova.local' ||
      /^\/(?:api|auth|signin-with-chatgpt|signout-with-chatgpt|callback)(?:\/|$)/.test(
        url.pathname,
      )
    )
      return '/tai-khoan';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/tai-khoan';
  }
}

export function isSameOriginMutation(
  request: Request,
  configuredOrigin?: string,
): boolean {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return false;
  try {
    return (
      origin === new URL(configuredOrigin || request.url).origin &&
      request.headers.get('sec-fetch-site') !== 'cross-site'
    );
  } catch {
    return false;
  }
}
