import { asc, desc } from 'drizzle-orm';
import Link from '@/components/store/link';
import { ArrowLeft, Box, PackagePlus } from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form';
import { getDb } from '@/db';
import { categories, products } from '@/db/schema';
import { formatMoney } from '@/lib/catalog';
import { requireAdmin } from '@/lib/admin-auth';
import { productAssetCatalog } from '@/lib/product-import';
import { ProductImportPanel } from '@/components/admin/product-import-panel';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';
import { brandText } from '@/lib/brand';

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
      <AdminHeader email={admin.email} />
      <section className="mx-auto max-w-[1384px] px-4 py-10 sm:px-8 lg:px-0 lg:py-16">
        <Link
          href="/tai-khoan"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Tài khoản
        </Link>
        <div className="mt-7"><AdminPageIntro title="Sản phẩm" description="Thêm sản phẩm, cập nhật thông tin, ảnh, biến thể và trạng thái công khai." action={<span className="inline-flex items-center gap-2 text-sm font-bold"><Box className="h-5 w-5" />{productRows.length} sản phẩm</span>} /></div>
        <ProductImportPanel
          codes={productAssetCatalog.map((product) => product.code)}
        />
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
                    {brandText(product.name)}
                    <span className="mt-1 block text-xs font-normal">
                      Chỉnh sửa sản phẩm
                    </span>
                  </Link>
                  <span className="hidden sm:block">
                    {formatMoney(product.price)}
                  </span>
                  <span className="text-xs capitalize text-neutral-500">
                    {{ active: 'Đang bán', hidden: 'Tạm ẩn', draft: 'Bản nháp' }[product.status]}
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
