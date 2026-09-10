import { asc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/db';
import { categories, products, productVariants } from '@/db/schema';
import { ProductEditor } from '@/components/admin/product-editor';
import Link from '@/components/store/link';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
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
  const groups = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/quan-tri/san-pham" className="text-sm font-bold underline">
          ← Quản lý sản phẩm
        </Link>
        <h1 className="my-7 text-3xl font-black">Chỉnh sửa {product.code}</h1>
        <ProductEditor
          product={product}
          variants={variants}
          categories={groups}
        />
      </div>
    </main>
  );
}
