import UserCard from "./user-card";
import UsageDisplay from "./usage-display";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { hasUserPaid } from "@/lib/stripe";
import { Session } from "@/lib/auth-client";
import {
  ENTERPRISE_PAGE_LIMIT,
  FREE_MSG_LIMIT,
  FREE_PAGE_LIMIT,
  PRO_MSG_LIMIT,
  PRO_PAGE_LIMIT,
  STARTER_MSG_LIMIT,
  STARTER_PAGE_LIMIT,
} from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const hasPaid = await hasUserPaid(session.user.id);

  const getLimits = (
    session: Session,
  ): { pageUploads: number; messages: number | null } => {
    switch (session.user.plan) {
      case "free":
        return { pageUploads: FREE_PAGE_LIMIT, messages: FREE_MSG_LIMIT };
      case "starter":
        return { pageUploads: STARTER_PAGE_LIMIT, messages: STARTER_MSG_LIMIT };
      case "pro":
        return { pageUploads: PRO_PAGE_LIMIT, messages: PRO_MSG_LIMIT };
      case "enterprise":
        return { pageUploads: ENTERPRISE_PAGE_LIMIT, messages: null };
      default:
        return { pageUploads: FREE_PAGE_LIMIT, messages: FREE_MSG_LIMIT };
    }
  };

  const limits = getLimits(session);
  const pagesUsed = session.user.pagesUsed;
  const messages = session.user.messagesUsed;

  return (
    <div className="flex w-full mt-20 justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-lg w-full">
        <header>
          <Link href="/app" className="flex gap-2">
            <ArrowLeft size={24} />
            <span>Voltar</span>
          </Link>
        </header>
        <UserCard session={session} hasPaid={hasPaid} />
        <UsageDisplay
          pageUploads={{ used: pagesUsed, limit: limits.pageUploads }}
          messages={{ used: messages, limit: limits.messages }}
        />
      </div>
    </div>
  );
}
