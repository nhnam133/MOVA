import { desc } from 'drizzle-orm';
import Link from '@/components/store/link';
import { ArrowLeft } from 'lucide-react';
import {
  ContactStatus,
  ReviewModeration,
} from '@/components/admin/support-actions';
import { getDb } from '@/db';
import { contactMessages, reviews, users } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';

export default async function AdminSupportPage() {
  const admin = await requireAdmin();
  const db = getDb();
  const contacts = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      visible: reviews.visible,
      createdAt: reviews.createdAt,
      adminReply: reviews.adminReply,
      customer: users.email,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt));
  return (
    <main className="min-h-screen bg-[#ededE7]">
      <AdminHeader email={admin.email} />
      <section className="mx-auto max-w-[1384px] px-4 py-12 sm:px-8 lg:px-0">
        <Link
          href="/quan-tri/don-hang"
          className="inline-flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Đơn hàng
        </Link>
        <div className="mt-6"><AdminPageIntro title="Hỗ trợ" description="Tiếp nhận liên hệ, yêu cầu hỗ trợ đơn hàng và phản hồi đánh giá sản phẩm." /></div>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6">
            <h2 className="text-2xl font-black">Liên hệ</h2>
            <div className="mt-5 divide-y divide-black/10">
              {contacts.length === 0 ? (
                <p className="py-6 text-sm text-neutral-500">
                  Chưa có liên hệ.
                </p>
              ) : (
                contacts.map((entry) => (
                  <div key={entry.id} className="py-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-bold">{entry.name}</p>
                        <p className="text-xs text-neutral-500">
                          {entry.email || entry.phone}
                        </p>
                      </div>
                      <ContactStatus id={entry.id} status={entry.status} adminNote={entry.adminNote} />
                    </div>
                    <p className="mt-3 text-sm leading-6">{entry.message}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      {entry.messageType === 'cancel_request' ? 'Yêu cầu hủy đơn' : entry.messageType === 'order_support' ? 'Hỗ trợ đơn hàng' : 'Liên hệ chung'}
                      {entry.orderCode ? ` · ${entry.orderCode}` : ''}
                    </p>
                    {entry.adminNote && <p className="mt-2 rounded-lg bg-neutral-100 p-3 text-sm"><strong>Ghi chú xử lý:</strong> {entry.adminNote}</p>}
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-6">
            <h2 className="text-2xl font-black">Đánh giá</h2>
            <div className="mt-5 divide-y divide-black/10">
              {reviewRows.length === 0 ? (
                <p className="py-6 text-sm text-neutral-500">
                  Chưa có đánh giá.
                </p>
              ) : (
                reviewRows.map((entry) => (
                  <div key={entry.id} className="py-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-bold">
                          {entry.rating}/5 · {entry.customer}
                        </p>
                        <p className="mt-2 text-sm leading-6">
                          {entry.content}
                        </p>
                      </div>
                      <ReviewModeration id={entry.id} visible={entry.visible} adminReply={entry.adminReply} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
