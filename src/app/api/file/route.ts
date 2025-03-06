import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v4 as uuid } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  saveChunks,
  saveFile,
  getDocumentById,
  updateFileName,
  deleteFile,
} from "@/db/queries";
import { embedDocuments } from "@/lib/openai";
import { Chunk } from "@/db/schema";
import { hasUserPaid, trackSpending } from "@/lib/stripe";
import { FREE_PAGE_LIMIT } from "@/lib/constants";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hasPaid = await hasUserPaid(session.user.id);

  if (!hasPaid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await req.formData();
  const files = data.getAll("files") as File[];

  for (let i = 0; i < files.length; i++) {
    if (files[i].type !== "application/pdf") {
      return new Response("Only PDF files are allowed", { status: 415 });
    }
  }

  if (session.user.plan === "free") {
    let totalPages = 0;
    for (let i = 0; i < files.length; i++) {
      const loader = new PDFLoader(files[i], {
        splitPages: false,
      });

      const doc = await loader.load();

      totalPages += doc[0].metadata.pdf.totalPages;
    }

    if (session.user.pagesUsed + totalPages >= FREE_PAGE_LIMIT) {
      return new Response(
        "Upload limit has been reached. Cannot upload this many pages",
        { status: 401, statusText: "Limit hit" },
      );
    }
  }

  for (let i = 0; i < files.length; i++) {
    await uploadFile(
      files[i],
      session.user.id,
      session.user.plan as "free" | "starter" | "pro" | "enterprise",
    );
  }

  return new Response("File uploaded", { status: 200 });
}

const uploadFile = async (
  file: File,
  userId: string,
  plan: "free" | "starter" | "pro" | "enterprise",
) => {
  const documentId = uuid();
  const fileName = file.name.split(".")[0];

  const loader = new PDFLoader(file, {
    splitPages: false,
  });

  const doc = await loader.load();

  const pages = doc[0].metadata.pdf.totalPages as number;

  await saveFile(documentId, fileName, doc[0].pageContent, pages, userId);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(doc);

  const embeddings = await embedDocuments(
    chunks.map((chunk) => chunk.pageContent),
  );

  const vectors: Chunk[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i].pageContent;
    const metadata = { ...chunks[i].metadata.pdf.info };
    const embedding = embeddings[i];

    delete metadata["Trapped"];

    vectors.push({
      id: uuid(),
      content,
      metadata,
      documentId,
      embedding,
      userId,
    });
  }

  await saveChunks(vectors);

  if (plan !== "free") {
    await trackSpending(userId, "jarvas_file_uploads", pages.toString());
  }
};

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");
  const { newName } = await req.json();

  if (!fileId) {
    return new Response("No file found with that id", { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const file = await getDocumentById(fileId);

  if (file && file.userId !== session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hasPaid = await hasUserPaid(session.user.id);

  if (!hasPaid) {
    return new Response("Unauthorized", { status: 401 });
  }

  await updateFileName(fileId, newName);

  return new Response("File name updated", { status: 200 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");

  if (!fileId) {
    return new Response("No file found with that id", { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const file = await getDocumentById(fileId);

  if (file && file.userId !== session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hasPaid = await hasUserPaid(session.user.id);

  if (!hasPaid) {
    return new Response("Unauthorized", { status: 401 });
  }

  await deleteFile(fileId);

  return new Response("File deleted", { status: 200 });
}
