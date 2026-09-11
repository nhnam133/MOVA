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
const LEGACY_STORAGE_KEY = 'mova-cart-v1';
const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    // Reset carts created by the former demo/QA build once, then persist only
    // items that shoppers explicitly add in the current storefront.
    if (window.localStorage.getItem(LEGACY_STORAGE_KEY)) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return [];
    }
    const value = window.localStorage.getItem(STORAGE_KEY);
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
}: {
  children: React.ReactNode;
  catalog: Product[];
  signedIn?: boolean;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(sanitizeCart(readStoredCart(), catalog));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [catalog]);

  useEffect(() => {
    if (hydrated) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* Cart remains usable when storage is blocked. */
      }
    }
  }, [hydrated, items]);

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
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Restricted storage. */
    }
    setItems([]);
  }, []);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    const register = async () => {
      await context.registerTool(
        {
          name: 'add_product_to_cart',
          title: 'Thêm sản phẩm vào giỏ MOVA',
          description:
            'Thêm một phiên bản sản phẩm MOVA vào giỏ hàng hiện tại và mở giỏ hàng.',
          inputSchema: {
            type: 'object',
            properties: {
              productSlug: {
                type: 'string',
                description: 'Slug sản phẩm trong danh mục MOVA.',
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
          title: 'Xem giỏ hàng MOVA',
          description:
            'Đọc các SKU, số lượng và tổng số sản phẩm trong giỏ MOVA hiện tại.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute() {
            const storedItems = readStoredCart();
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
  }, [addItem]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
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
