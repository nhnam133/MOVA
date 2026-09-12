import Link from '@/components/store/link';
import {
  Boxes,
  ChartNoAxesCombined,
  CircleHelp,
  Gift,
  PackageCheck,
  Repeat2,
  Tags,
  UsersRound,
} from 'lucide-react';

const links = [
  { href: '/quan-tri', label: 'Tổng quan', icon: ChartNoAxesCombined },
  { href: '/quan-tri/don-hang', label: 'Đơn hàng', icon: PackageCheck },
  { href: '/quan-tri/san-pham', label: 'Sản phẩm', icon: Boxes },
  { href: '/quan-tri/danh-muc', label: 'Danh mục', icon: Tags },
  { href: '/quan-tri/kho', label: 'Kho hàng', icon: PackageCheck },
  { href: '/quan-tri/doi-hang', label: 'Đổi hàng', icon: Repeat2 },
  { href: '/quan-tri/voucher', label: 'Voucher', icon: Gift },
  { href: '/quan-tri/khach-hang', label: 'Khách hàng', icon: UsersRound },
  { href: '/quan-tri/ho-tro', label: 'Hỗ trợ', icon: CircleHelp },
];

export function AdminHeader({ email }: { email?: string }) {
  const navLinks = links.map(({ href, label, icon: Icon }) => (
    <Link
      key={href}
      href={href}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold transition hover:border-[#dfff00] hover:bg-[#dfff00] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfff00]"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  ));
  return (
    <header className="border-b border-white/15 bg-black text-white">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="shrink-0 text-2xl font-black italic tracking-[-0.07em]"
        >
          HAUVIE<span className="text-[#dfff00]">.</span>
        </Link>
        <div className="min-w-0 text-right">
          <p className="text-sm font-black">Trung tâm quản trị</p>
          {email && <p className="truncate text-xs text-white/55">{email}</p>}
        </div>
      </div>
      <details className="group mx-4 mb-4 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-white/25 px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfff00]">
          Menu quản trị
          <span
            className="text-[#dfff00] transition group-open:rotate-45"
            aria-hidden="true"
          >
            +
          </span>
        </summary>
        <nav
          aria-label="Điều hướng quản trị trên điện thoại"
          className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-2 sm:grid-cols-3"
        >
          {navLinks}
        </nav>
      </details>
      <nav
        aria-label="Điều hướng quản trị"
        className="mx-auto hidden max-w-[1480px] flex-wrap gap-2 px-12 pb-4 lg:flex"
      >
        {navLinks}
      </nav>
    </header>
  );
}

export function AdminPageIntro({
  kicker = 'HAUVIE Admin',
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 border-b border-black/15 pb-8 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
          {kicker}
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.055em] sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
