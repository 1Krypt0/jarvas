import Chat from "@/components/chat";
import { getMessages } from "@/db/queries";
import { auth } from "@/lib/auth";
import { convertToUIMessages } from "@/lib/utils";
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

  const initialMessages = await getMessages(id);

  return (
    <Chat id={id} initialMessages={convertToUIMessages(initialMessages)} />
  );
}
