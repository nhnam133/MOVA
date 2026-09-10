import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { products, productVariants, productImages } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { atomicBatch, guard, type SqlCommand } from '@/lib/atomic-db';

type VariantInput = {
  id?: string;
  color: string;
  size: string;
  stock: number;
  active: boolean;
  updatedAt?: number;
};
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin)
    return Response.json(
      { error: 'Bạn không có quyền quản trị.' },
      { status: 403 },
    );
  const { id } = await params,
    db = getDb(),
    data = await request.formData();
  const field = (key: string) => {
    const value = data.get(key);
    return typeof value === 'string' ? value.trim() : '';
  };
  const name = field('name'),
    categoryId = field('categoryId'),
    gender = field('gender'),
    status = field('status'),
    price = Number(field('price')),
    compare = field('compareAtPrice') ? Number(field('compareAtPrice')) : null;
  const updatedAt = Number(field('updatedAt')),
    description = field('description'),
    material = field('material');
  let variants: VariantInput[];
  try {
    variants = JSON.parse(field('variants'));
  } catch {
    return Response.json({ error: 'Biến thể không hợp lệ.' }, { status: 400 });
  }
  if (
    name.length < 3 ||
    name.length > 150 ||
    !categoryId ||
    !['female', 'male', 'unisex'].includes(gender) ||
    !['active', 'hidden', 'draft'].includes(status) ||
    !Number.isSafeInteger(price) ||
    price < 1000 ||
    price > 100000000 ||
    (compare !== null &&
      (!Number.isSafeInteger(compare) || compare <= price)) ||
    description.length > 5000 ||
    material.length > 500 ||
    !Number.isSafeInteger(updatedAt) ||
    !Array.isArray(variants) ||
    !variants.length ||
    variants.length > 50
  )
    return Response.json(
      { error: 'Thông tin sản phẩm không hợp lệ.' },
      { status: 400 },
    );
  const seen = new Set<string>();
  for (const v of variants) {
    if (
      !v ||
      typeof v.color !== 'string' ||
      !v.color.trim() ||
      v.color.length > 50 ||
      !['S', 'M', 'L', 'XL', 'XXL'].includes(v.size) ||
      !Number.isInteger(v.stock) ||
      v.stock < 0 ||
      v.stock > 1000000 ||
      typeof v.active !== 'boolean'
    )
      return Response.json(
        { error: 'Kiểm tra màu, size và số lượng nguyên không âm.' },
        { status: 400 },
      );
    const option = v.color.trim().toLowerCase() + ':' + v.size;
    if (seen.has(option))
      return Response.json(
        { error: 'Có màu và size bị trùng.' },
        { status: 400 },
      );
    seen.add(option);
  }
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!product)
    return Response.json(
      { error: 'Không tìm thấy sản phẩm.' },
      { status: 404 },
    );
  const previous = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id));
  if (previous.some((v) => !variants.some((row) => row.id === v.id)))
    return Response.json(
      { error: 'Không được xóa biến thể có lịch sử. Hãy tắt Đang bán.' },
      { status: 400 },
    );
  const files = data
    .getAll('images')
    .filter((v): v is File => v instanceof File && v.size > 0);
  if (
    files.length > 5 ||
    files.some(
      (v) =>
        !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(
          v.type,
        ) || v.size > 5 * 1024 * 1024,
    )
  )
    return Response.json(
      { error: 'Tối đa 5 ảnh AVIF/JPG/PNG/WebP, mỗi ảnh không quá 5MB.' },
      { status: 400 },
    );
  const now = Date.now(),
    commands: SqlCommand[] = [
      guard('EXISTS (SELECT 1 FROM products WHERE id=? AND updated_at=?)', [
        id,
        updatedAt,
      ]),
      {
        sql: 'UPDATE products SET name=?,category_id=?,gender=?,status=?,price=?,compare_at_price=?,material=?,description=?,featured=?,updated_at=? WHERE id=?',
        params: [
          name,
          categoryId,
          gender,
          status,
          price,
          compare,
          material,
          description,
          data.get('featured') === 'on' ? 1 : 0,
          now,
          id,
        ],
      },
    ];
  for (const variant of variants) {
    if (variant.id) {
      const old = previous.find((v) => v.id === variant.id);
      if (!old || old.color !== variant.color || old.size !== variant.size)
        return Response.json(
          { error: 'Không sửa màu/size của SKU cũ; hãy thêm biến thể mới.' },
          { status: 400 },
        );
      if (!Number.isSafeInteger(variant.updatedAt))
        return Response.json(
          { error: 'Thiếu phiên bản tồn kho; vui lòng tải lại.' },
          { status: 409 },
        );
      commands.push(
        guard(
          'EXISTS (SELECT 1 FROM product_variants WHERE id=? AND product_id=? AND reserved_stock<=? AND updated_at=?)',
          [variant.id, id, variant.stock, variant.updatedAt!],
        ),
        {
          sql: 'UPDATE product_variants SET stock=?,active=?,updated_at=? WHERE id=?',
          params: [variant.stock, variant.active ? 1 : 0, now, variant.id],
        },
      );
    } else {
      const color = variant.color.trim(),
        variantId = crypto.randomUUID(),
        sku =
          product.code +
          '-' +
          crypto.randomUUID().slice(0, 6).toUpperCase() +
          '-' +
          variant.size;
      commands.push({
        sql: 'INSERT INTO product_variants (id,product_id,sku,color,size,stock,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
        params: [
          variantId,
          id,
          sku,
          color,
          variant.size,
          variant.stock,
          variant.active ? 1 : 0,
          now,
          now,
        ],
      });
    }
  }
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id));
  const offset = images.reduce(
      (max, image) => Math.max(max, image.sortOrder + 1),
      0,
    ),
    keys: string[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const key = 'products/' + id + '/' + crypto.randomUUID();
      await env.FILES.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });
      keys.push(key);
      commands.push({
        sql: 'INSERT INTO product_images (id,product_id,object_key,alt_text,sort_order,created_at) VALUES (?,?,?,?,?,?)',
        params: [crypto.randomUUID(), id, key, name, offset + index, now],
      });
    }
    await atomicBatch(commands);
  } catch {
    await Promise.allSettled(keys.map((key) => env.FILES.delete(key)));
    return Response.json(
      {
        error:
          'Chưa lưu: dữ liệu vừa thay đổi, màu/size bị trùng hoặc tồn kho thấp hơn lượng đang giữ. Vui lòng tải lại.',
      },
      { status: 409 },
    );
  }
  return Response.json({ status: 'updated' });
}
