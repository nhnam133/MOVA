import { asc, eq, sql } from 'drizzle-orm';
import { AdminHeader, AdminPageIntro } from '@/components/admin/admin-shell';
import { CategoryManager } from '@/components/admin/category-manager';
import { getDb } from '@/db';
import { categories, products } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminCategoriesPage() {
  const admin = await requireAdmin();
  const rows = await getDb().select({ id: categories.id, name: categories.name, slug: categories.slug, isVisible: categories.isVisible, sortOrder: categories.sortOrder, productCount: sql<number>`count(${products.id})` }).from(categories).leftJoin(products, eq(products.categoryId, categories.id)).groupBy(categories.id).orderBy(asc(categories.sortOrder), asc(categories.name));
  return <main className="min-h-screen bg-[#f1f1eb]"><AdminHeader email={admin.email} /><section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-8 lg:py-14"><AdminPageIntro title="Danh mục" description="Tạo nhóm sản phẩm mới, thay đổi thứ tự và quyết định nhóm nào xuất hiện trên cửa hàng." /><div className="mt-8"><CategoryManager initial={rows} /></div></section></main>;
}
