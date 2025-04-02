import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v4 as uuid } from "uuid";
import { MarkdownTextSplitter } from "langchain/text_splitter";
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
import {
  FREE_CREDIT_LIMIT,
  getLimits,
  MAX_UPLOAD_SIZE,
  MAX_UPLOADS,
  WARN_USER_LIMIT,
} from "@/lib/constants";
import { warnUserLimit } from "@/lib/email/email";
import logger from "@/lib/logger";
import { env } from "@/env";

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

  for (const file of files) {
    if (file.size > MAX_UPLOAD_SIZE) {
      logger.warn(
        { userId },
        "User attempted to upload file exceeding size limit",
      );
      return new Response("File too large", {
        status: 413,
        statusText: "File too large",
      });
    }
  }

  const transformedFiles: { markdown: string; name: string }[] = [];

  for (let i = 0; i < files.length; i += MAX_UPLOADS) {
    const batch = files.slice(i, i + MAX_UPLOADS);

    const batchBody = new FormData();
    for (const file of batch) {
      batchBody.append("files", file);
    }

    const res = await fetch(`${env.CLOUD_RUN_URL}/convert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUD_RUN_KEY}`,
      },
      body: batchBody,
    });

    if (!res.ok) {
      const { detail } = await res.json();
      logger.error(
        { userId },
        `File conversion to Markdown unsuccessful. Reason: ${detail}`,
      );

      if (detail === "File list too large") {
        logger.warn(
          { userId },
          "User attempted to upload file exceeding size limit",
        );
        return new Response("File too large", {
          status: 413,
          statusText: "File too large",
        });
      } else {
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    const transformedFiletData: { files: string[] } = await res.json();
    transformedFiles.push(
      ...transformedFiletData.files.map((item, idx) => {
        return { name: batch[idx].name, markdown: item };
      }),
    );
  }

  const splitter = new MarkdownTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  let totalChunks = 0;
  const chunkedDocs = await Promise.all(
    transformedFiles.map(async (file) => {
      return {
        name: file.name,
        markdown: file.markdown,
        chunks: await splitter.splitText(file.markdown),
      };
    }),
  );

  for (const file of chunkedDocs) {
    totalChunks += file.chunks.length;
  }

  if (
    session.user.plan === "free" &&
    session.user.creditsUsed + totalChunks >= FREE_CREDIT_LIMIT
  ) {
    logger.warn({ userId }, "User on free plan has hit limit, blocking access");
    return new Response(
      "Upload limit has been reached. Cannot upload this many files",
      { status: 401, statusText: "Limit hit" },
    );
  }

  for (const file of chunkedDocs) {
    await uploadFile(file, userId);
  }

  logger.info({ userId }, "Files Uploaded");

  if (session.user.plan !== "free") {
    await trackSpending(userId, "jarvas_file_uploads", totalChunks.toString());

    logger.info({ userId }, "Tracked spending");

    const limits = getLimits(session.user.plan);
    const pastUsage = session.user.creditsUsed / limits.fileCredits;
    const newUsage =
      (session.user.creditsUsed + totalChunks) / limits.fileCredits;

    if (newUsage >= WARN_USER_LIMIT && pastUsage < WARN_USER_LIMIT) {
      logger.info({ userId }, "User near limits, sending warning");
      await warnUserLimit(
        session.user.email,
        "file",
        Math.round(newUsage * 100),
      );
    }
  }

  return new Response("Files uploaded", { status: 200 });
}

const uploadFile = async (
  file: { name: string; markdown: string; chunks: string[] },
  userId: string,
) => {
  const documentId = uuid();

  await saveFile(
    documentId,
    file.name,
    file.markdown,
    file.chunks.length,
    userId,
  );

  const embeddings = await embedDocuments(file.chunks);

  const vectors: Chunk[] = [];
  for (let i = 0; i < file.chunks.length; i++) {
    const content = file.chunks[i];
    const metadata = {}; // TODO: Add relevant metadata once you know what it looks like
    const embedding = embeddings[i];

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
