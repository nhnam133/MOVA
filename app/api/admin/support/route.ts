import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { contactMessages, reviews } from '@/db/schema';
import { getAdminUser } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin)
    return Response.json(
      { error: 'Bạn không có quyền quản trị.' },
      { status: 403 },
    );
  const body = (await request.json()) as {
    type?: string;
    id?: string;
    status?: 'new' | 'processing' | 'resolved';
    visible?: boolean;
    hiddenReason?: string | null;
  };
  if (!body.id)
    return Response.json({ error: 'Thiếu mã dữ liệu.' }, { status: 400 });
  const db = getDb();
  if (
    body.type === 'contact' &&
    body.status &&
    ['new', 'processing', 'resolved'].includes(body.status)
  ) {
    await db
      .update(contactMessages)
      .set({ status: body.status, updatedAt: Date.now() })
      .where(eq(contactMessages.id, body.id));
    return Response.json({ status: 'updated' });
  }
  if (body.type === 'review' && typeof body.visible === 'boolean') {
    await db
      .update(reviews)
      .set({
        visible: body.visible,
        hiddenReason: body.visible
          ? null
          : body.hiddenReason || 'Ẩn bởi quản trị viên',
        updatedAt: Date.now(),
      })
      .where(eq(reviews.id, body.id));
    return Response.json({ status: 'updated' });
  }
  return Response.json({ error: 'Thao tác không hợp lệ.' }, { status: 400 });
}
