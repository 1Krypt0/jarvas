import { findSimilarDocs } from "@/db/queries";
import { embedQuery } from "./openai";

export const findRelevantContent = async (query: string) => {
  const queryEmbedding = await embedQuery(query);

  const similarChunks = await findSimilarDocs(queryEmbedding);

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
