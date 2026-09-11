import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { productVariants } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { atomicBatch, guard } from '@/lib/atomic-db';

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = await request.json() as { variantId?: string; stock?: number; reason?: string; updatedAt?: number };
  const stock = Number(body.stock); const reason = body.reason?.trim() || '';
  if (!body.variantId || !Number.isSafeInteger(stock) || stock < 0 || stock > 1000000 || !Number.isSafeInteger(body.updatedAt) || reason.length < 5 || reason.length > 300) return Response.json({ error: 'Nhập tồn kho hợp lệ và lý do ít nhất 5 ký tự.' }, { status: 400 });
  const db = getDb();
  const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, body.variantId)).limit(1);
  if (!variant) return Response.json({ error: 'Không tìm thấy SKU.' }, { status: 404 });
  if (stock < variant.reservedStock) return Response.json({ error: `Không thể thấp hơn ${variant.reservedStock} sản phẩm đang được giữ.` }, { status: 409 });
  if (stock === variant.stock) return Response.json({ error: 'Số lượng mới chưa thay đổi.' }, { status: 400 });
  const now = Date.now();
  try {
    await atomicBatch([
      guard('EXISTS (SELECT 1 FROM product_variants WHERE id=? AND updated_at=? AND reserved_stock<=?)', [variant.id, body.updatedAt!, stock]),
      { sql: "INSERT INTO stock_movements (id,variant_id,actor_user_id,type,quantity_delta,stock_before,stock_after,reason,reference_type,reference_id,created_at) VALUES (?,?,?,'adjustment',?,?,?,?,?,?,?)", params: [crypto.randomUUID(), variant.id, admin.userId, stock - variant.stock, variant.stock, stock, reason, 'admin', admin.userId, now] },
      { sql: 'UPDATE product_variants SET stock=?,updated_at=? WHERE id=?', params: [stock, now, variant.id] },
    ]);
  } catch { return Response.json({ error: 'Tồn kho vừa thay đổi. Vui lòng tải lại và thử lại.' }, { status: 409 }); }
  return Response.json({ status: 'updated' });
}
