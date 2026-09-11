import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  check,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const authRateLimits = sqliteTable(
  'auth_rate_limits',
  {
    id: text('id').primaryKey(),
    attempts: integer('attempts').notNull(),
    expiresAt: integer('expires_at').notNull(),
  },
  (table) => [index('auth_rate_limits_expiry_index').on(table.expiresAt)],
);

export const transactionGuards = sqliteTable(
  'transaction_guards',
  {
    id: text('id').primaryKey(),
    valid: integer('valid').notNull(),
  },
  (table) => [check('transaction_guard_valid', sql`${table.valid} = 1`)],
);

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    fullName: text('full_name'),
    phone: text('phone'),
    role: text('role', { enum: ['customer', 'admin'] })
      .notNull()
      .default('customer'),
    pointsBalance: integer('points_balance').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    isVisible: integer('is_visible', { mode: 'boolean' })
      .notNull()
      .default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [uniqueIndex('categories_slug_unique').on(table.slug)],
);

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    code: text('code').notNull(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    material: text('material').notNull().default(''),
    price: integer('price').notNull(),
    compareAtPrice: integer('compare_at_price'),
    gender: text('gender', { enum: ['female', 'male', 'unisex'] })
      .notNull()
      .default('unisex'),
    status: text('status', { enum: ['draft', 'active', 'hidden'] })
      .notNull()
      .default('draft'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('products_code_unique').on(table.code),
    uniqueIndex('products_slug_unique').on(table.slug),
    index('products_category_index').on(table.categoryId),
  ],
);

export const productImages = sqliteTable(
  'product_images',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    objectKey: text('object_key').notNull(),
    altText: text('alt_text').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('product_images_product_index').on(table.productId)],
);

export const productVariants = sqliteTable(
  'product_variants',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    color: text('color').notNull(),
    size: text('size').notNull(),
    stock: integer('stock').notNull().default(0),
    reservedStock: integer('reserved_stock').notNull().default(0),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('product_variants_sku_unique').on(table.sku),
    uniqueIndex('product_variants_option_unique').on(
      table.productId,
      table.color,
      table.size,
    ),
  ],
);

export const stockMovements = sqliteTable(
  'stock_movements',
  {
    id: text('id').primaryKey(),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id),
    actorUserId: text('actor_user_id').references(() => users.id),
    type: text('type', {
      enum: ['initial', 'adjustment', 'order', 'release', 'exchange', 'restock'],
    }).notNull(),
    quantityDelta: integer('quantity_delta').notNull(),
    stockBefore: integer('stock_before').notNull(),
    stockAfter: integer('stock_after').notNull(),
    reason: text('reason').notNull(),
    referenceType: text('reference_type'),
    referenceId: text('reference_id'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    index('stock_movements_variant_created_index').on(
      table.variantId,
      table.createdAt,
    ),
    index('stock_movements_reference_index').on(
      table.referenceType,
      table.referenceId,
    ),
  ],
);

export const cartItems = sqliteTable(
  'cart_items',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('cart_items_user_variant_unique').on(
      table.userId,
      table.variantId,
    ),
    index('cart_items_user_index').on(table.userId),
  ],
);

export const vouchers = sqliteTable(
  'vouchers',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    value: integer('value').notNull(),
    minimumOrderValue: integer('minimum_order_value').notNull().default(0),
    pointsCost: integer('points_cost').notNull().default(0),
    expiresAt: integer('expires_at'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [uniqueIndex('vouchers_code_unique').on(table.code)],
);

export const customerVouchers = sqliteTable(
  'customer_vouchers',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    voucherId: text('voucher_id')
      .notNull()
      .references(() => vouchers.id),
    status: text('status', {
      enum: ['available', 'reserved', 'used', 'expired'],
    })
      .notNull()
      .default('available'),
    orderId: text('order_id'),
    expiresAt: integer('expires_at').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('customer_vouchers_user_index').on(table.userId)],
);

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderCode: text('order_code').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    requestKey: text('request_key'),
    status: text('status', {
      enum: [
        'pending',
        'confirmed',
        'shipping',
        'delivered',
        'completed',
        'cancelled',
      ],
    })
      .notNull()
      .default('pending'),
    paymentMethod: text('payment_method', { enum: ['cod', 'momo'] }).notNull(),
    paymentStatus: text('payment_status', {
      enum: ['unpaid', 'pending', 'paid', 'failed', 'manual_refund'],
    })
      .notNull()
      .default('unpaid'),
    momoRequestId: text('momo_request_id'),
    momoTransactionId: text('momo_transaction_id'),
    recipientName: text('recipient_name').notNull(),
    recipientPhone: text('recipient_phone').notNull(),
    addressLine: text('address_line').notNull(),
    ward: text('ward').notNull(),
    district: text('district').notNull(),
    province: text('province').notNull(),
    note: text('note'),
    subtotal: integer('subtotal').notNull(),
    discount: integer('discount').notNull().default(0),
    shippingFee: integer('shipping_fee').notNull(),
    total: integer('total').notNull(),
    pointsEarned: integer('points_earned').notNull().default(0),
    deliveredAt: integer('delivered_at'),
    completedAt: integer('completed_at'),
    cancelledAt: integer('cancelled_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('orders_code_unique').on(table.orderCode),
    uniqueIndex('orders_request_key_unique').on(table.requestKey),
    index('orders_user_index').on(table.userId),
    index('orders_status_index').on(table.status),
  ],
);

