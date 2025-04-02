CREATE TYPE "public"."plan" AS ENUM('free', 'starter', 'pro', 'enterprise');--> statement-breakpoint
ALTER TABLE "file" RENAME COLUMN "pages" TO "chunks";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "pages_used" TO "credits_used";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "messages_used" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "messages_used" DROP NOT NULL;