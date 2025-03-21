import { updateUserPlan } from "@/db/queries";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/kv";
import { syncStripeDataToKV } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const userId = session.user.id;
  const stripeCustomerId = (await redis.get(`stripe:user:${userId}`)) as string;

  const params = await searchParams;

  const newPlanId = params["newPlan"] as
    | "free"
    | "starter"
    | "pro"
    | "enterprise";

  if (newPlanId) {
    await syncStripeDataToKV(stripeCustomerId);
    await updateUserPlan(session.user.id, newPlanId);
  }

  return redirect("/");
}
