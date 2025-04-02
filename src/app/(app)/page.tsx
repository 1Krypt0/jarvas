import Chat from "@/components/chat";
import Typography from "@/components/ui/typography";
import { auth } from "@/lib/auth";
import { hasUserPaid } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuid } from "uuid";

export default async function AppPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const hasPaid = await hasUserPaid(session.user.id);

  const id = uuid();

  if (!hasPaid) {
    return (
      <div className="flex justify-center items-center min-w-0 h-full bg-background">
        <Typography variant="h1" className="mx-auto mb-28">
          Configure Your Subscription and Get Started!
        </Typography>
      </div>
    );
  }

  return <Chat id={id} initialMessages={[]} />;
}
