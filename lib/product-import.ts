import assets from './product-assets.json' with { type: 'json' };
import type { SqlCommand } from './commerce-commands';

export { assets as productAssetCatalog };

const productDetails: Record<
  string,
  { material: string; description: (audience: string, color: string) => string }
> = {
  'ao-polo': {
    material: 'Vải pique polyester co giãn',
    description: (audience, color) =>
      `Áo polo ${audience} màu ${color.toLowerCase()} với cổ bẻ gọn gàng, phù hợp cho buổi tập nhẹ và phong cách năng động hằng ngày.`,
  },
  'ao-so-mi': {
    material: 'Polyester pha spandex',
    description: (audience, color) =>
      `Áo sơ mi ${audience} màu ${color.toLowerCase()} có phom hiện đại, dễ vận động và phù hợp khi cần vẻ ngoài chỉn chu nhưng thoải mái.`,
  },
  'ao-thun-the-thao': {
    material: 'Polyester thể thao thoát ẩm',
    description: (audience, color) =>
      `Áo thun ${audience} màu ${color.toLowerCase()} với phom linh hoạt, bề mặt nhẹ và thoáng cho luyện tập hoặc sinh hoạt hằng ngày.`,
  },
  'quan-short': {
    material: 'Nylon pha spandex',
    description: (audience, color) =>
      `Quần short ${audience} màu ${color.toLowerCase()} có phom gọn, cạp co giãn và khoảng vận động thoải mái cho chạy bộ, gym và tập luyện.`,
  },
  'ao-dai-tay': {
    material: 'Polyester co giãn',
    description: (audience, color) =>
      `Áo thể thao dài tay ${audience} màu ${color.toLowerCase()} ôm vừa vặn, hỗ trợ vận động linh hoạt và dễ phối trong thời tiết mát.`,
  },
  'quan-legging': {
    material: 'Nylon pha spandex co giãn bốn chiều',
    description: (audience, color) =>
      `Quần legging ${audience} màu ${color.toLowerCase()} với cạp cao ôm chắc, hỗ trợ chuyển động tự tin trong yoga, gym và chạy bộ.`,
  },
  'vay-the-thao': {
    material: 'Polyester pha spandex',
    description: (audience, color) =>
      `Váy thể thao ${audience} màu ${color.toLowerCase()} có phom xòe nhẹ, tạo cảm giác thoải mái khi chơi tennis, cầu lông hoặc dạo phố.`,
  },
  tui: {
    material: 'Polyester bền nhẹ',
    description: (_audience, color) =>
      `Túi thể thao màu ${color.toLowerCase()} có ngăn chứa rộng và quai xách linh hoạt, tiện mang theo đồ tập hoặc dùng cho chuyến đi ngắn.`,
  },
  'gang-tay-dai': {
    material: 'Nylon co giãn, thoáng khí',
    description: (_audience, color) =>
      `Ống tay thể thao màu ${color.toLowerCase()} ôm vừa cánh tay, phù hợp khi chạy bộ, đạp xe và vận động ngoài trời.`,
  },
  'khau-trang': {
    material: 'Polyester mềm, thoáng khí',
    description: (_audience, color) =>
      `Khẩu trang thể thao màu ${color.toLowerCase()} có thiết kế ôm gọn khuôn mặt, nhẹ và thuận tiện cho các hoạt động hằng ngày.`,
  },
  tat: {
    material: 'Cotton pha spandex',
    description: (_audience, color) =>
      `Tất thể thao màu ${color.toLowerCase()} có cổ ôm vừa, đệm chân êm và phù hợp cho tập luyện lẫn sử dụng hằng ngày.`,
  },
};

function detailsFor(item: (typeof assets)[number]) {
  const audience =
    item.gender === 'male' ? 'nam' : item.gender === 'female' ? 'nữ' : 'unisex';
  const details = productDetails[item.category.slug];
  return {
    material: details?.material ?? 'Chất liệu thể thao co giãn',
    description:
      details?.description(audience, item.color) ??
      `${item.name} màu ${item.color.toLowerCase()}, được thiết kế cho nhịp sống năng động và vận động hằng ngày.`,
  };
}

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
  const details = detailsFor(item);
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
        details.description,
        details.material,
        item.price,
        item.gender,
        active ? 'active' : 'draft',
        0,
        now,
        now,
        item.category.slug,
      ],
    },
    {
      sql: 'UPDATE products SET description=?,material=?,updated_at=? WHERE code=?',
      params: [details.description, details.material, now, code],
    },
  ];
  if (active) {
    commands.push(
      {
        sql: 'UPDATE categories SET is_visible=1,updated_at=? WHERE slug=?',
        params: [now, item.category.slug],
      },
      {
        sql: "UPDATE products SET status='active',updated_at=? WHERE code=?",
        params: [now, code],
      },
    );
  }
  item.sizes.forEach((size) =>
    commands.push({
      sql: `INSERT INTO product_variants (id,product_id,sku,color,size,stock,reserved_stock,active,created_at,updated_at)
      SELECT ?,id,?,?,?,10,0,1,?,? FROM products WHERE id=? ON CONFLICT(sku) DO NOTHING`,
      params: [
        `asset-var-${code.toLowerCase()}-${size}`,
        `${code}-DEMO-${size}`,
        item.color,
        size,
        now,
        now,
        id,
      ],
    }),
  );
  commands.push({
    sql: 'UPDATE product_variants SET color=?,updated_at=? WHERE product_id=(SELECT id FROM products WHERE code=?)',
    params: [item.color, now, code],
  });
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
