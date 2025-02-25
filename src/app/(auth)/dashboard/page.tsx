import { auth } from "@/lib/auth";
import UserCard from "./user-card";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { hasUserPaid } from "@/lib/stripe";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const hasPaid = await hasUserPaid(session.user.id);

  return (
    <div className="flex w-full mt-20 justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-lg w-full">
        <UserCard session={session} hasPaid={hasPaid} />
      </div>
    </div>
  );
}
