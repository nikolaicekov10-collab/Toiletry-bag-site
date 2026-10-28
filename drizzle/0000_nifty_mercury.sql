CREATE TABLE `daily_traffic` (
	`day` text PRIMARY KEY NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`unique_visitors` integer DEFAULT 0 NOT NULL,
	`enquiries` integer DEFAULT 0 NOT NULL,
	`orders` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_visitors` (
	`day` text NOT NULL,
	`visitor_id` text NOT NULL,
	PRIMARY KEY(`day`, `visitor_id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`message` text NOT NULL,
	`product` text,
	`created_at` text NOT NULL
);
