import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import Link from '@/components/store/link';
import {
  ArrowUpRight,
  Banknote,
  Boxes,
  PackageCheck,
  ShoppingBag,
  TriangleAlert,
} from 'lucide-react';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';
import { getDb } from '@/db';
import { orderItems, orders, products, productVariants } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { formatMoney } from '@/lib/catalog';

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

function readDate(value: string | undefined, end = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00'}+07:00`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tu_ngay?: string; den_ngay?: string }>;
}) {
  const admin = await requireAdmin();
  const query = await searchParams;
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toLocaleDateString('en-CA');
  const fromValue = query.tu_ngay || defaultFrom;
  const toValue = query.den_ngay || now.toLocaleDateString('en-CA');
  const from = readDate(fromValue) ?? 0;
  const to = readDate(toValue, true) ?? now.getTime();
  const db = getDb();
  const condition = and(gte(orders.createdAt, from), lte(orders.createdAt, to));
  const [rangeOrders, [{ productCount }], [{ lowStockCount }], topProducts] =
    await Promise.all([
      db.select().from(orders).where(condition).orderBy(desc(orders.createdAt)),
      db
        .select({ productCount: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.status, 'active')),
      db
        .select({ lowStockCount: sql<number>`count(*)` })
        .from(productVariants)
        .where(
          and(
            eq(productVariants.active, true),
            sql`${productVariants.stock} - ${productVariants.reservedStock} <= 3`,
          ),
        ),
      db
        .select({
          name: orderItems.productName,
          quantity: sql<number>`sum(${orderItems.quantity})`,
          revenue: sql<number>`sum(${orderItems.lineTotal})`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(condition, eq(orders.status, 'completed')))
        .groupBy(orderItems.productName)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5),
    ]);

  const completed = rangeOrders.filter((order) => order.status === 'completed');
  const revenue = completed.reduce((sum, order) => sum + order.total, 0);
  const soldOrders = rangeOrders.filter((order) => order.status !== 'cancelled');
  const statusCounts = Object.keys(statusLabels).map((status) => ({
    status,
    count: rangeOrders.filter((order) => order.status === status).length,
  }));
  const maxStatus = Math.max(1, ...statusCounts.map((entry) => entry.count));

  const cards = [
    {
      label: 'Doanh thu hoàn thành',
      value: formatMoney(revenue),
      note: `${completed.length} đơn hoàn thành`,
      icon: Banknote,
    },
    {
      label: 'Đơn trong kỳ',
      value: String(rangeOrders.length),
      note: `${soldOrders.length} đơn không bị hủy`,
      icon: ShoppingBag,
    },
    {
      label: 'Sản phẩm đang bán',
      value: String(productCount),
      note: 'Hiển thị trên cửa hàng',
      icon: Boxes,
    },
    {
      label: 'SKU sắp hết',
      value: String(lowStockCount),
      note: 'Còn tối đa 3 sản phẩm khả dụng',
      icon: TriangleAlert,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f1f1eb]">
      <AdminHeader email={admin.email} />
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
        <AdminPageIntro
          title="Tổng quan"
          description="Theo dõi doanh thu, tình trạng đơn hàng và tồn kho trong khoảng thời gian bạn chọn."
          action={
            <Link
              href="/quan-tri/don-hang"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white"
            >
              Xử lý đơn hàng <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />

        <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:flex-row sm:items-end">
          <label className="text-sm font-bold">
            Từ ngày
            <input
              name="tu_ngay"
              type="date"
              defaultValue={fromValue}
              className="mt-2 block min-h-11 rounded-lg border border-black/20 px-3 text-base"
            />
          </label>
          <label className="text-sm font-bold">
            Đến ngày
            <input
              name="den_ngay"
              type="date"
              defaultValue={toValue}
              className="mt-2 block min-h-11 rounded-lg border border-black/20 px-3 text-base"
            />
          </label>
          <button className="min-h-11 rounded-full bg-[#dfff00] px-6 text-sm font-black">
            Xem báo cáo
          </button>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, note, icon: Icon }, index) => (
            <article
              key={label}
              className={`border border-black p-6 ${index === 0 ? 'bg-black text-white' : index === 3 ? 'bg-[#dfff00]' : 'bg-white'}`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <p className={`mt-8 text-sm font-bold ${index === 0 ? 'text-white/60' : 'text-neutral-600'}`}>
                {label}
              </p>
              <p className="mt-1 break-words text-3xl font-black sm:text-4xl">
                {value}
              </p>
              <p className={`mt-2 text-sm ${index === 0 ? 'text-white/60' : 'text-neutral-600'}`}>
                {note}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
                  Phân bổ
                </p>
                <h2 className="mt-2 text-2xl font-black">Trạng thái đơn hàng</h2>
              </div>
              <PackageCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="mt-7 space-y-5">
              {statusCounts.map((entry) => (
                <div key={entry.status}>
                  <div className="mb-2 flex justify-between gap-4 text-sm">
                    <span className="font-bold">{statusLabels[entry.status]}</span>
                    <span>{entry.count} đơn</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{ width: `${Math.max(entry.count ? 4 : 0, (entry.count / maxStatus) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
              Bán chạy
            </p>
            <h2 className="mt-2 text-2xl font-black">Sản phẩm nổi bật trong kỳ</h2>
            {topProducts.length === 0 ? (
              <p className="mt-8 rounded-xl bg-neutral-100 p-6 text-sm text-neutral-600">
                Chưa có đơn hoàn thành trong khoảng ngày đã chọn.
              </p>
            ) : (
              <div className="mt-6 divide-y divide-black/10">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dfff00] text-sm font-black">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{product.name}</p>
                        <p className="text-sm text-neutral-500">{product.quantity} sản phẩm</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-black">{formatMoney(product.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
