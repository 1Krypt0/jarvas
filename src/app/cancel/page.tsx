import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";

export default async function CheckoutSuccessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  return redirect("/dashboard");
}
