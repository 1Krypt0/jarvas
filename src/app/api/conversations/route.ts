import { getChats } from "@/db/queries";
import { auth } from "@/lib/auth";
import { hasUserPaid } from "@/lib/stripe";
import { headers } from "next/headers";

export async function GET() {
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

  const conversations = await getChats(session.user.id);

  return Response.json(conversations);
}
