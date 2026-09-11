import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  productAssetCatalog,
  productImportCommands,
} from '../lib/product-import.ts';
import { brandText, storefrontDescription } from '../lib/brand.ts';

test('legacy MOVA copy is presented consistently as HAUVIE', () => {
  assert.equal(brandText('Áo polo MOVA PLN01'), 'Áo polo HAUVIE PLN01');
  assert.match(
    storefrontDescription(
      'Sản phẩm minh họa cho đồ án MOVA. Giá, màu, kích cỡ và tồn kho là dữ liệu demo, có thể cập nhật trong trang quản trị.',
      {
        categorySlug: 'ao-polo',
        gender: 'male',
        color: 'Xanh rêu',
        name: 'Áo polo nam MOVA PLN01',
      },
    ),
    /áo polo nam màu xanh rêu/i,
  );
});

test('all 76 copied AVIF assets match supplied files byte for byte', () => {
  assert.equal(productAssetCatalog.length, 37);
  const images = productAssetCatalog.flatMap((item) => item.images);
  assert.equal(images.length, 76);
  for (const image of images) {
    const bytes = readFileSync(
      new URL('../public' + image.url, import.meta.url),
    );
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      image.sha256,
    );
  }
});

test('catalog import is repeatable and preserves existing prices, stock, and edits', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys=ON');
  for (const file of readdirSync(new URL('../drizzle/', import.meta.url))
    .filter((file) => file.endsWith('.sql'))
    .sort())
    db.exec(
      readFileSync(new URL('../drizzle/' + file, import.meta.url), 'utf8'),
    );
  db.exec(
    "UPDATE products SET price=999000 WHERE code='ATG01'; UPDATE product_variants SET stock=2,reserved_stock=1 WHERE id='var-atg01-s'",
  );
  function run(includeNewCategories = false) {
    for (const item of productAssetCatalog) {
      db.exec('BEGIN');
      try {
        for (const command of productImportCommands(
          item.code,
          includeNewCategories,
          1800000000000,
        ))
          db.prepare(command.sql).run(...(command.params ?? []));
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    }
  }
  run();
  run();
  assert.equal(
    db.prepare('SELECT COUNT(*) AS count FROM products').get()?.count,
    37,
  );
  assert.equal(
    db.prepare('SELECT COUNT(*) AS count FROM product_images').get()?.count,
    76,
  );
  assert.equal(
    db.prepare("SELECT price FROM products WHERE code='ATG01'").get()?.price,
    999000,
  );
  assert.equal(
    db
      .prepare("SELECT stock FROM product_variants WHERE id='var-atg01-s'")
      .get()?.stock,
    2,
  );
  assert.equal(
    db
      .prepare("SELECT color FROM product_variants WHERE id='var-atg01-s'")
      .get()?.color,
    'Tím pastel',
  );
  assert.equal(
    db
      .prepare(
        "SELECT color FROM product_variants WHERE product_id=(SELECT id FROM products WHERE code='PLN01') LIMIT 1",
      )
      .get()?.color,
    'Xanh rêu',
  );
  const importedCopy = db
    .prepare("SELECT name,description,material FROM products WHERE code='PLN01'")
    .get() as { name: string; description: string; material: string };
  assert.equal(importedCopy.name, 'Áo polo nam HAUVIE PLN01');
  assert.match(importedCopy.description, /áo polo nam màu xanh rêu/i);
  assert.equal(importedCopy.material, 'Vải pique polyester co giãn');
  assert.doesNotMatch(importedCopy.description, /dữ liệu demo/i);
  assert.equal(
    db
      .prepare(
        "SELECT reserved_stock FROM product_variants WHERE id='var-atg01-s'",
      )
      .get()?.reserved_stock,
    1,
  );
  assert.equal(
    db.prepare("SELECT status FROM products WHERE code='PLN01'").get()?.status,
    'draft',
  );
  assert.equal(
    db.prepare("SELECT status FROM products WHERE code='QN01'").get()?.status,
    'active',
  );
  run(true);
  assert.equal(
    db.prepare("SELECT status FROM products WHERE code='PLN01'").get()?.status,
    'active',
  );
  assert.equal(
    db.prepare("SELECT is_visible FROM categories WHERE slug='ao-polo'").get()
      ?.is_visible,
    1,
  );
  assert.equal(
    db.prepare("SELECT price FROM products WHERE code='ATG01'").get()?.price,
    999000,
  );
  assert.equal(
    db
      .prepare("SELECT stock FROM product_variants WHERE id='var-atg01-s'")
      .get()?.stock,
    2,
  );
  assert.equal(
    db
      .prepare("SELECT object_key FROM product_images WHERE id='img-atg01'")
      .get()?.object_key,
    '/products/catalog-20260910/atg01-1.avif',
  );
  db.close();
});
