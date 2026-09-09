CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_messages_status_index` ON `contact_messages` (`status`);--> statement-breakpoint
CREATE INDEX `contact_messages_created_index` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`rating` integer NOT NULL,
	`content` text NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`admin_reply` text,
	`hidden_reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_user_product_unique` ON `reviews` (`user_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `reviews_product_index` ON `reviews` (`product_id`);--> statement-breakpoint
ALTER TABLE `orders` ADD `request_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
ALTER TABLE `point_transactions` ADD `request_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `point_transactions_request_unique` ON `point_transactions` (`request_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `point_transactions_order_type_unique` ON `point_transactions` (`order_id`,`type`);--> statement-breakpoint
ALTER TABLE `product_variants` ADD `reserved_stock` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `gender` text DEFAULT 'unisex' NOT NULL;--> statement-breakpoint
PRAGMA optimize;
