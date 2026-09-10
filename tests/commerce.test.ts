import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import {
  cancelOrderCommands,
  shipOrderCommands,
  earnPointsCommands,
  guard,
  type SqlCommand,
} from '../lib/commerce-commands.ts';

function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys=ON');
  for (const name of readdirSync(new URL('../drizzle/', import.meta.url))
    .filter((n) => n.endsWith('.sql'))
    .sort())
    db.exec(
      readFileSync(new URL('../drizzle/' + name, import.meta.url), 'utf8'),
    );
  db.prepare(
    'INSERT INTO users (id,email,created_at,updated_at) VALUES (?,?,0,0)',
  ).run('u', 'test@example.invalid');
  const variant = db
    .prepare('SELECT id,product_id,stock FROM product_variants LIMIT 1')
    .get() as { id: string; product_id: string; stock: number };
  db.prepare('UPDATE product_variants SET reserved_stock=2 WHERE id=?').run(
    variant.id,
  );
  db.prepare(
    "INSERT INTO orders (id,order_code,user_id,payment_method,recipient_name,recipient_phone,address_line,ward,district,province,subtotal,shipping_fee,total,points_earned,created_at,updated_at) VALUES ('o','TEST','u','cod','Test','0900000000','Test','Test','Test','Test',200000,30000,230000,20,0,0)",
  ).run();
  db.prepare(
    "INSERT INTO order_items (id,order_id,product_id,variant_id,product_code,product_name,sku,color,size,unit_price,quantity,line_total) VALUES ('i','o',?,?,'TEST','Test','TEST','Black','M',100000,2,200000)",
  ).run(variant.product_id, variant.id);
  const batch = (commands: SqlCommand[]) => {
    db.exec('BEGIN');
    try {
      for (const cmd of commands)
        db.prepare(cmd.sql).run(...(cmd.params ?? []));
      db.exec('DELETE FROM transaction_guards; COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };
  return { db, variant, batch };
}

test('cancellation releases reservations once; duplicate rolls back', () => {
  const { db, variant, batch } = fixture();
  try {
    batch(cancelOrderCommands('o', 100));
    assert.equal(
      db
        .prepare('SELECT reserved_stock FROM product_variants WHERE id=?')
        .get(variant.id)?.reserved_stock,
      0,
    );
    assert.throws(() => batch(cancelOrderCommands('o', 101)));
    assert.equal(
      db
        .prepare('SELECT stock FROM product_variants WHERE id=?')
        .get(variant.id)?.stock,
      variant.stock,
    );
  } finally {
    db.close();
  }
});
test('shipping deducts physical and reserved stock once', () => {
  const { db, variant, batch } = fixture();
  try {
    db.exec("UPDATE orders SET status='confirmed'");
    batch(shipOrderCommands('o', 100));
    assert.throws(() => batch(shipOrderCommands('o', 101)));
    const stock = db
      .prepare('SELECT stock,reserved_stock FROM product_variants WHERE id=?')
      .get(variant.id);
    assert.equal(stock?.stock, variant.stock - 2);
    assert.equal(stock?.reserved_stock, 0);
  } finally {
    db.close();
  }
});
test('out-of-stock shipping rolls back status and all stock writes', () => {
  const { db, variant, batch } = fixture();
  try {
    db.exec("UPDATE orders SET status='confirmed'");
    db.prepare('UPDATE product_variants SET stock=1 WHERE id=?').run(
      variant.id,
    );
    assert.throws(() => batch(shipOrderCommands('o', 100)));
    assert.equal(
      db.prepare("SELECT status FROM orders WHERE id='o'").get()?.status,
      'confirmed',
    );
    assert.equal(
      db
        .prepare('SELECT reserved_stock FROM product_variants WHERE id=?')
        .get(variant.id)?.reserved_stock,
      2,
    );
  } finally {
    db.close();
  }
});
test('points only awarded after complete and paid, never twice', () => {
  const { db, batch } = fixture();
  try {
    batch(earnPointsCommands('o', 100));
    assert.equal(
      db.prepare("SELECT points_balance FROM users WHERE id='u'").get()
        ?.points_balance,
      0,
    );
    db.exec("UPDATE orders SET status='completed',payment_status='paid'");
    batch(earnPointsCommands('o', 101));
    batch(earnPointsCommands('o', 102));
    assert.equal(
      db.prepare("SELECT points_balance FROM users WHERE id='u'").get()
        ?.points_balance,
      20,
    );
    assert.equal(
      db
        .prepare(
          "SELECT COUNT(*) AS n FROM point_transactions WHERE order_id='o'",
        )
        .get()?.n,
      1,
    );
  } finally {
    db.close();
  }
});
test('failed guard rolls back preceding writes', () => {
  const { db, batch } = fixture();
  try {
    assert.throws(() =>
      batch([
        { sql: "UPDATE users SET points_balance=999 WHERE id='u'" },
        guard('0'),
      ]),
    );
    assert.equal(
      db.prepare("SELECT points_balance FROM users WHERE id='u'").get()
        ?.points_balance,
      0,
    );
  } finally {
    db.close();
  }
});
