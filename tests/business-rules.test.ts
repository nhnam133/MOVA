import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateOrderTotals,
  EXCHANGE_WINDOW_MS,
  isExchangeWindowOpen,
} from '../lib/business-rules.ts';

test('tính đúng biên phí vận chuyển', () => {
  assert.equal(calculateOrderTotals(498_999).shippingFee, 30_000);
  assert.equal(calculateOrderTotals(499_000).shippingFee, 0);
});

test('voucher có thể làm mất miễn phí vận chuyển và điểm không tính ship', () => {
  assert.deepEqual(calculateOrderTotals(510_000, 20_000), {
    subtotal: 510_000,
    discount: 20_000,
    merchandiseTotal: 490_000,
    shippingFee: 30_000,
    total: 520_000,
    points: 49,
  });
});

test('mốc đúng 72 giờ được nhận và quá một mili giây bị từ chối', () => {
  const receivedAt = 1_700_000_000_000;
  assert.equal(
    isExchangeWindowOpen(receivedAt, receivedAt + EXCHANGE_WINDOW_MS),
    true,
  );
  assert.equal(
    isExchangeWindowOpen(receivedAt, receivedAt + EXCHANGE_WINDOW_MS + 1),
    false,
  );
});
