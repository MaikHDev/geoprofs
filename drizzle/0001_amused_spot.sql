DROP INDEX `name_idx`;--> statement-breakpoint
CREATE INDEX `post_name_idx` ON `post` (`name`);--> statement-breakpoint
DROP INDEX `email_idx`;--> statement-breakpoint
CREATE INDEX `user_name_idx` ON `user` (`name`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);