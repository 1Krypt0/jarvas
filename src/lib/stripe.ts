import Stripe from "stripe";
import { redis } from "./kv";
import { env } from "@/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export const stripeRedirectURL = env.STRIPE_REDIRECT_BASE_URL;

export type StripeSubCache =
  | {
      subscriptionId: string | null;
      status: Stripe.Subscription.Status;
      priceId: string | null;
      currentPeriodStart: number | null;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      paymentMethod: {
        brand: string | null; // e.g., "visa", "mastercard"
        last4: string | null; // e.g., "4242"
      } | null;
    }
  | {
      status: "none";
    };

export const syncStripeDataToKV = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    const subData = { status: "none" };
    await redis.set(`stripe:customer:${customerId}`, subData);
    return subData;
  }

  const subscription = subscriptions.data[0];

  const subData: StripeSubCache = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    currentPeriodEnd: subscription.current_period_end,
    currentPeriodStart: subscription.current_period_start,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethod:
      subscription.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
  };

  // Store the data in your KV
  await redis.set(`stripe:customer:${customerId}`, subData);

  return subData;
};

export const hasUserPaid = async (userId: string) => {
  const stripeCustomerId = (await redis.get(`stripe:user:${userId}`)) as string;

  const stripeStatus = (await redis.get(
    `stripe:customer:${stripeCustomerId}`,
  )) as StripeSubCache;

  if (!stripeStatus) return true;

  return stripeStatus.status === "active";
};

export const trackSpending = async (
  userId: string,
  eventName: string,
  value: string,
) => {
  const stripeCustomerId = (await redis.get(`stripe:user:${userId}`)) as string;

  if (stripeCustomerId) {
    await stripe.billing.meterEvents.create({
      event_name: eventName,
      payload: {
        value,
        stripe_customer_id: stripeCustomerId,
      },
    });
  }
};

export const getStripeSubscriptionId = (
  planId: string,
): {
  subId: string;
  pageId: string;
  msgId: string;
} | null => {
  switch (planId) {
    case "starter":
      return {
        subId: env.STRIPE_STARTER_SUBSCRIPTION_ID,
        pageId: env.STRIPE_STARTER_PAGE_ID,
        msgId: env.STRIPE_STARTER_MSG_ID,
      };
    case "pro":
      return {
        subId: env.STRIPE_PRO_SUBSCRIPTION_ID,
        pageId: env.STRIPE_PRO_PAGE_ID,
        msgId: env.STRIPE_PRO_MSG_ID,
      };
    case "enterprise":
      return {
        subId: env.STRIPE_ENTERPRISE_SUBSCRIPTION_ID,
        pageId: env.STRIPE_ENTERPRISE_PAGE_ID,
        msgId: env.STRIPE_ENTERPRISE_MSG_ID,
      };
    default:
      return null;
  }
};
