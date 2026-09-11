import { and, eq } from 'drizzle-orm';
import Link from '@/components/store/link';
import { Check, Clock3, X } from 'lucide-react';
import { requireMovaUser } from '@/lib/auth';
import { SiteHeader } from '@/components/store/site-header';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { formatMoney } from '@/lib/catalog';

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderCode?: string }>;
}) {
  const user = await requireMovaUser('/thanh-toan/ket-qua');
  const orderCode = (await searchParams).orderCode;
  const [order] = orderCode
    ? await getDb()
        .select()
        .from(orders)
        .where(
          and(eq(orders.orderCode, orderCode), eq(orders.userId, user.userId)),
        )
        .limit(1)
    : [];
  const paid = order?.paymentStatus === 'paid';
  const failed = order?.paymentStatus === 'failed';
  const Icon = failed ? X : paid ? Check : Clock3;
  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-8 lg:py-28">
        <span
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${failed ? 'bg-red-100 text-red-600' : 'bg-[#eaff2f] text-black'}`}
        >
          <Icon className="h-8 w-8" />
        </span>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
          {order ? `Đơn hàng ${order.orderCode}` : 'Không tìm thấy đơn'}
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
          {failed
            ? 'Thanh toán chưa thành công'
            : paid
              ? 'Thanh toán thành công'
              : 'Đã nhận đơn hàng'}
        </h1>
        {order && (
          <>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-600">
              {order.paymentMethod === 'cod'
                ? 'HAUVIE sẽ xác nhận và chuẩn bị đơn. Bạn thanh toán khi nhận hàng.'
                : paid
                  ? 'MoMo đã xác nhận giao dịch. HAUVIE sẽ sớm chuẩn bị đơn.'
                  : 'Kết quả MoMo đang được cập nhật. Bạn có thể kiểm tra lại trong tài khoản.'}
            </p>
            <p className="mt-5 text-2xl font-black">
              {formatMoney(order.total)}
            </p>
          </>
        )}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/tai-khoan"
            className="bg-black px-6 py-4 text-xs font-black uppercase tracking-wider text-white"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/san-pham"
            className="border border-black bg-white px-6 py-4 text-xs font-black uppercase tracking-wider"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </main>
  );
}
