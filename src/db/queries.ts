import { eq } from "drizzle-orm";
import { db } from ".";
import { message } from "./schema";

export const getMessages = async (chatId: string) => {
  return await db
    .select()
    .from(message)
    .where(eq(message.conversationId, chatId));
};
