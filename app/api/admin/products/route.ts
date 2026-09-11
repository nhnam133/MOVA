import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getAdminUser } from '@/lib/admin-auth';
import { getDb } from '@/db';
import {
  categories,
  productImages,
  products,
  productVariants,
  stockMovements,
} from '@/db/schema';

function makeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin)
    return Response.json(
      { error: 'Bạn không có quyền quản trị.' },
      { status: 403 },
    );
  const data = await request.formData();
  const field = (key: string) => {
    const value = data.get(key);
    return typeof value === 'string' ? value : '';
  };
  const code = field('code').trim().toUpperCase();
  const name = field('name').trim();
  const categoryId = field('categoryId').trim();
  const price = Number(data.get('price'));
  const compareAtPrice = field('compareAtPrice')
    ? Number(data.get('compareAtPrice'))
    : null;
  const gender = field('gender') as 'female' | 'male' | 'unisex';
  const color = field('color').trim();
  const material = field('material').trim();
  const description = field('description').trim();
  const stock = Number(data.get('stock'));
  const status = field('status') as 'active' | 'draft' | 'hidden';
  const sizes = field('sizes')
    .split(',')
    .map((size) => size.trim().toUpperCase())
    .filter((size) => /^[\p{L}0-9 .+/-]{1,20}$/u.test(size))
    .slice(0, 20);
  const file = data.get('image');
  if (
    !/^[A-Z0-9-]{3,20}$/.test(code) ||
    name.length < 3 ||
    !categoryId ||
    !['female', 'male', 'unisex'].includes(gender) ||
    !Number.isInteger(price) ||
    price < 1_000 ||
    (compareAtPrice !== null &&
      (!Number.isInteger(compareAtPrice) || compareAtPrice <= price)) ||
    !color ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !['active', 'draft', 'hidden'].includes(status) ||
    sizes.length === 0 ||
    !(file instanceof File) ||
    file.size === 0
  ) {
    return Response.json(
      { error: 'Thông tin sản phẩm chưa hợp lệ.' },
      { status: 400 },
    );
  }
  if (
    !['image/avif', 'image/jpeg', 'image/png', 'image/webp'].includes(
      file.type,
    ) ||
    file.size > 5 * 1024 * 1024
  )
    return Response.json(
      { error: 'Ảnh phải là AVIF/JPG/PNG/WebP và không quá 5MB.' },
      { status: 400 },
    );
  const db = getDb();
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  if (!category)
    return Response.json({ error: 'Danh mục không tồn tại.' }, { status: 400 });
  const productId = crypto.randomUUID();
  const now = Date.now();
  const slug = `${makeSlug(name)}-${code.toLowerCase()}`;
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const objectKey = `products/${productId}-${safeFileName}`;
  const variantRows = [...new Set(sizes)].map((size) => ({
    id: crypto.randomUUID(),
    productId,
    sku: `${code}-${makeSlug(color).toUpperCase()}-${makeSlug(size).toUpperCase()}`,
    color,
    size,
    stock,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));
  await env.FILES.put(objectKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  try {
    await db.batch([
      db
        .insert(products)
        .values({
          id: productId,
          categoryId,
          code,
          slug,
          name,
          description,
          material,
          price,
          compareAtPrice,
          gender,
          status,
          featured: data.get('featured') === 'on',
          createdAt: now,
          updatedAt: now,
        }),
      db
        .insert(productImages)
        .values({
          id: crypto.randomUUID(),
          productId,
          objectKey,
          altText: name,
          sortOrder: 0,
          createdAt: now,
        }),
      ...variantRows.flatMap((variant) => [
        db.insert(productVariants).values(variant),
        db.insert(stockMovements).values({
          id: crypto.randomUUID(),
          variantId: variant.id,
          actorUserId: admin.userId,
          type: 'initial',
          quantityDelta: stock,
          stockBefore: 0,
          stockAfter: stock,
          reason: 'Tồn kho khi tạo sản phẩm',
          referenceType: 'product',
          referenceId: productId,
          createdAt: now,
        }),
      ]),
    ]);
  } catch {
    await env.FILES.delete(objectKey);
    return Response.json(
      { error: 'Mã hoặc tên đường dẫn sản phẩm đã tồn tại.' },
      { status: 409 },
    );
  }
  return Response.json(
    { status: 'created', product: { id: productId, code, slug, name } },
    { status: 201 },
  );
}
