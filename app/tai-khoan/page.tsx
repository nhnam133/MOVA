import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowUpRight, Gift, LogOut, PackageCheck, Settings, UserRound } from 'lucide-react';
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { SiteHeader } from '@/components/store/site-header';
import { getDb } from '@/db';
import { orders, users } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { formatMoney } from '@/lib/catalog';

export default async function AccountPage() {
  const user = await getChatGPTUser();
  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f7f2]"><SiteHeader /><section className="mx-auto max-w-2xl px-4 py-24 text-center"><UserRound className="mx-auto h-12 w-12" /><h1 className="mt-7 text-5xl font-black uppercase tracking-[-0.06em]">Tài khoản MOVA</h1><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-neutral-600">Đăng nhập để đặt hàng, theo dõi đơn, tích điểm và gửi yêu cầu đổi size.</p><Link href={chatGPTSignInPath('/tai-khoan')} className="mt-8 inline-flex bg-black px-7 py-4 text-xs font-black uppercase tracking-wider text-white">Đăng nhập an toàn</Link></section></main>
    );
  }

  const db = getDb();
  const admin = await getAdminUser();
  const [profile] = await db.select().from(users).where(eq(users.id, user.userId)).limit(1);
  const customerOrders = await db.select().from(orders).where(eq(orders.userId, user.userId)).orderBy(desc(orders.createdAt)).limit(10);

  return (
    <main className="min-h-screen bg-[#f7f7f2]">
      <SiteHeader />
      <section className="mx-auto max-w-[1384px] px-4 py-12 sm:px-8 lg:px-0 lg:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-black pb-9 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Xin chào, {user.displayName}</p><h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.06em] sm:text-7xl">Tài khoản</h1></div>
          <div className="flex flex-wrap items-center gap-5">
            {admin && <Link href="/quan-tri/san-pham" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><Settings className="h-4 w-4" />Quản trị</Link>}
            <Link href={chatGPTSignOutPath('/')} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><LogOut className="h-4 w-4" />Đăng xuất</Link>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="border border-black bg-black p-6 text-white"><Gift className="h-6 w-6 text-[#eaff2f]" /><p className="mt-8 text-5xl font-black">{profile?.pointsBalance ?? 0}</p><p className="mt-1 text-sm text-white/55">Điểm MOVA hiện có</p></div>
          <div className="border border-black bg-white p-6"><PackageCheck className="h-6 w-6" /><p className="mt-8 text-5xl font-black">{customerOrders.length}</p><p className="mt-1 text-sm text-neutral-500">Đơn hàng gần đây</p></div>
          <div className="border border-black bg-[#eaff2f] p-6"><p className="text-xs font-black uppercase tracking-wider">Quyền lợi thành viên</p><p className="mt-8 text-2xl font-black">100 điểm = 20.000đ</p><p className="mt-2 text-sm">Voucher dùng cho đơn từ 200.000đ</p></div>
        </div>
        <div className="mt-12">
          <h2 className="mb-5 text-2xl font-black uppercase">Đơn hàng của bạn</h2>
          {customerOrders.length === 0 ? (
            <div className="border border-black/20 bg-white p-10 text-center"><p className="font-bold">Bạn chưa có đơn hàng nào.</p><Link href="/san-pham" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider">Khám phá sản phẩm<ArrowUpRight className="h-4 w-4" /></Link></div>
          ) : (
            <div className="divide-y divide-black border-y border-black">{customerOrders.map((order) => <div key={order.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"><div><p className="text-xs text-neutral-500">Mã đơn</p><p className="font-black">{order.orderCode}</p></div><div><p className="text-xs text-neutral-500">Trạng thái</p><p className="font-medium">{order.status}</p></div><div><p className="text-xs text-neutral-500">Tổng tiền</p><p className="font-black">{formatMoney(order.total)}</p></div><Link href={`/thanh-toan/ket-qua?orderCode=${order.orderCode}`} className="text-xs font-bold uppercase underline">Chi tiết</Link></div>)}</div>
          )}
        </div>
      </section>
    </main>
  );
}
