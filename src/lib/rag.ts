import { findSimilarDocs, getDocumentById } from "@/db/queries";
import { embedQuery } from "./openai";

export const findRelevantContent = async (query: string, userId: string) => {
  console.log(`Searched for information using query: ${query}`);
  const queryEmbedding = await embedQuery(query);

  const similarChunks = await findSimilarDocs(queryEmbedding, userId);

  const uniqueDocIds = [
    ...new Set(similarChunks.map((chunk) => chunk.documentId ?? "")),
  ];

  const documentTitlesMap: Record<string, string> = Object.fromEntries(
    await Promise.all(
      uniqueDocIds.map(async (docId) => {
        const doc = await getDocumentById(docId);
        return [docId, doc?.name];
      }),
    ),
  );

  return similarChunks.map((chunk) => {
    return {
      content: chunk.content,
      metadata: {
        similarity: chunk.similarity,
        documentId: chunk.documentId,
        documentName: documentTitlesMap[chunk.documentId ?? ""],
      },
    };
  });
};
