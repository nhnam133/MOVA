import test from 'node:test';
import assert from 'node:assert/strict';
import assets from '../lib/product-assets.json' with { type: 'json' };
import { demoReviewsForProduct } from '../lib/demo-reviews.ts';

test('every catalog product has 3-5 disclosed demo reviews with 4-5 stars', () => {
  const allReviews = assets.flatMap((product) => {
    const reviews = demoReviewsForProduct({
      key: product.code,
      name: product.name,
    });
    assert.ok(reviews.length >= 3 && reviews.length <= 5, product.code);
    reviews.forEach((review) => {
      assert.ok(review.rating === 4 || review.rating === 5);
      assert.equal(review.demo, true);
      assert.match(review.name, /^[\p{L}]+(?: [\p{L}]+){2,}$/u);
      assert.ok(review.content.includes(product.name));
    });
    return reviews;
  });

  const contents = allReviews.map((review) => review.content);
  assert.equal(new Set(contents).size, contents.length);
});

test('demo review generation is stable across renders', () => {
  const product = { key: 'PLN01', name: 'Áo polo nam HAUVIE PLN01' };
  assert.deepEqual(
    demoReviewsForProduct(product),
    demoReviewsForProduct(product),
  );
});
