import { env } from 'cloudflare:workers';
import { getAdminUser } from '@/lib/admin-auth';
import { isSameOriginMutation } from '@/lib/auth-validation';
import { productImportCommands } from '@/lib/product-import';

export async function POST(request: Request) {
  if (!isSameOriginMutation(request, env.SITE_URL))
    return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  if (!(await getAdminUser()))
    return Response.json(
      { error: 'Chỉ quản trị viên được nhập sản phẩm.' },
      { status: 403 },
    );
  try {
    const body = (await request.json()) as {
      code?: unknown;
      includeNewCategories?: unknown;
    };
    if (typeof body.code !== 'string')
      return Response.json({ error: 'Thiếu mã sản phẩm.' }, { status: 400 });
    const commands = productImportCommands(
      body.code,
      body.includeNewCategories === true,
      Date.now(),
    );
    await env.DB.batch(
      commands.map((command) =>
        env.DB.prepare(command.sql).bind(...(command.params ?? [])),
      ),
    );
    return Response.json({ code: body.code, imported: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.message === 'UNKNOWN_PRODUCT_CODE'
            ? 'Mã không thuộc bộ ảnh đã chuẩn bị.'
            : 'Chưa nhập được sản phẩm. Có thể thử lại an toàn.',
      },
      { status: 400 },
    );
  }
}
