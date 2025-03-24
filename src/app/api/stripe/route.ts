import { updateUserPlan } from "@/db/queries";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/kv";
import logger from "@/lib/logger";
import {
  getStripeSubscriptionId,
  stripe,
  stripeRedirectURL,
  StripeSubCache,
  syncStripeDataToKV,
} from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// NOTE: There are 3 paths inside this route.
// 1 - User moving from free to any paid tier -> has no subscription status
// 2 - User moving from paid to free tier -> cancel and remove current subscription status
// 3 - User moving from paid to paid subscription -> Change subscription type
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const newPlanId = searchParams.get("plan") as
    | "free"
    | "starter"
    | "pro"
    | "enterprise";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    logger.warn(
      { ip: req.headers.get("x-forwarded-for") },
      "Unauthorized access attempt",
    );
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  if (!newPlanId) {
    logger.warn({ userId }, "ChatId not specified in request");
    return new Response("Missing new Plan", { status: 404 });
  }

  const newSubscriptionData = getStripeSubscriptionId(newPlanId);

  if (!newSubscriptionData) {
    logger.warn({ userId }, "Attempted to access non-existant subscription");
    return new Response("Unauthorized", { status: 401 });
  }

  const stripeCustomerId = (await redis.get(`stripe:user:${userId}`)) as
    | string
    | null;

  if (!stripeCustomerId) {
    logger.warn({ userId }, "Stripe Customer Id not found for user");
    return new Response("Unauthorized", { status: 401 });
  }

  const currentSubscriptionStatus = (await redis.get(
    `stripe:customer:${stripeCustomerId}`,
  )) as StripeSubCache;

  // NOTE: Option 1: Free to Paid Tier
  if (
    !currentSubscriptionStatus ||
    currentSubscriptionStatus.status === "none"
  ) {
    logger.info(
      { userId },
      "No subscription found, moving from free to paid tier",
    );

    const checkoutId = await createSubscription(
      stripeCustomerId,
      newSubscriptionData,
      newPlanId,
    );

    if (!checkoutId) {
      logger.error({ userId }, "Error creating subscription");
      return NextResponse.json(
        { message: "Error creating checkout session" },
        { status: 500 },
      );
    }

    logger.info("Checkout session created");

    return NextResponse.json({ id: checkoutId });
  }

  if (currentSubscriptionStatus.status !== "active") {
    return new Response("You must first resolve your current subscription", {
      status: 401,
      statusText: "Unresolved Subscription",
    });
  }

  // NOTE: Option 2: Paid to Free Tier
  if (newPlanId === "free") {
    logger.info({ userId }, "Moving user to free tier");

    const res = await stripe.subscriptions.cancel(
      currentSubscriptionStatus.subscriptionId!,
    );

    if (res.status !== "canceled") {
      return new Response("Subscription was not cancelled properly", {
        status: 500,
      });
    }

    await redis.del(`stripe:customer:${stripeCustomerId}`);

    await updateUserPlan(userId, newPlanId);

    logger.info({ userId }, "Current subscription cancelled");

    return new Response("Plan changed successfully", { status: 200 });
  }

  // NOTE: Option 3: Paid to Paid Tier
  logger.info({ userId }, "Switching users subscription");

  await moveBetweenPaidPlans(
    currentSubscriptionStatus,
    newSubscriptionData,
    userId,
    newPlanId,
  );

  logger.info({ userId }, "Plan changed successfully");

  return new Response("Plan changed successfully", { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) {
    logger.warn("Received Stripe Webhook without signature");
    return NextResponse.json({}, { status: 400 });
  }

  try {
    if (typeof signature !== "string") {
      logger.error("Signature was not a string");
      throw new Error("[STRIPE HOOK] Header isn't a string???");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    await processEvent(event);
  } catch (error) {
    logger.error({ error }, "Error processing Stripe Webhook");
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

const createSubscription = async (
  stripeCustomerId: string,
  newSubscriptionData: { subId: string; pageId: string; msgId: string },
  newPlanId: string,
) => {
  const checkout = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,

    line_items: [
      {
        price: newSubscriptionData.subId,
        quantity: 1,
      },
      {
        price: newSubscriptionData.pageId,
      },
      {
        price: newSubscriptionData.msgId,
      },
    ],
    mode: "subscription",
    success_url: `${stripeRedirectURL}/checkout?newPlan=${newPlanId}`,
    cancel_url: `${stripeRedirectURL}/cancel`,
  });

  return checkout.id;
};

const moveBetweenPaidPlans = async (
  currentSubscriptionStatus: StripeSubCache,
  newSubscriptionData: { subId: string; pageId: string; msgId: string },
  userId: string,
  newPlanId: "free" | "starter" | "pro" | "enterprise",
) => {
  if (currentSubscriptionStatus.status === "none") return;

  const currentSubscription = await stripe.subscriptions.retrieve(
    currentSubscriptionStatus.subscriptionId!,
  );

  const newItems = currentSubscription.items.data.map((item) => {
    switch (item.price.id) {
      case env.STRIPE_STARTER_SUBSCRIPTION_ID:
      case env.STRIPE_PRO_SUBSCRIPTION_ID:
      case env.STRIPE_ENTERPRISE_SUBSCRIPTION_ID:
        return { id: item.id, price: newSubscriptionData.subId };
      case env.STRIPE_STARTER_PAGE_ID:
      case env.STRIPE_PRO_PAGE_ID:
      case env.STRIPE_ENTERPRISE_PAGE_ID:
        return { id: item.id, price: newSubscriptionData.pageId };
      case env.STRIPE_STARTER_MSG_ID:
      case env.STRIPE_PRO_MSG_ID:
      case env.STRIPE_ENTERPRISE_MSG_ID:
        return { id: item.id, price: newSubscriptionData.msgId };
      default:
        return { id: item.id };
    }
  });

  await stripe.subscriptions.update(currentSubscriptionStatus.subscriptionId!, {
    items: newItems,
  });

  await updateUserPlan(userId, newPlanId);
};
