import { desc, eq, sql } from 'drizzle-orm';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';
import { VoucherManager } from '@/components/admin/voucher-manager';
import { getDb } from '@/db';
import { customerVouchers, vouchers } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminVouchersPage() {
  const admin = await requireAdmin();
  const rows = await getDb().select({ id: vouchers.id, code: vouchers.code, value: vouchers.value, minimumOrderValue: vouchers.minimumOrderValue, pointsCost: vouchers.pointsCost, expiresAt: vouchers.expiresAt, active: vouchers.active, assignedCount: sql<number>`count(${customerVouchers.id})` }).from(vouchers).leftJoin(customerVouchers, eq(customerVouchers.voucherId, vouchers.id)).groupBy(vouchers.id).orderBy(desc(vouchers.createdAt));
  return <main className="min-h-screen bg-[#f1f1eb]"><AdminHeader email={admin.email} /><section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8 lg:py-14"><AdminPageIntro title="Voucher" description="Tạo ưu đãi, quy định giá trị đơn tối thiểu và số điểm thành viên cần dùng để đổi." /><div className="mt-8"><VoucherManager initial={rows} /></div></section></main>;
}
