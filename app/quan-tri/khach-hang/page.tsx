import { desc, eq, sql } from 'drizzle-orm';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';
import { CustomerActions } from '@/components/admin/customer-actions';
import { getDb } from '@/db';
import { orders, users } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { formatMoney } from '@/lib/catalog';

export default async function AdminCustomersPage() {
  const admin = await requireAdmin();
  const rows = await getDb().select({ id: users.id, email: users.email, fullName: users.fullName, phone: users.phone, role: users.role, pointsBalance: users.pointsBalance, createdAt: users.createdAt, orderCount: sql<number>`count(${orders.id})`, totalSpent: sql<number>`coalesce(sum(case when ${orders.status}='completed' then ${orders.total} else 0 end),0)` }).from(users).leftJoin(orders, eq(orders.userId, users.id)).groupBy(users.id).orderBy(desc(users.createdAt)).limit(300);
  return <main className="min-h-screen bg-[#f1f1eb]"><AdminHeader email={admin.email} /><section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8 lg:py-14"><AdminPageIntro title="Khách hàng" description="Theo dõi tài khoản, đơn hàng, điểm thành viên và cấp quyền cho người cùng quản trị website." /><div className="mt-8 space-y-4">{rows.map((customer) => <article key={customer.id} className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6"><div className="grid gap-5 lg:grid-cols-[1fr_130px_160px_140px] lg:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black">{customer.fullName || 'Chưa cập nhật tên'}</h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${customer.role === 'admin' ? 'bg-black text-white' : 'bg-neutral-100'}`}>{customer.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span></div><p className="mt-1 text-sm text-neutral-600">{customer.email}</p><p className="text-sm text-neutral-600">{customer.phone || 'Chưa có số điện thoại'}</p></div><div><p className="text-xs text-neutral-500">Đơn hàng</p><p className="mt-1 text-2xl font-black">{customer.orderCount}</p></div><div><p className="text-xs text-neutral-500">Đã chi tiêu</p><p className="mt-1 text-xl font-black">{formatMoney(customer.totalSpent)}</p></div><div><p className="text-xs text-neutral-500">Điểm hiện có</p><p className="mt-1 text-2xl font-black">{customer.pointsBalance}</p></div></div><div className="mt-5 border-t border-black/10 pt-5"><CustomerActions userId={customer.id} role={customer.role} /></div></article>)}</div></section></main>;
}
