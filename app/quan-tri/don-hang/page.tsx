import { and, desc, eq, gte, like, lte, or, type SQL } from 'drizzle-orm';
import Link from '@/components/store/link';
import { ArrowUpRight, PackageCheck, Search } from 'lucide-react';
import { AdminOrderActions } from '@/components/admin/order-actions';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { formatMoney } from '@/lib/catalog';
import { requireAdmin } from '@/lib/admin-auth';

const orderLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};
const paymentLabels: Record<string, string> = {
  unpaid: 'Chưa thanh toán',
  pending: 'Đang chờ',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  manual_refund: 'Đã hoàn thủ công',
};
type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'completed' | 'cancelled';

function dateBoundary(value: string | undefined, end = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00'}+07:00`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    trang_thai?: string;
    tu_ngay?: string;
    den_ngay?: string;
  }>;
}) {
  const admin = await requireAdmin();
  const query = await searchParams;
  const filters: SQL[] = [];
  const keyword = query.q?.trim().slice(0, 80);
  if (keyword) {
    const pattern = `%${keyword.replaceAll('%', '')}%`;
    filters.push(
      or(
        like(orders.orderCode, pattern),
        like(orders.recipientName, pattern),
        like(orders.recipientPhone, pattern),
      )!,
    );
  }
  if (query.trang_thai && Object.hasOwn(orderLabels, query.trang_thai))
    filters.push(eq(orders.status, query.trang_thai as OrderStatus));
  const from = dateBoundary(query.tu_ngay);
  const to = dateBoundary(query.den_ngay, true);
  if (from) filters.push(gte(orders.createdAt, from));
  if (to) filters.push(lte(orders.createdAt, to));

  const rows = await getDb()
    .select()
    .from(orders)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  return (
    <main className="min-h-screen bg-[#f1f1eb]">
      <AdminHeader email={admin.email} />
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
        <AdminPageIntro
          title="Đơn hàng"
          description="Tìm kiếm, kiểm tra thông tin và cập nhật từng bước xử lý đơn."
          action={
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              <PackageCheck className="h-5 w-5" /> {rows.length} đơn phù hợp
            </span>
          }
        />

        <form className="mt-6 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end">
          <label className="text-sm font-bold">
            Tìm đơn hàng
            <div className="mt-2 flex min-h-11 items-center rounded-lg border border-black/20 px-3 focus-within:border-black">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input name="q" defaultValue={query.q} placeholder="Mã đơn, tên hoặc số điện thoại" className="min-w-0 flex-1 px-2 text-base outline-none" />
            </div>
          </label>
          <label className="text-sm font-bold">
            Trạng thái
            <select name="trang_thai" defaultValue={query.trang_thai || ''} className="mt-2 min-h-11 w-full rounded-lg border border-black/20 bg-white px-3 text-base">
              <option value="">Tất cả</option>
              {Object.entries(orderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">Từ ngày<input name="tu_ngay" type="date" defaultValue={query.tu_ngay} className="mt-2 min-h-11 w-full rounded-lg border border-black/20 px-3 text-base" /></label>
          <label className="text-sm font-bold">Đến ngày<input name="den_ngay" type="date" defaultValue={query.den_ngay} className="mt-2 min-h-11 w-full rounded-lg border border-black/20 px-3 text-base" /></label>
          <button className="min-h-11 rounded-full bg-[#dfff00] px-6 text-sm font-black">Lọc đơn</button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-black text-white"><tr>{['Mã đơn', 'Khách nhận', 'Ngày đặt', 'Tổng', 'Trạng thái', 'Thanh toán', 'Thao tác'].map((heading) => <th key={heading} className="px-5 py-4 text-xs uppercase tracking-wider">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-black/10">
              {rows.map((order) => (
                <tr key={order.id} className="align-top hover:bg-neutral-50">
                  <td className="px-5 py-4"><Link href={`/quan-tri/don-hang/${order.orderCode}`} className="inline-flex items-center gap-1 font-mono font-black underline underline-offset-4">{order.orderCode}<ArrowUpRight className="h-3.5 w-3.5" /></Link></td>
                  <td className="px-5 py-4"><p className="font-bold">{order.recipientName}</p><p className="mt-1 text-xs text-neutral-500">{order.recipientPhone}</p></td>
                  <td className="px-5 py-4 text-xs text-neutral-600">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="px-5 py-4 font-black">{formatMoney(order.total)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold">{orderLabels[order.status]}</span></td>
                  <td className="px-5 py-4"><p className="font-bold">{order.paymentMethod === 'cod' ? 'COD' : 'MoMo'}</p><p className="mt-1 text-xs text-neutral-500">{paymentLabels[order.paymentStatus]}</p></td>
                  <td className="px-5 py-4"><AdminOrderActions orderCode={order.orderCode} status={order.status} paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-6 py-16 text-center text-neutral-500">Không có đơn hàng phù hợp bộ lọc.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
