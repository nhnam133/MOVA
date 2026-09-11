import { getDb } from '@/db';
import { contactMessages } from '@/db/schema';

const recent = new Map<string, number>();

export async function POST(request: Request) {
  const key = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const now = Date.now();
  if ((recent.get(key) ?? 0) > now - 10_000)
    return Response.json(
      { error: 'Bạn gửi quá nhanh, vui lòng thử lại sau ít giây.' },
      { status: 429 },
    );
  const data = await request.formData();
  const value = (name: string) => {
    const entry = data.get(name);
    return typeof entry === 'string' ? entry.trim() : '';
  };
  const name = value('name');
  const email = value('email');
  const phone = value('phone');
  const message = value('message');
  const messageType = value('messageType') || 'general';
  const orderCode = value('orderCode').toUpperCase();
  if (name.length < 2 || message.length < 10 || (!email && !phone))
    return Response.json(
      { error: 'Vui lòng nhập tên, nội dung và ít nhất một cách liên hệ.' },
      { status: 400 },
    );
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Email chưa đúng định dạng.' },
      { status: 400 },
    );
  if (phone && !/^0\d{9}$/.test(phone.replaceAll(' ', '')))
    return Response.json(
      { error: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.' },
      { status: 400 },
    );
  if (!['general', 'order_support', 'cancel_request'].includes(messageType) || ((messageType === 'order_support' || messageType === 'cancel_request') && !/^(?:HV|MV)[A-Z0-9]{5,25}$/.test(orderCode)))
    return Response.json(
      { error: 'Vui lòng nhập mã đơn hợp lệ khi cần hỗ trợ hoặc yêu cầu hủy đơn.' },
      { status: 400 },
    );
  await getDb()
    .insert(contactMessages)
    .values({
      id: crypto.randomUUID(),
      name,
      email: email || null,
      phone: phone || null,
      messageType: messageType as 'general' | 'order_support' | 'cancel_request',
      orderCode: orderCode || null,
      message,
      createdAt: now,
      updatedAt: now,
    });
  recent.set(key, now);
  return Response.json({ status: 'created' }, { status: 201 });
}
