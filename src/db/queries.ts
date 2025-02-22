import { eq } from "drizzle-orm";
import { db } from ".";
import { message, chat, type Message, file, chunk, Chunk } from "./schema";

export const getMessages = async (chatId: string) => {
  return await db.select().from(message).where(eq(message.chatId, chatId));
};

export const getChats = async (userId: string) => {
  return await db
    .select()
    .from(chat)
    .where(eq(chat.userId, userId))
    .orderBy(chat.createdAt);
};

export const getChatById = async (chatId: string) => {
  const res = await db.select().from(chat).where(eq(chat.id, chatId));
  if (res.length === 0) {
    return null;
  }
  return res[0];
};

export const saveChat = async (id: string, title: string, userId: string) => {
  await db.insert(chat).values({
    id,
    title,
    userId,
  });
};

export const saveMessages = async (messages: Message[]) => {
  await db.insert(message).values(messages);
};

export const deleteChat = async (chatId: string) => {
  await db.delete(chat).where(eq(chat.id, chatId));
};

export const updateChatName = async (chatId: string, newName: string) => {
  await db.update(chat).set({ title: newName }).where(eq(chat.id, chatId));
};

export const saveFile = async (
  id: string,
  name: string,
  content: string,
  userId: string,
) => {
  await db.insert(file).values({ id, name, content, userId });
};

export const saveChunks = async (chunks: Chunk[]) => {
  await db.insert(chunk).values(chunks);
};
