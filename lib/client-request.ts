/** Always returns a JSON response, including connection failures.
 * Never retries writes: callers keep their idempotency key for manual retry.
 */
export async function requestJson(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(25000),
    });
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') throw new Error('Invalid response');
    return Response.json(data, { status: response.status });
  } catch {
    return Response.json(
      {
        error:
          'Chưa nhận được phản hồi. Kiểm tra kết nối; nếu vừa đặt hàng, hãy xem lịch sử đơn trước khi thử lại.',
      },
      { status: 503 },
    );
  }
}