export const orderEvents = sqliteTable(
  'order_events',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id').references(() => users.id),
    eventType: text('event_type').notNull(),
    fromStatus: text('from_status'),
    toStatus: text('to_status'),
    note: text('note').notNull().default(''),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('order_events_order_created_index').on(table.orderId, table.createdAt)],
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: text('product_id'),
    variantId: text('variant_id'),
    productCode: text('product_code').notNull(),
    productName: text('product_name').notNull(),
    sku: text('sku').notNull(),
    color: text('color').notNull(),
    size: text('size').notNull(),
    unitPrice: integer('unit_price').notNull(),
    quantity: integer('quantity').notNull(),
    lineTotal: integer('line_total').notNull(),
  },
  (table) => [index('order_items_order_index').on(table.orderId)],
);

export const pointTransactions = sqliteTable(
  'point_transactions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    orderId: text('order_id'),
    type: text('type', {
      enum: ['earn', 'redeem', 'restore', 'adjust'],
    }).notNull(),
    points: integer('points').notNull(),
    note: text('note').notNull().default(''),
    requestKey: text('request_key'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    index('point_transactions_user_index').on(table.userId),
    uniqueIndex('point_transactions_request_unique').on(table.requestKey),
    uniqueIndex('point_transactions_order_type_unique').on(
      table.orderId,
      table.type,
    ),
  ],
);

export const exchangeRequests = sqliteTable(
  'exchange_requests',
  {
    adminNote: text('admin_note'),
    id: text('id').primaryKey(),
    requestCode: text('request_code').notNull(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    reason: text('reason', {
      enum: ['wrong_size', 'defective', 'wrong_item', 'other'],
    }).notNull(),
    description: text('description').notNull(),
    responsibility: text('responsibility', {
      enum: ['seller', 'customer', 'pending'],
    })
      .notNull()
      .default('pending'),
    status: text('status', {
      enum: [
        'submitted',
        'reviewing',
        'needs_info',
        'approved',
        'rejected',
        'return_shipping',
        'received',
        'shipping',
        'completed',
      ],
    })
      .notNull()
      .default('submitted'),
    requestedAt: integer('requested_at').notNull(),
    reviewedAt: integer('reviewed_at'),
    feeAmount: integer('fee_amount').notNull().default(0),
    feeStatus: text('fee_status', {
      enum: ['not_required', 'awaiting', 'paid'],
    })
      .notNull()
      .default('not_required'),
    returnCondition: text('return_condition', {
      enum: ['pending', 'accepted', 'rejected'],
    })
      .notNull()
      .default('pending'),
    returnedSku: text('returned_sku'),
    restockDecision: text('restock_decision', {
      enum: ['pending', 'restock', 'quarantine'],
    })
      .notNull()
      .default('pending'),
    receivedAt: integer('received_at'),
    shippedAt: integer('shipped_at'),
    completedAt: integer('completed_at'),
  },
  (table) => [
    uniqueIndex('exchange_requests_code_unique').on(table.requestCode),
  ],
);

export const exchangeEvents = sqliteTable(
  'exchange_events',
  {
    id: text('id').primaryKey(),
    exchangeRequestId: text('exchange_request_id')
      .notNull()
      .references(() => exchangeRequests.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id').references(() => users.id),
    eventType: text('event_type').notNull(),
    fromStatus: text('from_status'),
    toStatus: text('to_status'),
    note: text('note').notNull().default(''),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    index('exchange_events_request_created_index').on(
      table.exchangeRequestId,
      table.createdAt,
    ),
  ],
);

export const exchangeItems = sqliteTable(
  'exchange_items',
  {
    id: text('id').primaryKey(),
    exchangeRequestId: text('exchange_request_id')
      .notNull()
      .references(() => exchangeRequests.id, { onDelete: 'cascade' }),
    orderItemId: text('order_item_id')
      .notNull()
      .references(() => orderItems.id),
    replacementSku: text('replacement_sku'),
    quantity: integer('quantity').notNull().default(1),
  },
  (table) => [
    index('exchange_items_request_index').on(table.exchangeRequestId),
  ],
);

export const exchangeEvidence = sqliteTable('exchange_evidence', {
  id: text('id').primaryKey(),
  exchangeRequestId: text('exchange_request_id')
    .notNull()
    .references(() => exchangeRequests.id, { onDelete: 'cascade' }),
  objectKey: text('object_key').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    messageType: text('message_type', {
      enum: ['general', 'order_support', 'cancel_request'],
    })
      .notNull()
      .default('general'),
    orderCode: text('order_code'),
    message: text('message').notNull(),
    status: text('status', { enum: ['new', 'processing', 'resolved'] })
      .notNull()
      .default('new'),
    adminNote: text('admin_note'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('contact_messages_status_index').on(table.status),
    index('contact_messages_created_index').on(table.createdAt),
  ],
);

export const reviews = sqliteTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    rating: integer('rating').notNull(),
    content: text('content').notNull(),
    visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
    adminReply: text('admin_reply'),
    hiddenReason: text('hidden_reason'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('reviews_user_product_unique').on(
      table.userId,
      table.productId,
    ),
    index('reviews_product_index').on(table.productId),
  ],
);
