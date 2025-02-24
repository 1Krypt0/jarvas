import { db } from "@/db";
import { betterAuth, BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { createAuthMiddleware } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { redis } from "./kv";
import { stripe, StripeSubCache } from "./stripe";
import { eq } from "drizzle-orm";
import { env } from "@/env";

const stripePlugin = () => {
  return {
    id: "stripe-plugin",
    hooks: {
      before: [
        {
          matcher: (context) => context.path.startsWith("/sign-in"),
          handler: createAuthMiddleware(async (context) => {
            const { email } = context.body;

            if (typeof email !== "string") {
              throw new APIError("BAD_REQUEST", {
                message: "Requires email to sign-up",
              });
            }

            const userRes = await db
              .select({ id: schema.user.id })
              .from(schema.user)
              .where(eq(schema.user.email, email));

            if (!userRes) {
              throw new APIError("UNAUTHORIZED", {
                message: "Email does not have associated id",
              });
            }

            const userId = userRes.at(0)?.id;

            const stripeCustomerId = (await redis.get(
              `stripe:user:${userId}`,
            )) as string;

            if (!stripeCustomerId) {
              throw new APIError("UNAUTHORIZED", {
                message: "User does not have an associated stripe Id",
              });
            }

            const stripeStatus = (await redis.get(
              `stripe:customer:${stripeCustomerId}`,
            )) as StripeSubCache;

            if (stripeStatus.status === "none") {
              throw new APIError("UNAUTHORIZED", {
                message: "Payment has not yet been processed",
              });
            }

            if (stripeStatus.status !== "active") {
              throw new APIError("UNAUTHORIZED", {
                message: "Invalid payment status",
              });
            }

            return { context };
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};

export const auth = betterAuth({
  trustedOrigins: [env.NEXT_PUBLIC_BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [nextCookies(), stripePlugin()],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const stripeCustomerId = (await redis.get(
          `stripe:user:${user.id}`,
        )) as string;

        const stripeStatus = (await redis.get(
          `stripe:customer:${stripeCustomerId}`,
        )) as StripeSubCache;

        if (stripeStatus.status === "none") {
          throw new APIError("BAD_REQUEST", {
            message: "Subscription was already none",
          });
        }

        const subId = stripeStatus.subscriptionId;

        if (!subId) {
          throw new APIError("BAD_REQUEST", {
            message: "Subscription status malformed in Database",
          });
        }

        const res = await stripe.subscriptions.cancel(subId);

        if (res.status !== "canceled") {
          throw new APIError("BAD_REQUEST", {
            message: "Subscription was not cancelled",
          });
        }
      },
    },
  },
});
