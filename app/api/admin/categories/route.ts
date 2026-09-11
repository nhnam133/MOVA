import { and, eq, ne, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { categories, products } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('đ', 'd').replaceAll('Đ', 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = (await request.json()) as { name?: string; visible?: boolean };
  const name = body.name?.trim() || '';
  const slug = slugify(name);
  if (name.length < 2 || name.length > 80 || !slug) return Response.json({ error: 'Tên danh mục phải có từ 2 đến 80 ký tự.' }, { status: 400 });
  const db = getDb();
  const [{ maxOrder }] = await db.select({ maxOrder: sql<number>`coalesce(max(${categories.sortOrder}), 0)` }).from(categories);
  try {
    await db.insert(categories).values({ id: crypto.randomUUID(), name, slug, isVisible: body.visible !== false, sortOrder: maxOrder + 10, createdAt: Date.now(), updatedAt: Date.now() });
  } catch {
    return Response.json({ error: 'Tên đường dẫn danh mục đã tồn tại.' }, { status: 409 });
  }
  return Response.json({ status: 'created' }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = (await request.json()) as { id?: string; name?: string; visible?: boolean; sortOrder?: number };
  const name = body.name?.trim() || '';
  const slug = slugify(name);
  if (!body.id || name.length < 2 || name.length > 80 || !slug || !Number.isSafeInteger(body.sortOrder) || body.sortOrder! < 0 || body.sortOrder! > 10000 || typeof body.visible !== 'boolean') return Response.json({ error: 'Thông tin danh mục chưa hợp lệ.' }, { status: 400 });
  const db = getDb();
  const [conflict] = await db.select({ id: categories.id }).from(categories).where(and(eq(categories.slug, slug), ne(categories.id, body.id))).limit(1);
  if (conflict) return Response.json({ error: 'Tên đường dẫn danh mục đã tồn tại.' }, { status: 409 });
  await db.update(categories).set({ name, slug, isVisible: body.visible, sortOrder: body.sortOrder!, updatedAt: Date.now() }).where(eq(categories.id, body.id));
  return Response.json({ status: 'updated' });
}

export async function DELETE(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = (await request.json()) as { id?: string };
  if (!body.id) return Response.json({ error: 'Thiếu mã danh mục.' }, { status: 400 });
  const db = getDb();
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.categoryId, body.id));
  if (count > 0) return Response.json({ error: 'Danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.' }, { status: 409 });
  await db.delete(categories).where(eq(categories.id, body.id));
  return Response.json({ status: 'deleted' });
}
