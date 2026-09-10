type CatalogItem = { slug: string; variants: { sku: string; stock: number }[] };
export type StoredCartItem = {
  productSlug: string;
  sku: string;
  quantity: number;
};

export function sanitizeCart(
  value: unknown,
  catalog: CatalogItem[],
): StoredCartItem[] {
  if (!Array.isArray(value)) return [];
  const result = new Map<string, StoredCartItem>();
  for (const item of value) {
    if (
      !item ||
      typeof item !== 'object' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    )
      continue;
    const product = catalog.find((entry) => entry.slug === item.productSlug);
    const variant = product?.variants.find((entry) => entry.sku === item.sku);
    if (!product || !variant || variant.stock < 1) continue;
    result.set(variant.sku, {
      productSlug: product.slug,
      sku: variant.sku,
      quantity: Math.min(
        variant.stock,
        (result.get(variant.sku)?.quantity ?? 0) + item.quantity,
      ),
    });
  }
  return [...result.values()];
}
