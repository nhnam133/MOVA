import { and, eq } from 'drizzle-orm';
import Image from 'next/image';
import Link from '@/components/store/link';
import {
  ArrowLeft,
  Clock3,
  Ruler,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { getMovaUser } from '@/lib/auth';
import { ProductBuyBox } from '@/components/store/product-buy-box';
import { ReviewForm } from '@/components/store/review-form';
import { AnnouncementBar, SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';
import { getDb } from '@/db';
import { reviews, users } from '@/db/schema';
import { products } from '@/lib/catalog';
import { findCatalogProduct } from '@/lib/catalog-server';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = await findCatalogProduct((await params).slug);
  if (!product) notFound();
  const user = await getMovaUser();
  const reviewRows = product.id
    ? await getDb()
        .select({
          id: reviews.id,
          rating: reviews.rating,
          content: reviews.content,
          adminReply: reviews.adminReply,
          createdAt: reviews.createdAt,
          name: users.fullName,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .where(
          and(eq(reviews.productId, product.id), eq(reviews.visible, true)),
        )
    : [];
  const average = reviewRows.length
    ? reviewRows.reduce((sum, review) => sum + review.rating, 0) /
      reviewRows.length
    : 0;
  return (
    <main className="min-h-screen bg-[#f6f6f2]">
      <AnnouncementBar />
      <SiteHeader />
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-8 lg:px-12">
        <Link
          href="/san-pham"
          className="inline-flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại sản phẩm
        </Link>
      </div>
      <section className="mx-auto grid max-w-[1480px] gap-10 px-4 pb-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-12 lg:pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {(product.gallery.length ? product.gallery : [product.image]).map(
            (image, index) => (
              <div
                key={image}
                className={`relative overflow-hidden rounded-[20px] bg-white ${index === 0 ? 'aspect-[3/4] sm:col-span-2' : 'aspect-square'}`}
              >
                <Image
                  src={image}
                  alt={`${product.name} - ảnh ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            ),
          )}
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductBuyBox product={product} />
          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              [Truck, 'Ship 30.000đ', 'Miễn phí từ 499K'],
              [Clock3, 'Đổi 72 giờ', 'Từ lúc nhận thực tế'],
              [ShieldCheck, 'Thanh toán', 'COD; MoMo UAT đang hoàn thiện'],
            ].map(([Icon, title, copy]) => {
              const FeatureIcon = Icon as typeof Truck;
              return (
                <div
                  key={title as string}
                  className="rounded-xl border border-black/10 bg-white p-4"
                >
                  <FeatureIcon className="h-4 w-4" />
                  <p className="mt-4 text-sm font-black">{title as string}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {copy as string}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold">
            <Link
              href="/huong-dan-chon-size"
              className="inline-flex items-center gap-2 underline"
            >
              <Ruler className="h-4 w-4" />
              Bảng size mẫu
            </Link>
            <Link href="/chinh-sach/doi-hang" className="underline">
              Chính sách đổi hàng
            </Link>
            <Link href="/chinh-sach/van-chuyen" className="underline">
              Vận chuyển
            </Link>
          </div>
        </div>
      </section>
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1384px] gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-0 lg:py-24">
          <div>
            <p className="section-kicker">Đánh giá sản phẩm</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em]">
              Khách hàng nói gì
            </h2>
            <div className="mt-5 flex items-center gap-3">
              <span className="text-4xl font-black">
                {reviewRows.length ? average.toFixed(1) : '—'}
              </span>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${value <= Math.round(average) ? 'fill-[#dfff00] text-black' : 'text-neutral-200'}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {reviewRows.length} đánh giá đã hiển thị
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {reviewRows.length === 0 ? (
              <p className="rounded-2xl border border-black/10 p-6 text-sm text-neutral-500">
                Sản phẩm chưa có đánh giá. HAUVIE không tạo số liệu hoặc bình luận
                giả.
              </p>
            ) : (
              reviewRows.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-black/10 p-5"
                >
                  <div className="flex justify-between gap-4">
                    <p className="font-bold">
                      {review.name || 'Khách hàng HAUVIE'}
                    </p>
                    <span className="text-xs text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="mt-2 flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-3.5 w-3.5 ${value <= review.rating ? 'fill-[#dfff00] text-black' : 'text-neutral-200'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {review.content}
                  </p>
                  {review.adminReply && (
                    <div className="mt-4 border-l-4 border-[#dfff00] bg-neutral-50 p-4 text-sm leading-6">
                      <p className="font-black">HAUVIE phản hồi</p>
                      <p className="mt-1 text-neutral-600">{review.adminReply}</p>
                    </div>
                  )}
                </article>
              ))
            )}
            <ReviewForm productSlug={product.slug} signedIn={Boolean(user)} />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
