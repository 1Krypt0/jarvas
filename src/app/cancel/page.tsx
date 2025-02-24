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

  const res = await auth.api.deleteUser({
    body: { callbackURL: "/register" },
    headers: await headers(),
  });

  if (!res.success) {
    console.error("Error deleting user:", res.message);
  }

  return redirect("/register");
}
