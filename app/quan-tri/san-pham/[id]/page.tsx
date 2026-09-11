import { asc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/db';
import { categories, productImages, products, productVariants } from '@/db/schema';
import { ProductEditor } from '@/components/admin/product-editor';
import Link from '@/components/store/link';
import { AdminHeader } from '@/components/admin/admin-shell';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params,
    db = getDb();
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!product) notFound();
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id));
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder));
  const groups = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  return (
    <main className="min-h-screen bg-neutral-100">
      <AdminHeader email={admin.email} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <Link href="/quan-tri/san-pham" className="text-sm font-bold underline">
          ← Quản lý sản phẩm
        </Link>
        <h1 className="my-7 text-3xl font-black">Chỉnh sửa {product.code}</h1>
        <ProductEditor
          product={product}
          variants={variants}
          categories={groups}
          images={images}
        />
      </div>
    </main>
  );
}
