import { getChatById, saveChat, saveMessages } from "@/db/queries";
import { auth } from "@/lib/auth";
import {
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import { Message, smoothStream, streamText } from "ai";
import { headers } from "next/headers";
import { v4 as uuid } from "uuid";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { id, messages }: { id: string; messages: Message[] } =
    await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = await getChatById(id);

  if (!chat) {
    const title = userMessage.content.substring(0, 80);
    await saveChat(id, title, session.user.id);
  }

  await saveMessages([{ ...userMessage, createdAt: new Date(), chatId: id }]);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system: "Your name is Jarvas, and you are an AI assistant for Atomic Labs.",
    experimental_transform: smoothStream({ chunking: "word" }),
    experimental_generateMessageId: uuid,

    onFinish: async ({ response, reasoning }) => {
      try {
        const sanitizedResponseMessages = sanitizeResponseMessages({
          messages: response.messages,
          reasoning,
        });

        await saveMessages(
          sanitizedResponseMessages.map((message) => {
            return {
              id: message.id,
              chatId: id,
              role: message.role,
              content: message.content,
              createdAt: new Date(),
            };
          }),
        );
      } catch (error) {
        console.error("Failed to save chat");
        console.error(error);
      }
    },
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
