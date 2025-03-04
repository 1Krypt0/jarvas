import { updateUserPlan } from "@/db/queries";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/kv";
import {
  getStripeSubscriptionId,
  stripe,
  stripeRedirectURL,
  StripeSubCache,
  syncStripeDataToKV,
} from "@/lib/stripe";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const newPlanId = searchParams.get("plan") as
    | "free"
    | "starter"
    | "pro"
    | "enterprise";

  if (!newPlanId) {
    return NextResponse.json({ message: "Missing new Plan" }, { status: 404 });
  }

  const newSubscriptionData = getStripeSubscriptionId(newPlanId);

  const stripeCustomerId = (await redis.get(`stripe:user:${userId}`)) as string;

  const currentSubscriptionStatus = (await redis.get(
    `stripe:customer:${stripeCustomerId}`,
  )) as StripeSubCache;

  if (
    currentSubscriptionStatus &&
    currentSubscriptionStatus.status !== "active"
  ) {
    return NextResponse.json(
      { message: "You must first resolve your current subscription" },
      {
        status: 401,
        statusText: "Unresolved Subscription",
      },
    );
  }

  // NOTE: User was on free tier and is upgrading to a paid one
  if (!currentSubscriptionStatus) {
    const checkoutId = await createSubscription(
      stripeCustomerId,
      newSubscriptionData,
      newPlanId,
    );

    if (!checkoutId) {
      return NextResponse.json(
        { message: "Error creating checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: checkoutId });
  }

  if (newPlanId === "free") {
    await cancelCurrentSubscription(
      currentSubscriptionStatus,
      stripeCustomerId,
      userId,
      newPlanId,
    );
    return NextResponse.json({ message: "Plan changed successfully" });
  }

  await moveBetweenPaidPlans(
    currentSubscriptionStatus,
    newSubscriptionData,
    userId,
    newPlanId,
  );

  return NextResponse.json({ message: "Plan changed successfully" });
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

const cancelCurrentSubscription = async (
  currentSubscription: StripeSubCache,
  stripeCustomerId: string,
  userId: string,
  newPlanId: "free" | "starter" | "pro" | "enterprise",
) => {
  if (currentSubscription.status !== "none") {
    const res = await stripe.subscriptions.cancel(
      currentSubscription.subscriptionId!,
    );

    if (res.status !== "canceled") {
      return NextResponse.json(
        { message: "Subscription was not cancelled properly" },
        {
          status: 500,
        },
      );
    }

    await redis.del(`stripe:customer:${stripeCustomerId}`);

    await updateUserPlan(userId, newPlanId);
  }
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
