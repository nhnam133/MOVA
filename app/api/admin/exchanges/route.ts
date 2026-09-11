import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { exchangeItems, exchangeRequests, orderItems, productVariants } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';
import { atomicBatch, guard, type SqlCommand } from '@/lib/atomic-db';

type Body = {
  id?: string; action?: string; replacementSku?: string; responsibility?: string;
  note?: string; feeAmount?: number; feePaid?: boolean; returnedSku?: string;
  returnCondition?: string; restockDecision?: string;
};

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  let body: Body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  if (!body.id) return Response.json({ error: 'Thiếu mã yêu cầu.' }, { status: 400 });
  const db = getDb(); const now = Date.now();
  const [entry] = await db.select().from(exchangeRequests).where(eq(exchangeRequests.id, body.id)).limit(1);
  if (!entry) return Response.json({ error: 'Không tìm thấy yêu cầu.' }, { status: 404 });
  const [item] = await db.select({ id: exchangeItems.id, quantity: exchangeItems.quantity, replacementSku: exchangeItems.replacementSku, productId: orderItems.productId, originalVariantId: orderItems.variantId, originalSku: orderItems.sku, color: orderItems.color }).from(exchangeItems).innerJoin(orderItems, eq(exchangeItems.orderItemId, orderItems.id)).where(eq(exchangeItems.exchangeRequestId, entry.id)).limit(1);
  if (!item) return Response.json({ error: 'Yêu cầu thiếu chi tiết sản phẩm.' }, { status: 409 });
  const note = body.note?.trim() || '';
  const commands: SqlCommand[] = [guard('EXISTS (SELECT 1 FROM exchange_requests WHERE id=? AND status=?)', [entry.id, entry.status])];
  let status = '';

  if (body.action === 'review' && ['submitted', 'needs_info'].includes(entry.status)) {
    status = 'reviewing';
  } else if (body.action === 'needs_info' && ['submitted', 'reviewing'].includes(entry.status)) {
    if (note.length < 5 || note.length > 2000) return Response.json({ error: 'Ghi rõ thông tin khách cần bổ sung.' }, { status: 400 });
    status = 'needs_info';
    commands.push({ sql: 'UPDATE exchange_requests SET admin_note=?,reviewed_at=? WHERE id=?', params: [note, now, entry.id] });
  } else if (body.action === 'reject' && ['submitted', 'reviewing', 'needs_info'].includes(entry.status)) {
    if (note.length < 5 || note.length > 2000) return Response.json({ error: 'Cần ghi rõ lý do từ chối.' }, { status: 400 });
    status = 'rejected';
    commands.push({ sql: 'UPDATE exchange_requests SET admin_note=?,reviewed_at=? WHERE id=?', params: [note, now, entry.id] });
  } else if (body.action === 'approve' && ['submitted', 'reviewing', 'needs_info'].includes(entry.status)) {
    const feeAmount = Number(body.feeAmount || 0);
    if (!['seller', 'customer'].includes(body.responsibility || '') || note.length < 5 || note.length > 2000 || !body.replacementSku || !Number.isSafeInteger(feeAmount) || feeAmount < 0 || feeAmount > 1000000) return Response.json({ error: 'Chọn SKU, bên chịu phí, phí vận chuyển và ghi kết luận.' }, { status: 400 });
    if (body.responsibility === 'seller' && feeAmount !== 0) return Response.json({ error: 'Khi HAUVIE chịu phí, phí khách phải trả phải bằng 0.' }, { status: 400 });
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.sku, body.replacementSku)).limit(1);
    if (!variant || !variant.active || (entry.reason === 'wrong_size' && (variant.productId !== item.productId || variant.color !== item.color))) return Response.json({ error: 'Đổi sai size phải giữ đúng sản phẩm và màu đã mua.' }, { status: 400 });
    commands.push(
      guard('EXISTS (SELECT 1 FROM product_variants WHERE id=? AND active=1 AND stock-reserved_stock>=?)', [variant.id, item.quantity]),
      { sql: 'UPDATE product_variants SET reserved_stock=reserved_stock+?,updated_at=? WHERE id=?', params: [item.quantity, now, variant.id] },
      { sql: 'UPDATE exchange_items SET replacement_sku=? WHERE id=?', params: [variant.sku, item.id] },
      { sql: 'UPDATE exchange_requests SET responsibility=?,admin_note=?,reviewed_at=?,fee_amount=?,fee_status=? WHERE id=?', params: [body.responsibility!, note, now, feeAmount, feeAmount > 0 ? (body.feePaid ? 'paid' : 'awaiting') : 'not_required', entry.id] },
    );
    status = 'approved';
  } else if (body.action === 'request_return' && entry.status === 'approved') {
    status = 'return_shipping';
  } else if (body.action === 'receive_return' && entry.status === 'return_shipping' && item.replacementSku) {
    const returnedSku = body.returnedSku?.trim() || '';
    if (returnedSku.length < 3 || returnedSku.length > 80 || !['accepted', 'rejected'].includes(body.returnCondition || '') || !['restock', 'quarantine'].includes(body.restockDecision || '') || note.length < 5 || note.length > 2000) return Response.json({ error: 'Ghi SKU thực nhận, kết quả kiểm tra, cách xử lý kho và ghi chú.' }, { status: 400 });
    if (entry.responsibility === 'customer' && entry.feeAmount > 0 && !body.feePaid && entry.feeStatus !== 'paid') return Response.json({ error: 'Cần xác nhận khách đã thanh toán phí đổi trước khi tiếp tục.' }, { status: 409 });
    if (body.returnCondition === 'rejected') {
      commands.push({ sql: 'UPDATE product_variants SET reserved_stock=MAX(0,reserved_stock-?),updated_at=? WHERE sku=?', params: [item.quantity, now, item.replacementSku] });
      status = 'rejected';
    } else {
      status = 'received';
      if (body.restockDecision === 'restock' && item.originalVariantId) {
        commands.push(
          { sql: "INSERT INTO stock_movements (id,variant_id,actor_user_id,type,quantity_delta,stock_before,stock_after,reason,reference_type,reference_id,created_at) SELECT ?,id,?,'restock',?,stock,stock+?,'Nhập lại hàng đổi đạt chất lượng','exchange',?,? FROM product_variants WHERE id=?", params: [crypto.randomUUID(), admin.userId, item.quantity, item.quantity, entry.id, now, item.originalVariantId] },
          { sql: 'UPDATE product_variants SET stock=stock+?,updated_at=? WHERE id=?', params: [item.quantity, now, item.originalVariantId] },
        );
      }
    }
    commands.push({ sql: 'UPDATE exchange_requests SET returned_sku=?,return_condition=?,restock_decision=?,received_at=?,fee_status=?,admin_note=? WHERE id=?', params: [returnedSku, body.returnCondition!, body.restockDecision!, now, entry.feeAmount > 0 ? 'paid' : entry.feeStatus, note, entry.id] });
  } else if (body.action === 'ship' && entry.status === 'received' && item.replacementSku) {
    commands.push(
      guard('EXISTS (SELECT 1 FROM product_variants WHERE sku=? AND stock>=? AND reserved_stock>=?)', [item.replacementSku, item.quantity, item.quantity]),
      { sql: 'UPDATE product_variants SET stock=stock-?,reserved_stock=reserved_stock-?,updated_at=? WHERE sku=?', params: [item.quantity, item.quantity, now, item.replacementSku] },
      { sql: "INSERT INTO stock_movements (id,variant_id,actor_user_id,type,quantity_delta,stock_before,stock_after,reason,reference_type,reference_id,created_at) SELECT ?,id,?,'exchange',-?,stock+?,stock,'Xuất sản phẩm đổi cho khách','exchange',?,? FROM product_variants WHERE sku=?", params: [crypto.randomUUID(), admin.userId, item.quantity, item.quantity, entry.id, now, item.replacementSku] },
      { sql: 'UPDATE exchange_requests SET shipped_at=? WHERE id=?', params: [now, entry.id] },
    );
    status = 'shipping';
  } else if (body.action === 'complete' && entry.status === 'shipping') {
    commands.push({ sql: 'UPDATE exchange_requests SET completed_at=? WHERE id=?', params: [now, entry.id] });
    status = 'completed';
  } else {
    return Response.json({ error: 'Trạng thái không cho phép thao tác này.' }, { status: 409 });
  }

  commands.push(
    { sql: 'UPDATE exchange_requests SET status=? WHERE id=?', params: [status, entry.id] },
    { sql: 'INSERT INTO exchange_events (id,exchange_request_id,actor_user_id,event_type,from_status,to_status,note,created_at) VALUES (?,?,?,?,?,?,?,?)', params: [crypto.randomUUID(), entry.id, admin.userId, body.action || status, entry.status, status, note, now] },
  );
  try { await atomicBatch(commands); } catch { return Response.json({ error: 'Tồn kho hoặc trạng thái vừa thay đổi; chưa áp dụng thao tác.' }, { status: 409 }); }
  return Response.json({ status });
}
