import { asc, desc } from 'drizzle-orm';
import Link from '@/components/store/link';
import { ArrowLeft, Box, PackagePlus } from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form';
import { getDb } from '@/db';
import { categories, products } from '@/db/schema';
import { formatMoney } from '@/lib/catalog';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminProductsPage() {
  const admin = await requireAdmin();
  const db = getDb();
  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  const productRows = await db
    .select({
      id: products.id,
      code: products.code,
      name: products.name,
      price: products.price,
      status: products.status,
    })
    .from(products)
    .orderBy(desc(products.createdAt));
  return (
    <main className="min-h-screen bg-[#ededE7]">
      <header className="border-b border-white/15 bg-black text-white">
        <div className="mx-auto flex h-18 max-w-[1384px] items-center justify-between px-4 sm:px-8 lg:px-0">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em]">
            MOVA<span className="text-[#eaff2f]">.</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/quan-tri/don-hang"
              className="text-xs font-bold text-[#dfff00]"
            >
              Đơn hàng
            </Link>
            <div className="text-right">
              <p className="text-xs font-bold">Quản trị sản phẩm</p>
              <p className="mt-1 text-[10px] text-white/45">{admin.email}</p>
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-[1384px] px-4 py-10 sm:px-8 lg:px-0 lg:py-16">
        <Link
          href="/tai-khoan"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Tài khoản
        </Link>
        <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              MOVA Admin
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.06em] sm:text-7xl">
              Sản phẩm
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            <Box className="h-5 w-5" />
            {productRows.length} sản phẩm
          </span>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="h-fit border border-black bg-[#eaff2f] p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <PackagePlus className="h-6 w-6" />
              <h2 className="text-2xl font-black uppercase">Thêm sản phẩm</h2>
            </div>
            <ProductForm categories={categoryRows} />
          </section>
          <section className="border border-black bg-white">
            <div className="grid grid-cols-[90px_1fr_auto] border-b border-black bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white sm:grid-cols-[110px_1fr_130px_90px]">
              <span>Mã</span>
              <span>Tên</span>
              <span className="hidden sm:block">Giá</span>
              <span>Trạng thái</span>
            </div>
            <div className="divide-y divide-black/15">
              {productRows.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[90px_1fr_auto] items-center gap-3 px-5 py-4 text-sm sm:grid-cols-[110px_1fr_130px_90px]"
                >
                  <span className="font-mono text-xs font-bold">
                    {product.code}
                  </span>
                  <Link
                    href={`/quan-tri/san-pham/${product.id}`}
                    className="font-bold underline underline-offset-4"
                  >
                    {product.name}
                    <span className="mt-1 block text-xs font-normal">
                      Chỉnh sửa sản phẩm
                    </span>
                  </Link>
                  <span className="hidden sm:block">
                    {formatMoney(product.price)}
                  </span>
                  <span className="text-xs capitalize text-neutral-500">
                    {product.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
