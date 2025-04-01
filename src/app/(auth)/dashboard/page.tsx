import UserCard from "./user-card";
import UsageDisplay from "./usage-display";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { hasUserPaid } from "@/lib/stripe";
import { getLimits } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BillingCard from "./billing-card";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const hasPaid = await hasUserPaid(session.user.id);

  const limits = getLimits(session.user.plan);
  const creditsUsed = session.user.creditsUsed;
  const messages = session.user.messagesUsed;

  return (
    <div className="flex w-full my-8 justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-4xl w-full">
        <header>
          <Link href="/" className="flex gap-2">
            <ArrowLeft size={24} />
            <span>Voltar</span>
          </Link>
        </header>
        <UserCard session={session} />
        <BillingCard session={session} hasPaid={hasPaid} />
        <UsageDisplay
          fileCredits={{ used: creditsUsed, limit: limits.fileCredits }}
          messages={{ used: messages, limit: limits.messages }}
        />
      </div>
    </div>
  );
}
