import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import { AdminOrderActions } from '@/components/admin/order-actions';
import { getDb } from '@/db';
import { orders } from '@/db/schema';
import { formatMoney } from '@/lib/catalog';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();
  const rows = await getDb()
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(100);
  return (
    <main className="min-h-screen bg-[#ededE7]">
      <header className="bg-black text-white">
        <div className="mx-auto flex h-18 max-w-[1384px] items-center justify-between px-4 sm:px-8 lg:px-0">
          <Link href="/" className="text-2xl font-black italic">
            MOVA<span className="text-[#dfff00]">.</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/quan-tri/ho-tro" className="text-xs font-bold text-[#dfff00]">Hỗ trợ</Link>
            <p className="text-xs text-white/55">{admin.email}</p>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-[1384px] px-4 py-10 sm:px-8 lg:px-0 lg:py-16">
        <Link
          href="/quan-tri/san-pham"
          className="inline-flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Sản phẩm
        </Link>
        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="section-kicker">MOVA Admin</p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.06em] sm:text-7xl">
              Đơn hàng
            </h1>
          </div>
          <span className="flex items-center gap-2 text-sm font-bold">
            <PackageCheck className="h-5 w-5" />
            {rows.length} đơn
          </span>
        </div>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-black text-white">
              <tr>
                {[
                  'Mã đơn',
                  'Khách nhận',
                  'Tổng',
                  'Trạng thái',
                  'Thanh toán',
                  'Thao tác',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-xs uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {rows.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-mono font-bold">
                    {order.orderCode}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold">{order.recipientName}</p>
                    <p className="text-xs text-neutral-500">
                      {order.recipientPhone}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-black">
                    {formatMoney(order.total)}
                  </td>
                  <td className="px-5 py-4">{order.status}</td>
                  <td className="px-5 py-4">
                    {order.paymentMethod} · {order.paymentStatus}
                  </td>
                  <td className="px-5 py-4">
                    <AdminOrderActions
                      orderCode={order.orderCode}
                      status={order.status}
                      paymentMethod={order.paymentMethod}
                      paymentStatus={order.paymentStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
