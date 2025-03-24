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
import { FREE_PAGE_LIMIT, getLimits, WARN_USER_LIMIT } from "@/lib/constants";
import { warnUserLimit } from "@/lib/email/email";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    logger.warn(
      { ip: req.headers.get("x-forwarded-for") },
      "Unauthorized access attempt",
    );
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const hasPaid = await hasUserPaid(userId);

  if (!hasPaid) {
    logger.warn({ userId }, "User has not paid, blocking access");
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await req.formData();
  const files = data.getAll("files") as File[];

  for (let i = 0; i < files.length; i++) {
    if (files[i].type !== "application/pdf") {
      logger.warn({ userId }, "User attempted upload of non-PDF file");
      return new Response("Only PDF files are allowed", { status: 415 });
    }
  }

  let totalPages = 0;
  for (let i = 0; i < files.length; i++) {
    const loader = new PDFLoader(files[i], {
      splitPages: false,
    });

    const doc = await loader.load();

    totalPages += doc[0].metadata.pdf.totalPages;
  }

  if (
    session.user.plan === "free" &&
    session.user.pagesUsed + totalPages >= FREE_PAGE_LIMIT
  ) {
    logger.warn({ userId }, "User on free plan has hit limit, blocking access");
    return new Response(
      "Upload limit has been reached. Cannot upload this many pages",
      { status: 401, statusText: "Limit hit" },
    );
  }

  for (let i = 0; i < files.length; i++) {
    await uploadFile(files[i], userId);
  }

  logger.info({ userId }, "Files Uploaded");

  if (session.user.plan !== "free") {
    await trackSpending(userId, "jarvas_page_uploads", totalPages.toString());

    logger.info({ userId }, "Tracked spending");

    const limits = getLimits(session.user.plan);
    const pastUsage = session.user.pagesUsed / limits.pageUploads;
    const newUsage = (session.user.pagesUsed + totalPages) / limits.pageUploads;

    if (newUsage >= WARN_USER_LIMIT && pastUsage < WARN_USER_LIMIT) {
      logger.info({ userId }, "User near limits, sending warning");
      await warnUserLimit(
        session.user.email,
        "page",
        Math.round(newUsage * 100),
      );
    }
  }

  return new Response("File uploaded", { status: 200 });
}

const uploadFile = async (file: File, userId: string) => {
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
};

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");
  const { newName } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    logger.warn(
      { ip: req.headers.get("x-forwarded-for") },
      "Unauthorized access attempt",
    );
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  if (!fileId) {
    logger.warn({ userId }, "FileId not specified in request");
    return new Response("FileId not specified", { status: 400 });
  }

  const file = await getDocumentById(fileId);

  if (!file) {
    logger.warn({ userId }, "Attempted to access non-existant file");
    return new Response("Unauthorized", { status: 401 });
  }

  if (file.userId !== userId) {
    logger.warn({ userId }, "Attempted to access file not belonging to user");
    return new Response("Unauthorized", { status: 401 });
  }

  const hasPaid = await hasUserPaid(userId);

  if (!hasPaid) {
    logger.warn({ userId }, "User has not paid, blocking access");
    return new Response("Unauthorized", { status: 401 });
  }

  await updateFileName(fileId, newName);

  logger.info({ userId }, "File name updated");

  return new Response("File name updated", { status: 200 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    logger.warn(
      { ip: req.headers.get("x-forwarded-for") },
      "Unauthorized access attempt",
    );
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  if (!fileId) {
    logger.warn({ userId }, "FileId not specified in request");
    return new Response("FileId not specified", { status: 400 });
  }

  const file = await getDocumentById(fileId);

  if (!file) {
    logger.warn({ userId }, "Attempted to access non-existant file");
    return new Response("Unauthorized", { status: 401 });
  }

  if (file.userId !== userId) {
    logger.warn({ userId }, "Attempted to access file not belonging to user");
    return new Response("Unauthorized", { status: 401 });
  }

  const hasPaid = await hasUserPaid(userId);

  if (!hasPaid) {
    logger.warn({ userId }, "User has not paid, blocking access");
    return new Response("Unauthorized", { status: 401 });
  }

  await deleteFile(fileId);

  logger.info({ userId }, "File Deleted");

  return new Response("File deleted", { status: 200 });
}
