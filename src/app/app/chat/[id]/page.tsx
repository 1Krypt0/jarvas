import Chat from "@/components/chat";
import Typography from "@/components/ui/typography";
import { getMessages } from "@/db/queries";
import { auth } from "@/lib/auth";
import { hasUserPaid } from "@/lib/stripe";
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

  const hasPaid = await hasUserPaid(session.user.id);

  if (!hasPaid) {
    return (
      <div className="flex justify-center items-center min-w-0 h-full bg-background">
        <Typography variant="h1" className="mx-auto mb-28">
          Set up Billing to Get Started!
        </Typography>
      </div>
    );
  }

  const { id } = await props.params;

  const initialMessages = await getMessages(id);

  return (
    <Chat
      id={id}
      initialMessages={convertToUIMessages(initialMessages)}
      hasPaid={hasPaid}
    />
  );
}
