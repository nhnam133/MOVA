import assets from './product-assets.json' with { type: 'json' };
import type { SqlCommand } from './commerce-commands';

export { assets as productAssetCatalog };

/** Data import, intentionally separate from schema migrations. Each product is
 * an atomic, repeatable operation. Existing prices, variants and stock survive.
 */
export function productImportCommands(
  code: string,
  includeNewCategories: boolean,
  now: number,
): SqlCommand[] {
  const item = assets.find((entry) => entry.code === code);
  if (!item) throw new Error('UNKNOWN_PRODUCT_CODE');
  const id = `asset-prod-${code.toLowerCase()}`;
  const active = item.existingCategory || includeNewCategories;
  const commands: SqlCommand[] = [
    {
      sql: 'INSERT INTO categories (id,name,slug,is_visible,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(slug) DO NOTHING',
      params: [
        item.category.id,
        item.category.name,
        item.category.slug,
        active ? 1 : 0,
        10 +
          assets.findIndex(
            (entry) => entry.category.slug === item.category.slug,
          ),
        now,
        now,
      ],
    },
    {
      sql: `INSERT INTO products (id,category_id,code,slug,name,description,material,price,gender,status,featured,created_at,updated_at)
      SELECT ?,id,?,?,?,?,?,?,?,?,?,?,? FROM categories WHERE slug=? ON CONFLICT(code) DO NOTHING`,
      params: [
        id,
        code,
        `${item.category.slug}-${code.toLowerCase()}`,
        item.name,
        'Sản phẩm minh họa cho đồ án MOVA. Giá, màu, kích cỡ và tồn kho là dữ liệu demo, có thể cập nhật trong trang quản trị.',
        'Chưa cập nhật',
        item.price,
        item.gender,
        active ? 'active' : 'draft',
        0,
        now,
        now,
        item.category.slug,
      ],
    },
  ];
  item.sizes.forEach((size) =>
    commands.push({
      sql: `INSERT INTO product_variants (id,product_id,sku,color,size,stock,reserved_stock,active,created_at,updated_at)
      SELECT ?,id,?,?,?,10,0,1,?,? FROM products WHERE id=? ON CONFLICT(sku) DO NOTHING`,
      params: [
        `asset-var-${code.toLowerCase()}-${size}`,
        `${code}-DEMO-${size}`,
        'Màu theo ảnh (demo)',
        size,
        now,
        now,
        id,
      ],
    }),
  );
  item.images.forEach((image, index) => {
    if (index === 0)
      commands.push({
        sql: `UPDATE product_images SET object_key=?, alt_text=? WHERE product_id=(SELECT id FROM products WHERE code=?) AND object_key=?`,
        params: [
          image.url,
          `${item.name} — ảnh 1`,
          code,
          `/products/${code.toLowerCase()}-1.avif`,
        ],
      });
    commands.push({
      sql: `INSERT INTO product_images (id,product_id,object_key,alt_text,sort_order,created_at)
        SELECT ?,p.id,?,?,?,? FROM products p WHERE p.code=? AND NOT EXISTS
        (SELECT 1 FROM product_images i WHERE i.product_id=p.id AND i.object_key=?) ON CONFLICT(id) DO NOTHING`,
      params: [
        `asset-img-${code.toLowerCase()}-${index + 1}`,
        image.url,
        `${item.name} — ảnh ${index + 1}`,
        index,
        now,
        code,
        image.url,
      ],
    });
  });
  return commands;
}
