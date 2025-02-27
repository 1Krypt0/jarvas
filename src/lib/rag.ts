import { findSimilarDocs } from "@/db/queries";
import { embedQuery } from "./openai";

export const findRelevantContent = async (query: string, userId: string) => {
  const queryEmbedding = await embedQuery(query);

  const similarChunks = await findSimilarDocs(queryEmbedding, userId);

  return similarChunks.map((chunk) => {
    return {
      content: chunk.content,
      metadata: {
        similarity: chunk.similarity,
        documentId: chunk.documentId,
      },
    };
  });
};
