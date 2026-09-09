export const FREE_SHIPPING_THRESHOLD = 499_000;
export const STANDARD_SHIPPING_FEE = 30_000;
export const EXCHANGE_WINDOW_MS = 72 * 60 * 60 * 1000;

export function calculateOrderTotals(subtotal: number, discount = 0) {
  if (!Number.isInteger(subtotal) || subtotal < 0 || !Number.isInteger(discount) || discount < 0) throw new Error('INVALID_AMOUNT');
  const safeDiscount = Math.min(discount, subtotal);
  const merchandiseTotal = subtotal - safeDiscount;
  const shippingFee = merchandiseTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  return { subtotal, discount: safeDiscount, merchandiseTotal, shippingFee, total: merchandiseTotal + shippingFee, points: Math.floor(merchandiseTotal / 10_000) };
}

export function isExchangeWindowOpen(receivedAt: number | null, requestedAt: number) {
  if (!receivedAt || requestedAt < receivedAt) return false;
  return requestedAt <= receivedAt + EXCHANGE_WINDOW_MS;
}
