import { env } from "@/env";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/kv";
import { stripe, stripeRedirectURL, syncStripeDataToKV } from "@/lib/stripe";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  let stripeCustomerId = (await redis.get(`stripe:user:${userId}`)) as string;

  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId: userId,
      },
    });

    await redis.set(`stripe:user:${userId}`, newCustomer.id);
    stripeCustomerId = newCustomer.id;
  }

  const checkout = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price: env.STRIPE_JARVAS_SUBSCRIPTION_ID,
        quantity: 1,
      },
      {
        price: env.STRIPE_FILES_SUBSCRIPTION_ID,
      },
      {
        price: env.STRIPE_CHAT_SUBSCRIPTION_ID,
      },
    ],
    mode: "subscription",
    success_url: `${stripeRedirectURL}/checkout`,
    cancel_url: `${stripeRedirectURL}/register`,
  });

  if (!checkout.id) {
    return;
  }

  return NextResponse.json({ id: checkout.id });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) return NextResponse.json({}, { status: 400 });

  try {
    if (typeof signature !== "string") {
      throw new Error("[STRIPE HOOK] Header isn't a string???");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    await processEvent(event);
  } catch (error) {
    console.error("[STRIPE HOOK] Error processing event", error);
  }

  return NextResponse.json({ received: true });
}

const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

const processEvent = async (event: Stripe.Event) => {
  if (!allowedEvents.includes(event.type)) return;

  const { customer: customerId } = event?.data?.object as {
    customer: string;
  };

  if (typeof customerId !== "string") {
    throw new Error(
      `[STRIPE HOOK][CANCER] ID isn't string.\nEvent type: ${event.type}`,
    );
  }

  return await syncStripeDataToKV(customerId);
};
