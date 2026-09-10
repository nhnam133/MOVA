import Link from '@/components/store/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { requireMovaUser } from '@/lib/auth';
import { CheckoutForm } from '@/components/store/checkout-form';
import { SiteHeader } from '@/components/store/site-header';
import { isMomoConfigured } from '@/lib/momo';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await requireMovaUser('/thanh-toan');
  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <div className="bg-[#eaff2f] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black sm:text-xs">
        Phiên thanh toán được bảo vệ
      </div>
      <SiteHeader />
      <section className="mx-auto max-w-[1384px] px-4 py-12 sm:px-8 lg:px-0 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Link
              href="/gio-hang"
              className="mb-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại giỏ hàng
            </Link>
            <h1 className="text-5xl font-black uppercase tracking-[-0.065em] sm:text-7xl">
              Thanh toán
            </h1>
          </div>
          <LockKeyhole className="hidden h-8 w-8 sm:block" />
        </div>
        <CheckoutForm
          customerName={user.fullName ?? ''}
          customerEmail={user.email}
          momoAvailable={isMomoConfigured()}
        />
      </section>
    </main>
  );
}
