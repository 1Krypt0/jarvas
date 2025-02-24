import { findSimilarDocs } from "@/db/queries";
import { embedQuery } from "./openai";

export const findRelevantContent = async (query: string) => {
  console.log("Calling find relevant content with query");
  console.log(query);
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
