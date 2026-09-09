import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  ContactStatus,
  ReviewModeration,
} from '@/components/admin/support-actions';
import { getDb } from '@/db';
import { contactMessages, reviews, users } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

export default async function AdminSupportPage() {
  await requireAdmin();
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
      customer: users.email,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt));
  return (
    <main className="min-h-screen bg-[#ededE7]">
      <header className="bg-black px-4 py-5 text-white">
        <div className="mx-auto flex max-w-[1384px] justify-between">
          <Link href="/" className="text-2xl font-black italic">
            MOVA<span className="text-[#dfff00]">.</span>
          </Link>
          <span className="text-xs font-bold">Quản trị hỗ trợ</span>
        </div>
      </header>
      <section className="mx-auto max-w-[1384px] px-4 py-12 sm:px-8 lg:px-0">
        <Link
          href="/quan-tri/don-hang"
          className="inline-flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Đơn hàng
        </Link>
        <h1 className="mt-6 text-5xl font-black uppercase tracking-[-0.06em] sm:text-7xl">
          Hỗ trợ
        </h1>
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
                      <ContactStatus id={entry.id} status={entry.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6">{entry.message}</p>
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
                      <ReviewModeration id={entry.id} visible={entry.visible} />
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
