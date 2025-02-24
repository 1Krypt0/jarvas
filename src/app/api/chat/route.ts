import {
  deleteChat,
  getChatById,
  saveChat,
  saveMessages,
  updateChatName,
} from "@/db/queries";
import { auth } from "@/lib/auth";
import { findRelevantContent } from "@/lib/rag";
import { trackSpending } from "@/lib/stripe";
import {
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import { Message, smoothStream, streamText, tool } from "ai";
import { headers } from "next/headers";
import { v4 as uuid } from "uuid";
import { z } from "zod";

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
    maxSteps: 3,
    system: `Your name is Jarvas, and you are an AI assistant for Atomic Labs. 
    Check your knowledge base if it is necessary to answer the question.
    Only respond to questions using information from tool calls. Always cite your sources.
    If no relevant information is found in the tool calls,
    tell the user that you could not find any relevant information for his question`,
    experimental_transform: smoothStream({ chunking: "word" }),
    experimental_generateMessageId: uuid,
    tools: {
      getInformation: tool({
        description:
          "Gather information from your knowledge base to answer questions",
        parameters: z.object({
          query: z.string().describe("The users query"),
        }),
        execute: async ({ query }) => findRelevantContent(query),
      }),
    },

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
        await trackSpending(session.user.id, "jarvas_chat_messages", "1");
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

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("id");
  const { newName } = await req.json();

  if (!chatId) {
    return new Response("No chat found with that id", { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chat = await getChatById(chatId);

  if (chat && chat.userId !== session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await updateChatName(chatId, newName);

  return new Response("Chat name updated", { status: 200 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("id");

  if (!chatId) {
    return new Response("No chat found with that id", { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chat = await getChatById(chatId);

  if (chat && chat.userId !== session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await deleteChat(chatId);

  return new Response("Chat deleted", { status: 200 });
}
