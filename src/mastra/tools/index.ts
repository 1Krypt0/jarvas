import { findRelevantContent } from "@/lib/rag";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getInformation = (userId: string) => {
  return createTool({
    id: "get-information",
    description:
      "Retrieve information from an external knowledge base with potentially useful documentation that can aid in responding",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The that which will be matched against the knowledge base for similar documents",
        ),
    }),
    execute: async ({ context }) => findRelevantContent(context.query, userId),
  });
};
