'use client';

import { useRef, useState, type SyntheticEvent } from 'react';
import Link from '@/components/store/link';
import {
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
  CircleAlert,
  MailCheck,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  validateAuth,
  safeAuthReturnPath,
  type AuthMode,
  type AuthFields,
  type AuthErrors,
} from '@/lib/auth-validation';

export function AuthForm({
  ready,
  returnTo = '/tai-khoan',
}: {
  ready: boolean;
  returnTo?: string;
}) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fields, setFields] = useState<AuthFields>({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const summary = useRef<HTMLDivElement>(null);

  function reportError(text: string, fieldErrors: AuthErrors = {}) {
    setErrors(fieldErrors);
    setMessage(text);
    requestAnimationFrame(() => summary.current?.focus());
  }

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !ready) return;
    setSuccess('');
    const invalid = validateAuth(fields, mode);
    if (Object.keys(invalid).length) {
      reportError('Vui lòng kiểm tra thông tin bên dưới.', invalid);
      return;
    }
    submitting.current = true;
    setBusy(true);
    setErrors({});
    setMessage('');
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          returnTo: safeAuthReturnPath(returnTo),
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = (await response.json()) as {
        error?: string;
        errors?: AuthErrors;
        redirectTo?: string;
        message?: string;
      };
      if (!response.ok) {
        reportError(
          result.error || 'Chưa thể xử lý. Vui lòng thử lại.',
          result.errors,
        );
        return;
      }
      setFields((value) => ({ ...value, password: '', confirmPassword: '' }));
      if (result.redirectTo) {
        window.location.assign(safeAuthReturnPath(result.redirectTo));
        return;
      }
      setSuccess(
        result.message ||
          'Vui lòng kiểm tra email để xác nhận tài khoản, sau đó quay lại đăng nhập.',
      );
    } catch {
      reportError(
        'Chưa nhận được phản hồi. Kiểm tra kết nối và email xác nhận trước khi thử lại.',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function field(
    name: keyof AuthFields,
    label: string,
    autocomplete: string,
    type = 'text',
  ) {
    const password = type === 'password';
    return (
      <div className="space-y-2" key={name}>
        <label htmlFor={`auth-${name}`} className="text-sm font-semibold">
          {label}
        </label>
        <div className="relative">
          <Input
            id={`auth-${name}`}
            name={name}
            value={fields[name]}
            autoComplete={autocomplete}
            type={password && visible ? 'text' : type}
            required
            disabled={busy}
            maxLength={name === 'email' ? 254 : name === 'fullName' ? 100 : 128}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={
              errors[name]
                ? `auth-${name}-error`
                : name === 'password' && mode === 'register'
                  ? 'auth-password-hint'
                  : undefined
            }
            onChange={(event) => {
              setFields((value) => ({ ...value, [name]: event.target.value }));
              setErrors((value) => ({ ...value, [name]: undefined }));
            }}
            className={`h-12 rounded-xl border-neutral-400 bg-white px-4 text-base md:text-base ${password ? 'pr-14' : ''}`}
          />
          {password && (
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={visible}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-neutral-600 hover:text-black"
              disabled={busy}
            >
              {visible ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          )}
        </div>
        {name === 'password' && mode === 'register' && (
          <p id="auth-password-hint" className="text-sm text-neutral-600">
            Ít nhất 10 ký tự. Bạn có thể dùng một cụm từ dễ nhớ.
          </p>
        )}
        {errors[name] && (
          <p id={`auth-${name}-error`} className="text-sm text-red-700">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-black/10 bg-card p-6 shadow-sm sm:p-10">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-neutral-600">
          Tài khoản MOVA
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {mode === 'login' ? 'Chào mừng trở lại.' : 'Gia nhập MOVA.'}
        </h1>
        <p className="mb-7 mt-3 text-base leading-6 text-neutral-600">
          {mode === 'login'
            ? 'Đăng nhập để đặt hàng và theo dõi hành trình mua sắm của bạn.'
            : 'Tạo tài khoản để mua sắm, tích điểm và quản lý đơn hàng.'}
        </p>
        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (busy) return;
            setMode(value as AuthMode);
            setErrors({});
            setMessage('');
            setSuccess('');
            setFields((old) => ({ ...old, password: '', confirmPassword: '' }));
          }}
        >
          <TabsList className="mb-6 grid w-full grid-cols-2 rounded-xl bg-muted p-1 group-data-horizontal/tabs:h-14">
            <TabsTrigger
              value="login"
              disabled={busy}
              className="h-12 rounded-lg text-base font-bold"
            >
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger
              value="register"
              disabled={busy}
              className="h-12 rounded-lg text-base font-bold"
            >
              Đăng ký
            </TabsTrigger>
          </TabsList>
          {!ready && (
            <output className="mb-5 block rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Đăng nhập và đăng ký đang được thiết lập. Vui lòng quay lại sau.
            </output>
          )}
          {message && (
            <div
              ref={summary}
              tabIndex={-1}
              role="alert"
              className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
            >
              <p className="flex gap-2 font-semibold">
                <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
                {message}
              </p>
              {Object.entries(errors)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <a
                    key={key}
                    href={`#auth-${key}`}
                    className="mt-2 block underline"
                  >
                    {value}
                  </a>
                ))}
            </div>
          )}
          {success && (
            <output className="mb-5 block rounded-xl border border-green-300 bg-green-50 p-4 text-sm leading-6 text-green-900">
              <MailCheck aria-hidden="true" className="mb-2 size-6" />
              {success}
            </output>
          )}
          {(['login', 'register'] as const).map((tab) => (
            <TabsContent key={tab} value={tab}>
              <form
                onSubmit={submit}
                noValidate
                className="space-y-5"
                aria-busy={busy}
              >
                {tab === 'register' && field('fullName', 'Họ và tên', 'name')}
                {field('email', 'Email', 'email', 'email')}
                {field(
                  'password',
                  'Mật khẩu',
                  tab === 'login' ? 'current-password' : 'new-password',
                  'password',
                )}
                {tab === 'register' &&
                  field(
                    'confirmPassword',
                    'Nhập lại mật khẩu',
                    'new-password',
                    'password',
                  )}
                <button
                  type="submit"
                  disabled={busy || !ready}
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-accent px-5 py-3 text-base font-extrabold text-accent-foreground transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {busy ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin motion-reduce:animate-none"
                    />
                  ) : null}
                  {busy
                    ? 'Đang xử lý…'
                    : tab === 'login'
                      ? 'Đăng nhập'
                      : 'Tạo tài khoản'}
                  {!busy && (
                    <ArrowRight aria-hidden="true" className="size-5" />
                  )}
                </button>
              </form>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Link
        href="/san-pham"
        className="mx-auto mt-6 flex min-h-11 w-fit items-center text-sm font-semibold underline underline-offset-4"
      >
        Tiếp tục khám phá sản phẩm
      </Link>
    </section>
  );
}
