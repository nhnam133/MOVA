import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/db';
import {
  exchangeRequests,
  exchangeItems,
  exchangeEvidence,
  orderItems,
  orders,
  productVariants,
  products,
} from '@/db/schema';
import { ExchangeActions } from '@/components/admin/exchange-actions';
import Link from '@/components/store/link';

const labels: Record<string, string> = {
  submitted: 'Chờ tiếp nhận',
  reviewing: 'Đang xem xét',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  shipping: 'Đang giao hàng đổi',
  completed: 'Hoàn thành',
};
export default async function AdminExchangesPage() {
  await requireAdmin();
  const db = getDb();
  const requests = await db
    .select({
      id: exchangeRequests.id,
      code: exchangeRequests.requestCode,
      status: exchangeRequests.status,
      reason: exchangeRequests.reason,
      description: exchangeRequests.description,
      note: exchangeRequests.adminNote,
      orderCode: orders.orderCode,
      recipient: orders.recipientName,
      phone: orders.recipientPhone,
    })
    .from(exchangeRequests)
    .innerJoin(orders, eq(orders.id, exchangeRequests.orderId))
    .orderBy(desc(exchangeRequests.requestedAt));
  const items = await db
    .select({
      requestId: exchangeItems.exchangeRequestId,
      sku: exchangeItems.replacementSku,
      quantity: exchangeItems.quantity,
      name: orderItems.productName,
      size: orderItems.size,
      color: orderItems.color,
    })
    .from(exchangeItems)
    .innerJoin(orderItems, eq(orderItems.id, exchangeItems.orderItemId));
  const evidence = await db.select().from(exchangeEvidence);
  const variants = await db
    .select({
      sku: productVariants.sku,
      stock: productVariants.stock,
      reserved: productVariants.reservedStock,
      name: products.name,
      size: productVariants.size,
      color: productVariants.color,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(productVariants.active, true));
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap gap-5 text-sm font-bold">
          <Link href="/tai-khoan">Tài khoản</Link>
          <Link href="/quan-tri/san-pham">Sản phẩm</Link>
          <Link href="/quan-tri/don-hang">Đơn hàng</Link>
          <Link href="/quan-tri/ho-tro">Liên hệ & đánh giá</Link>
        </nav>
        <h1 className="my-8 text-3xl font-black">Quản lý đổi hàng</h1>
        {requests.length === 0 && (
          <p className="rounded-xl bg-white p-8">Chưa có yêu cầu đổi hàng.</p>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          {requests.map((entry) => (
            <section key={entry.id} className="rounded-2xl border bg-white p-6">
              <p className="text-sm font-bold text-neutral-500">
                {entry.orderCode} · {labels[entry.status]}
              </p>
              <h2 className="mt-2 text-xl font-black">{entry.code}</h2>
              <p className="mt-3 text-sm">
                {entry.recipient} · {entry.phone}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm">
                {entry.description}
              </p>
              {items
                .filter((i) => i.requestId === entry.id)
                .map((i) => (
                  <p key={i.name} className="mt-3 text-sm font-semibold">
                    {i.name} · {i.color}/{i.size} · SL {i.quantity}
                  </p>
                ))}
              <div className="mt-3 flex flex-wrap gap-3">
                {evidence
                  .filter((e) => e.exchangeRequestId === entry.id)
                  .map((e, i) => (
                    <Link
                      key={e.id}
                      href={'/api/files?key=' + encodeURIComponent(e.objectKey)}
                      target="_blank"
                      rel="noopener"
                      className="text-sm underline"
                    >
                      Ảnh minh chứng {i + 1} ↗
                    </Link>
                  ))}
              </div>
              {entry.note && (
                <p className="mt-3 rounded-lg bg-neutral-100 p-3 text-sm">
                  Kết luận: {entry.note}
                </p>
              )}
              <ExchangeActions
                id={entry.id}
                status={entry.status}
                replacementSku={
                  items.find((i) => i.requestId === entry.id)?.sku ?? null
                }
                variants={variants
                  .filter((v) => v.stock - v.reserved > 0)
                  .map((v) => ({
                    sku: v.sku,
                    label:
                      v.name +
                      ' · ' +
                      v.color +
                      '/' +
                      v.size +
                      ' · Còn ' +
                      (v.stock - v.reserved),
                  }))}
              />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
