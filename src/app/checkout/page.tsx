import { auth } from "@/lib/auth";
import { redis } from "@/lib/kv";
import { syncStripeDataToKV } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";

export default async function CheckoutSuccessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const userId = session.user.id;
  const stripeCustomerId = (await redis.get(`stripe:user:${userId}`)) as string;

  await syncStripeDataToKV(stripeCustomerId);

  return redirect("/app");
}
