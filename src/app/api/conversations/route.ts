import { getChats } from "@/db/queries";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { hasUserPaid } from "@/lib/stripe";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    logger.warn(
      { ip: req.headers.get("x-forwarded-for") },
      "Unauthorized access attempt",
    );
    return Response.json([]);
  }

  const userId = session.user.id;

  const hasPaid = await hasUserPaid(userId);

  if (!hasPaid) {
    logger.warn({ userId }, "User has not paid, blocking access");
    return Response.json([]);
  }

  const conversations = await getChats(userId);

  logger.info({ userId }, "Fetched chats");

  return Response.json(conversations);
}
