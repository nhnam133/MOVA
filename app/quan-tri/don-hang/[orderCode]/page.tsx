import { asc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from '@/components/store/link';
import { ArrowLeft, MapPin, ReceiptText, UserRound } from 'lucide-react';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';
import { AdminOrderActions } from '@/components/admin/order-actions';
import { getDb } from '@/db';
import { orderEvents, orderItems, orders, users } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { formatMoney } from '@/lib/catalog';

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đang chuẩn bị', shipping: 'Đang giao',
  delivered: 'Đã nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};
const eventLabels: Record<string, string> = {
  created: 'Đơn hàng được tạo', confirmed: 'Đã xác nhận đơn', shipping: 'Bắt đầu giao hàng',
  completed: 'Khách đã nhận hàng', payment_collected: 'Đã thu tiền COD', cancelled: 'Đã hủy đơn',
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const admin = await requireAdmin();
  const { orderCode } = await params;
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.orderCode, orderCode)).limit(1);
  if (!order) notFound();
  const [items, events, [customer]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt)),
    db.select({ email: users.email, fullName: users.fullName, phone: users.phone }).from(users).where(eq(users.id, order.userId)).limit(1),
  ]);

  return (
    <main className="min-h-screen bg-[#f1f1eb]">
      <AdminHeader email={admin.email} />
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8 lg:py-14">
        <Link href="/quan-tri/don-hang" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" />Danh sách đơn hàng</Link>
        <div className="mt-4">
          <AdminPageIntro
            title={order.orderCode}
            description={`Đặt lúc ${new Date(order.createdAt).toLocaleString('vi-VN')}`}
            action={<span className="rounded-full bg-[#dfff00] px-4 py-2 text-sm font-black">{statusLabels[order.status]}</span>}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-3"><ReceiptText className="h-5 w-5" /><h2 className="text-xl font-black">Sản phẩm</h2></div>
              <div className="mt-5 divide-y divide-black/10">
                {items.map((item) => (
                  <div key={item.id} className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_100px_130px] sm:items-center">
                    <div><p className="font-bold">{item.productName}</p><p className="mt-1 text-xs text-neutral-500">{item.sku} · {item.color} / {item.size}</p></div>
                    <p>{item.quantity} × {formatMoney(item.unitPrice)}</p>
                    <p className="font-black sm:text-right">{formatMoney(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
              <dl className="ml-auto mt-5 max-w-sm space-y-3 border-t border-black pt-5 text-sm">
                <div className="flex justify-between"><dt>Tạm tính</dt><dd>{formatMoney(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Giảm giá</dt><dd>-{formatMoney(order.discount)}</dd></div>
                <div className="flex justify-between"><dt>Phí vận chuyển</dt><dd>{formatMoney(order.shippingFee)}</dd></div>
                <div className="flex justify-between text-lg font-black"><dt>Tổng cộng</dt><dd>{formatMoney(order.total)}</dd></div>
              </dl>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
              <h2 className="text-xl font-black">Cập nhật đơn hàng</h2>
              <p className="mt-2 text-sm text-neutral-600">Thanh toán: {order.paymentMethod === 'cod' ? 'COD' : 'MoMo'} · {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
              <div className="mt-5"><AdminOrderActions orderCode={order.orderCode} status={order.status} paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus} /></div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-3"><UserRound className="h-5 w-5" /><h2 className="text-xl font-black">Khách hàng</h2></div>
              <dl className="mt-5 space-y-3 text-sm"><div><dt className="text-neutral-500">Tài khoản</dt><dd className="font-bold">{customer?.fullName || order.recipientName}</dd><dd>{customer?.email}</dd></div><div><dt className="text-neutral-500">Điện thoại</dt><dd>{customer?.phone || order.recipientPhone}</dd></div></dl>
            </section>
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-3"><MapPin className="h-5 w-5" /><h2 className="text-xl font-black">Giao hàng</h2></div>
              <p className="mt-5 font-bold">{order.recipientName} · {order.recipientPhone}</p>
              <p className="mt-2 text-sm leading-6">{order.addressLine}, {order.ward}, {order.district}, {order.province}</p>
              {order.note && <p className="mt-4 rounded-xl bg-neutral-100 p-4 text-sm"><strong>Ghi chú:</strong> {order.note}</p>}
            </section>
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
              <h2 className="text-xl font-black">Lịch sử xử lý</h2>
              <div className="mt-5 space-y-4">
                <div className="border-l-2 border-black pl-4"><p className="text-sm font-bold">Đơn hàng được tạo</p><p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p></div>
                {events.map((event) => <div key={event.id} className="border-l-2 border-[#dfff00] pl-4"><p className="text-sm font-bold">{eventLabels[event.eventType] || event.eventType}</p>{event.note && <p className="mt-1 text-sm text-neutral-600">{event.note}</p>}<p className="mt-1 text-xs text-neutral-500">{new Date(event.createdAt).toLocaleString('vi-VN')}</p></div>)}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
