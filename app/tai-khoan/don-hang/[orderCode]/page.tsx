import { and, desc, eq, sql } from 'drizzle-orm';
import Link from '@/components/store/link';
import { ArrowLeft, Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireMovaUser } from '@/lib/auth';
import { OrderActions } from '@/components/store/order-actions';
import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';
import { getDb } from '@/db';
import {
  exchangeRequests,
  orderItems,
  orders,
  productVariants,
} from '@/db/schema';
import { isExchangeWindowOpen } from '@/lib/business-rules';
import { formatMoney } from '@/lib/catalog';
import { ExchangeAdditionalInfo } from '@/components/store/exchange-additional-info';

const statusLabel: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã nhận hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;
  const user = await requireMovaUser(`/tai-khoan/don-hang/${orderCode}`);
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderCode, orderCode), eq(orders.userId, user.userId)))
    .limit(1);
  if (!order) notFound();
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const exchanges = await db
    .select()
    .from(exchangeRequests)
    .where(eq(exchangeRequests.orderId, order.id))
    .orderBy(desc(exchangeRequests.requestedAt));
  const variants = await db
    .select({
      sku: productVariants.sku,
      color: productVariants.color,
      size: productVariants.size,
    })
    .from(productVariants)
    .where(
      and(
        eq(productVariants.active, true),
        sql`${productVariants.stock} - ${productVariants.reservedStock} > 0`,
      ),
    );
  // oxlint-disable-next-line react/react-compiler -- Server-only request-time eligibility, rechecked by the mutation API.
  const requestTime = Date.now();
  const canExchange =
    isExchangeWindowOpen(order.deliveredAt, requestTime) &&
    ['delivered', 'completed'].includes(order.status);
  return (
    <main className="min-h-screen bg-[#f6f6f2]">
      <AnnouncementBar />
      <SiteHeader />
      <section className="mx-auto max-w-[1100px] px-4 py-12 sm:px-8 lg:px-0 lg:py-20">
        <Link
          href="/tai-khoan"
          className="inline-flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Tài khoản
        </Link>
        <div className="mt-8 rounded-[24px] bg-black p-6 text-white sm:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#dfff00]">
                Đơn hàng
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                {order.orderCode}
              </h1>
              <p className="mt-3 text-sm text-white/55">
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="h-fit rounded-full bg-white/10 px-5 py-3 text-sm font-bold">
              {statusLabel[order.status] ?? order.status}
            </div>
          </div>
          <div className="mt-10 grid gap-4 border-t border-white/15 pt-7 sm:grid-cols-3">
            <div>
              <p className="text-xs text-white/45">Thanh toán</p>
              <p className="mt-1 font-bold">
                {order.paymentMethod === 'cod' ? 'COD' : 'MoMo UAT'} ·{' '}
                {order.paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/45">Người nhận</p>
              <p className="mt-1 font-bold">
                {order.recipientName} · {order.recipientPhone}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/45">Địa chỉ</p>
              <p className="mt-1 text-sm leading-6">
                {order.addressLine}, {order.ward}, {order.district},{' '}
                {order.province}
              </p>
            </div>
          </div>
        </div>
        <section className="mt-6 rounded-[22px] border border-black/10 bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <Package className="h-5 w-5" />
            Sản phẩm
          </h2>
          <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 py-4 sm:grid-cols-[1fr_160px_120px] sm:items-center"
              >
                <div>
                  <p className="font-bold">{item.productName}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {item.sku} · {item.color} / {item.size}
                  </p>
                </div>
                <p className="text-sm">
                  {item.quantity} × {formatMoney(item.unitPrice)}
                </p>
                <p className="font-black sm:text-right">
                  {formatMoney(item.lineTotal)}
                </p>
              </div>
            ))}
          </div>
          <dl className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Tiền hàng</dt>
              <dd>{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Giảm giá</dt>
              <dd>-{formatMoney(order.discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Vận chuyển</dt>
              <dd>
                {order.shippingFee
                  ? formatMoney(order.shippingFee)
                  : 'Miễn phí'}
              </dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-lg font-black">
              <dt>Tổng</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
          <OrderActions
            orderCode={order.orderCode}
            canCancel={
              order.paymentMethod === 'cod' && order.status === 'pending'
            }
            canReceive={order.status === 'shipping'}
            canExchange={canExchange}
            items={items.map((item) => ({
              id: item.id,
              label: `${item.productName} · ${item.color}/${item.size}`,
              sku: item.sku,
              quantity: item.quantity,
            }))}
            variants={variants.map((variant) => ({
              sku: variant.sku,
              label: `${variant.sku} · ${variant.color}/${variant.size}`,
            }))}
          />
        </section>
        {exchanges.length > 0 && (
          <section className="mt-6 rounded-[22px] border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black">Yêu cầu đổi hàng</h2>
            <div className="mt-5 divide-y divide-black/10">
              {exchanges.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col justify-between gap-2 py-4 sm:flex-row"
                >
                  <div>
                    <p className="font-black">{request.requestCode}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {request.description}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold">
                      {
                        {
                          submitted: 'Chờ tiếp nhận',
                          reviewing: 'Đang xem xét',
                          needs_info: 'Cần bổ sung thông tin',
                          approved: 'Đã duyệt',
                          rejected: 'Từ chối',
                          return_shipping: 'Đang chờ gửi hàng cũ',
                          received: 'MOVA đã kiểm tra hàng cũ',
                          shipping: 'Đang giao hàng đổi',
                          completed: 'Hoàn thành',
                        }[request.status]
                      }
                    </p>
                    <p className="mt-1">
                      {request.responsibility === 'seller'
                        ? 'MOVA chịu phí'
                        : request.responsibility === 'customer'
                          ? 'Khách chịu phí'
                          : 'Đang xác định bên chịu phí'}
                    </p>
                    {request.feeAmount > 0 && (
                      <p className="mt-1">
                        Phí đổi: {formatMoney(request.feeAmount)} · {request.feeStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                      </p>
                    )}
                    {request.adminNote && (
                      <p className="mt-2">{request.adminNote}</p>
                    )}
                    {request.status === 'needs_info' && (
                      <ExchangeAdditionalInfo orderCode={order.orderCode} requestId={request.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
