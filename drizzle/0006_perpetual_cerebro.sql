CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cart_items_user_variant_unique` ON `cart_items` (`user_id`,`variant_id`);--> statement-breakpoint
CREATE INDEX `cart_items_user_index` ON `cart_items` (`user_id`);--> statement-breakpoint
CREATE TABLE `exchange_events` (
	`id` text PRIMARY KEY NOT NULL,
	`exchange_request_id` text NOT NULL,
	`actor_user_id` text,
	`event_type` text NOT NULL,
	`from_status` text,
	`to_status` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`exchange_request_id`) REFERENCES `exchange_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exchange_events_request_created_index` ON `exchange_events` (`exchange_request_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `order_events` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`actor_user_id` text,
	`event_type` text NOT NULL,
	`from_status` text,
	`to_status` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_events_order_created_index` ON `order_events` (`order_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`actor_user_id` text,
	`type` text NOT NULL,
	`quantity_delta` integer NOT NULL,
	`stock_before` integer NOT NULL,
	`stock_after` integer NOT NULL,
	`reason` text NOT NULL,
	`reference_type` text,
	`reference_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stock_movements_variant_created_index` ON `stock_movements` (`variant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `stock_movements_reference_index` ON `stock_movements` (`reference_type`,`reference_id`);--> statement-breakpoint
ALTER TABLE `exchange_requests` ADD `fee_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `exchange_requests` ADD `fee_status` text DEFAULT 'not_required' NOT NULL;--> statement-breakpoint
ALTER TABLE `exchange_requests` ADD `return_condition` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `exchange_requests` ADD `returned_sku` text;--> statement-breakpoint
ALTER TABLE `exchange_requests` ADD `restock_decision` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `exchange_requests` ADD `received_at` integer;--> statement-breakpoint
ALTER TABLE `exchange_requests` ADD `shipped_at` integer;