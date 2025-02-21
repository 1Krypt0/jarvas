ALTER TABLE "message" RENAME COLUMN "conversation_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_conversation_id_chat_id_fk";
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE cascade;