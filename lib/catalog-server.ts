import { asc, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/db';
import { categories as categoryTable, productImages, productVariants, products as productTable } from '@/db/schema';
import { products as fallbackProducts, type Product } from './catalog';

function imageUrl(objectKey: string | undefined) {
  if (!objectKey) return '/products/atg01-1.avif';
  return objectKey.startsWith('/') ? objectKey : `/api/files?key=${encodeURIComponent(objectKey)}`;
}

export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const db = getDb();
    const rows = await db.select({
      id: productTable.id, code: productTable.code, slug: productTable.slug, name: productTable.name,
      description: productTable.description, material: productTable.material, price: productTable.price, compareAtPrice: productTable.compareAtPrice, gender: productTable.gender,
      featured: productTable.featured, category: categoryTable.name, categorySlug: categoryTable.slug,
    }).from(productTable).innerJoin(categoryTable, eq(productTable.categoryId, categoryTable.id))
      .where(eq(productTable.status, 'active')).orderBy(asc(productTable.createdAt));
    if (rows.length === 0) return fallbackProducts;
    const ids = rows.map((row) => row.id);
    const variants = await db.select().from(productVariants).where(inArray(productVariants.productId, ids));
    const images = await db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder));
    return rows.map((row) => {
      const gallery = images.filter((image) => image.productId === row.id).map((image) => imageUrl(image.objectKey));
      return {
        id: row.id, code: row.code, slug: row.slug, name: row.name, category: row.category, categorySlug: row.categorySlug,
        price: row.price, compareAtPrice: row.compareAtPrice, gender: row.gender, image: gallery[0] ?? '/products/atg01-1.avif', gallery, badge: row.featured ? 'Nổi bật' : null,
        description: row.description, material: row.material,
        variants: variants.filter((variant) => variant.productId === row.id && variant.active).map((variant) => ({
          id: variant.id, sku: variant.sku, size: variant.size, color: variant.color, stock: Math.max(0, variant.stock - variant.reservedStock),
        })),
      };
    });
  } catch {
    return fallbackProducts;
  }
}

export async function findCatalogProduct(slug: string) {
  return (await getCatalogProducts()).find((product) => product.slug === slug);
}
