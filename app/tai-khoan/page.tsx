import { desc, eq } from 'drizzle-orm';
import Link from '@/components/store/link';
import { ArrowUpRight, Gift, PackageCheck, Settings } from 'lucide-react';
import { getMovaUser } from '@/lib/auth';
import { authConfigured } from '@/lib/supabase-server';
import { AuthForm } from '@/components/store/auth-form';
import { LogoutButton } from '@/components/store/logout-button';
import { SiteHeader } from '@/components/store/site-header';
import { getDb } from '@/db';
import {
  customerVouchers,
  orders,
  pointTransactions,
  users,
  vouchers,
} from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { formatMoney } from '@/lib/catalog';
import { LoyaltyRedeem } from '@/components/store/loyalty-redeem';
import { ProfileSettings } from '@/components/store/profile-settings';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; confirmation?: string }>;
}) {
  const query = await searchParams;
  const user = await getMovaUser();
  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f7f2]">
        <SiteHeader />
        {query.confirmation === 'check' && (
          <output className="mx-auto block max-w-xl px-4 pt-8 text-base">
            Nếu bạn đã xác nhận email, hãy đăng nhập bên dưới. Nếu liên kết đã
            hết hạn, vui lòng liên hệ HAUVIE.
          </output>
        )}
        <AuthForm ready={authConfigured()} returnTo={query.return_to} />
      </main>
    );
  }

  const db = getDb();
  const admin = await getAdminUser();
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);
  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.userId))
    .orderBy(desc(orders.createdAt))
    .limit(10);
  const pointHistory = await db
    .select()
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, user.userId))
    .orderBy(desc(pointTransactions.createdAt))
    .limit(10);
  const myVouchers = await db
    .select({
      id: customerVouchers.id,
      status: customerVouchers.status,
      expiresAt: customerVouchers.expiresAt,
      code: vouchers.code,
      value: vouchers.value,
      minimum: vouchers.minimumOrderValue,
    })
    .from(customerVouchers)
    .innerJoin(vouchers, eq(customerVouchers.voucherId, vouchers.id))
    .where(eq(customerVouchers.userId, user.userId))
    .orderBy(desc(customerVouchers.createdAt));

  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <SiteHeader />
      <section className="mx-auto max-w-[1384px] px-4 py-12 sm:px-8 lg:px-0 lg:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-black pb-9 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
              Xin chào, {user.displayName}
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.06em] sm:text-7xl">
              Tài khoản
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {admin && (
              <Link
                href="/quan-tri"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <Settings className="h-4 w-4" />
                Quản trị
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="border border-black bg-black p-6 text-white">
            <Gift className="h-6 w-6 text-[#eaff2f]" />
            <p className="mt-8 text-5xl font-black">
              {profile?.pointsBalance ?? 0}
            </p>
            <p className="mt-1 text-sm text-white/55">Điểm HAUVIE hiện có</p>
            <LoyaltyRedeem points={profile?.pointsBalance ?? 0} />
          </div>
          <div className="border border-black bg-white p-6">
            <PackageCheck className="h-6 w-6" />
            <p className="mt-8 text-5xl font-black">{customerOrders.length}</p>
            <p className="mt-1 text-sm text-neutral-500">Đơn hàng gần đây</p>
          </div>
          <div className="border border-black bg-[#eaff2f] p-6">
            <p className="text-xs font-black uppercase tracking-wider">
              Quyền lợi thành viên
            </p>
            <p className="mt-8 text-2xl font-black">100 điểm = 20.000đ</p>
            <p className="mt-2 text-sm">Voucher dùng cho đơn từ 200.000đ</p>
          </div>
        </div>
        <ProfileSettings
          email={user.email}
          fullName={profile?.fullName || user.fullName || ''}
          phone={profile?.phone || ''}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-5 text-2xl font-black uppercase">
              Voucher của tôi
            </h2>
            {myVouchers.length === 0 ? (
              <div className="border border-black/20 bg-white p-8 text-sm text-neutral-500">
                Chưa có voucher. Tích đủ 100 điểm để đổi voucher 20.000đ.
              </div>
            ) : (
              <div className="space-y-3">
                {myVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="rounded-xl border border-black/15 bg-white p-5"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-mono text-lg font-black">
                          {voucher.code}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Giảm {formatMoney(voucher.value)} · Đơn từ{' '}
                          {formatMoney(voucher.minimum)}
                        </p>
                      </div>
                      <span className="h-fit rounded-full bg-[#eaff2f] px-3 py-1 text-xs font-bold">
                        {voucher.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-neutral-400">
                      Hạn {new Date(voucher.expiresAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-5 text-2xl font-black uppercase">Lịch sử điểm</h2>
            {pointHistory.length === 0 ? (
              <div className="border border-black/20 bg-white p-8 text-sm text-neutral-500">
                Chưa có giao dịch điểm.
              </div>
            ) : (
              <div className="divide-y divide-black/10 border-y border-black/15 bg-white px-5">
                {pointHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-bold">{entry.note}</p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {new Date(entry.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span
                      className={`font-black ${entry.points > 0 ? 'text-green-700' : 'text-red-600'}`}
                    >
                      {entry.points > 0 ? '+' : ''}
                      {entry.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="mt-12">
          <h2 className="mb-5 text-2xl font-black uppercase">
            Đơn hàng của bạn
          </h2>
          {customerOrders.length === 0 ? (
            <div className="border border-black/20 bg-white p-10 text-center">
              <p className="font-bold">Bạn chưa có đơn hàng nào.</p>
              <Link
                href="/san-pham"
                className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider"
              >
                Khám phá sản phẩm
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-black border-y border-black">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-3 py-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-xs text-neutral-500">Mã đơn</p>
                    <p className="font-black">{order.orderCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Trạng thái</p>
                    <p className="font-medium">
                      {
                        {
                          pending: 'Chờ xác nhận',
                          confirmed: 'Đang chuẩn bị',
                          shipping: 'Đang giao',
                          delivered: 'Đã nhận',
                          completed: 'Hoàn thành',
                          cancelled: 'Đã hủy',
                        }[order.status]
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Tổng tiền</p>
                    <p className="font-black">{formatMoney(order.total)}</p>
                  </div>
                  <Link
                    href={`/tai-khoan/don-hang/${order.orderCode}`}
                    className="text-xs font-bold uppercase underline"
                  >
                    Chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
