import { Document } from "@langchain/core/documents";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

const chatModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

const embeddingModel = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-small",
});

export const embedDocuments = async (documents: Document[]) => {
  const texts = documents.map((doc) => doc.pageContent);
  const vectors = await embeddingModel.embedDocuments(texts);
  return vectors;
};
