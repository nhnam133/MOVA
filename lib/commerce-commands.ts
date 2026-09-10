export type SqlCommand = { sql: string; params?: (string | number | null)[] };

export function guard(
  predicate: string,
  params: (string | number | null)[] = [],
): SqlCommand {
  return {
    sql: `INSERT INTO transaction_guards (id, valid) SELECT ?, CASE WHEN (${predicate}) THEN 1 ELSE 0 END`,
    params: [crypto.randomUUID(), ...params],
  };
}

export function earnPointsCommands(orderId: string, now: number): SqlCommand[] {
  // The balance is updated only while the unique earn entry is absent, in the same batch.
  return [
    {
      sql: "UPDATE users SET points_balance=points_balance+(SELECT points_earned FROM orders WHERE id=?),updated_at=? WHERE id=(SELECT user_id FROM orders WHERE id=? AND status='completed' AND payment_status='paid' AND points_earned>0) AND NOT EXISTS (SELECT 1 FROM point_transactions WHERE order_id=? AND type='earn')",
      params: [orderId, now, orderId, orderId],
    },
    {
      sql: "INSERT INTO point_transactions (id,user_id,order_id,type,points,note,created_at) SELECT ?,user_id,id,'earn',points_earned,'Điểm từ đơn ' || order_code,? FROM orders WHERE id=? AND status='completed' AND payment_status='paid' AND points_earned>0 ON CONFLICT(order_id,type) DO NOTHING",
      params: [crypto.randomUUID(), now, orderId],
    },
  ];
}

export function cancelOrderCommands(
  orderId: string,
  now: number,
): SqlCommand[] {
  return [
    guard(
      "EXISTS (SELECT 1 FROM orders WHERE id=? AND status='pending' AND payment_method='cod')",
      [orderId],
    ),
    {
      sql: "UPDATE orders SET status='cancelled',cancelled_at=?,updated_at=? WHERE id=?",
      params: [now, now, orderId],
    },
    {
      sql: 'UPDATE product_variants SET reserved_stock=MAX(0,reserved_stock-(SELECT SUM(quantity) FROM order_items WHERE order_id=? AND variant_id=product_variants.id)),updated_at=? WHERE id IN (SELECT variant_id FROM order_items WHERE order_id=?)',
      params: [orderId, now, orderId],
    },
    {
      sql: "UPDATE customer_vouchers SET status='available',order_id=NULL WHERE order_id=? AND status='reserved'",
      params: [orderId],
    },
  ];
}

export function shipOrderCommands(orderId: string, now: number): SqlCommand[] {
  return [
    guard(
      "EXISTS (SELECT 1 FROM orders WHERE id=? AND status='confirmed' AND (payment_method='cod' OR payment_status='paid'))",
      [orderId],
    ),
    guard(
      'NOT EXISTS (SELECT 1 FROM (SELECT variant_id,SUM(quantity) AS qty FROM order_items WHERE order_id=? GROUP BY variant_id) i LEFT JOIN product_variants v ON v.id=i.variant_id WHERE v.id IS NULL OR v.stock<i.qty OR v.reserved_stock<i.qty)',
      [orderId],
    ),
    {
      sql: "UPDATE orders SET status='shipping',updated_at=? WHERE id=?",
      params: [now, orderId],
    },
    {
      sql: 'UPDATE product_variants SET stock=stock-(SELECT SUM(quantity) FROM order_items WHERE order_id=? AND variant_id=product_variants.id),reserved_stock=reserved_stock-(SELECT SUM(quantity) FROM order_items WHERE order_id=? AND variant_id=product_variants.id),updated_at=? WHERE id IN (SELECT variant_id FROM order_items WHERE order_id=?)',
      params: [orderId, orderId, now, orderId],
    },
  ];
}
