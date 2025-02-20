import Chat from "@/components/chat";
import { auth } from "@/lib/auth";
import { Message } from "ai";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export default async function ChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }
  const { id } = await props.params;

  // TODO: Fetch from DB
  const initialMessages: Message[] = [];

  return <Chat id={id} initialMessages={initialMessages} />;
}
