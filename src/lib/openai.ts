import { openai } from "@ai-sdk/openai";
import { embedMany, embed } from "ai";

const embeddingModel = openai.embedding("text-embedding-3-small");

export const embedDocuments = async (documents: string[]) => {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: documents,
  });
  return embeddings;
};

export const embedQuery = async (query: string) => {
  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  return embedding;
};
