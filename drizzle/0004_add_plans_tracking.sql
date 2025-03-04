ALTER TABLE "user" ADD COLUMN "plan" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "pages_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "messages_used" integer DEFAULT 0 NOT NULL;