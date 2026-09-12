'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Product } from '@/lib/catalog';
import { sanitizeCart } from '@/lib/cart-rules';

export type CartItem = {
  productSlug: string;
  sku: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  hydrated: boolean;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (productSlug: string, sku: string, quantity?: number) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
  catalog: Product[];
  signedIn: boolean;
};

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (
    input: unknown,
  ) => Record<string, unknown> | Promise<Record<string, unknown>>;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: WebMcpTool,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

const STORAGE_KEY = 'mova-cart-v2';
const GUEST_STORAGE_KEY = 'mova-cart-v2:guest';
const LEGACY_STORAGE_KEY = 'mova-cart-v1';
const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(key = STORAGE_KEY): CartItem[] {
  try {
    // Reset carts created by the former demo/QA build once, then persist only
    // items that shoppers explicitly add in the current storefront.
    if (window.localStorage.getItem(LEGACY_STORAGE_KEY)) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return [];
    }
    const value = window.localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
  catalog,
  signedIn = false,
  accountKey,
}: {
  children: React.ReactNode;
  catalog: Product[];
  signedIn?: boolean;
  accountKey?: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const storageKey =
    signedIn && accountKey ? `${STORAGE_KEY}:${accountKey}` : GUEST_STORAGE_KEY;

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const legacy = readStoredCart(STORAGE_KEY);
      const local = readStoredCart(storageKey);
      const guest = signedIn ? readStoredCart(GUEST_STORAGE_KEY) : [];
      let next = sanitizeCart([...legacy, ...local, ...guest], catalog);
      if (signedIn) {
        try {
          const response = await fetch('/api/cart', { cache: 'no-store' });
          if (response.ok) {
            const result = (await response.json()) as { items?: CartItem[] };
            next = sanitizeCart(
              [...(result.items ?? []), ...legacy, ...guest],
              catalog,
            );
          }
        } catch {
          /* Fall back to the device cache while offline. */
        }
      }
      if (cancelled) return;
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        if (signedIn) window.localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch {
        /* Storage may be restricted. */
      }
      setItems(next);
      setHydrated(true);
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [catalog, signedIn, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      /* Cart remains usable when storage is blocked. */
    }
    if (!signedIn) return;
    const timer = window.setTimeout(() => {
      void fetch('/api/cart', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [hydrated, items, signedIn, storageKey]);

  const addItem = useCallback(
    (productSlug: string, sku: string, quantity = 1) => {
      const product = catalog.find((entry) => entry.slug === productSlug);
      const variant = product?.variants.find((entry) => entry.sku === sku);
      if (
        !product ||
        !variant ||
        variant.stock < 1 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      )
        return;

      setItems((current) => {
        const existing = current.find((item) => item.sku === sku);
        const nextQuantity = Math.min(
          variant.stock,
          (existing?.quantity ?? 0) + quantity,
        );
        return existing
          ? current.map((item) =>
              item.sku === sku ? { ...item, quantity: nextQuantity } : item,
            )
          : [...current, { productSlug, sku, quantity }];
      });
      setCartOpen(true);
    },
    [catalog],
  );

  const updateQuantity = useCallback(
    (sku: string, quantity: number) => {
      if (!Number.isInteger(quantity)) return;
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => item.sku !== sku));
        return;
      }
      const variant = catalog
        .flatMap((product) => product.variants)
        .find((entry) => entry.sku === sku);
      if (!variant || quantity > variant.stock) return;
      setItems((current) =>
        current.map((item) =>
          item.sku === sku ? { ...item, quantity } : item,
        ),
      );
    },
    [catalog],
  );

  const removeItem = useCallback(
    (sku: string) =>
      setItems((current) => current.filter((item) => item.sku !== sku)),
    [],
  );
  const clearCart = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* Restricted storage. */
    }
    setItems([]);
  }, [storageKey]);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    const register = async () => {
      await context.registerTool(
        {
          name: 'add_product_to_cart',
          title: 'Thêm sản phẩm vào giỏ HAUVIE',
          description:
            'Thêm một phiên bản sản phẩm HAUVIE vào giỏ hàng hiện tại và mở giỏ hàng.',
          inputSchema: {
            type: 'object',
            properties: {
              productSlug: {
                type: 'string',
                description: 'Slug sản phẩm trong danh mục HAUVIE.',
              },
              sku: {
                type: 'string',
                description: 'Mã SKU của màu và size đã chọn.',
              },
              quantity: { type: 'integer', minimum: 1, maximum: 20 },
            },
            required: ['productSlug', 'sku'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            const value = input as {
              productSlug?: string;
              sku?: string;
              quantity?: number;
            };
            if (!value.productSlug || !value.sku)
              throw new Error('Thiếu productSlug hoặc sku.');
            const quantity = value.quantity ?? 1;
            addItem(value.productSlug, value.sku, quantity);
            return {
              status: 'added',
              productSlug: value.productSlug,
              sku: value.sku,
              quantity,
            };
          },
        },
        { signal: lifecycle.signal },
      );

      await context.registerTool(
        {
          name: 'read_cart',
          title: 'Xem giỏ hàng HAUVIE',
          description:
            'Đọc các SKU, số lượng và tổng số sản phẩm trong giỏ HAUVIE hiện tại.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute() {
            const storedItems = readStoredCart(storageKey);
            return {
              items: storedItems,
              itemCount: storedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              ),
            };
          },
        },
        { signal: lifecycle.signal },
      );
    };

    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, [addItem, storageKey]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      hydrated,
      isCartOpen,
      setCartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      catalog,
      signedIn,
    }),
    [
      hydrated,
      items,
      itemCount,
      isCartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      catalog,
      signedIn,
    ],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error('useCart phải được dùng bên trong CartProvider.');
  return context;
}
