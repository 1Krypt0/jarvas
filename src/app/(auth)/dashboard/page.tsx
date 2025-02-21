import { auth } from "@/lib/auth";
import UserCard from "./user-card";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  return (
    <div className="flex w-full mt-20 justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-lg w-full">
        <UserCard session={session} />
      </div>
    </div>
  );
}
