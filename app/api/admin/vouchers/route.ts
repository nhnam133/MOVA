import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { vouchers } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';

type VoucherInput = { id?: string; code?: string; value?: number; minimumOrderValue?: number; pointsCost?: number; expiresAt?: number | null; active?: boolean };

function validate(body: VoucherInput) {
  const code = body.code?.trim().toUpperCase() || '';
  return /^[A-Z0-9-]{3,30}$/.test(code) && Number.isSafeInteger(body.value) && body.value! >= 1000 && body.value! <= 10000000 && Number.isSafeInteger(body.minimumOrderValue) && body.minimumOrderValue! >= body.value! && Number.isSafeInteger(body.pointsCost) && body.pointsCost! >= 0 && (body.expiresAt == null || (Number.isSafeInteger(body.expiresAt) && body.expiresAt! > Date.now())) && typeof body.active === 'boolean';
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = await request.json() as VoucherInput;
  if (!validate(body)) return Response.json({ error: 'Kiểm tra mã, giá trị, đơn tối thiểu, điểm đổi và ngày hết hạn.' }, { status: 400 });
  try {
    await getDb().insert(vouchers).values({ id: crypto.randomUUID(), code: body.code!.trim().toUpperCase(), value: body.value!, minimumOrderValue: body.minimumOrderValue!, pointsCost: body.pointsCost!, expiresAt: body.expiresAt ?? null, active: body.active!, createdAt: Date.now() });
  } catch { return Response.json({ error: 'Mã voucher đã tồn tại.' }, { status: 409 }); }
  return Response.json({ status: 'created' }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = await request.json() as VoucherInput;
  if (!body.id || !validate(body)) return Response.json({ error: 'Thông tin voucher chưa hợp lệ.' }, { status: 400 });
  try {
    await getDb().update(vouchers).set({ code: body.code!.trim().toUpperCase(), value: body.value!, minimumOrderValue: body.minimumOrderValue!, pointsCost: body.pointsCost!, expiresAt: body.expiresAt ?? null, active: body.active! }).where(eq(vouchers.id, body.id));
  } catch { return Response.json({ error: 'Mã voucher đã tồn tại.' }, { status: 409 }); }
  return Response.json({ status: 'updated' });
}
