import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { APIError } from "better-auth/api";
import { redis } from "./kv";
import { stripe, StripeSubCache } from "./stripe";
import { env } from "@/env";
import { resend, from, createEmailTemplate } from "./email/email";

export const auth = betterAuth({
  trustedOrigins: [env.NEXT_PUBLIC_BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [nextCookies()],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ url, user }) => {
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Jarvas - Password Reset",
        html: createEmailTemplate(
          "Reset your password!",
          "We have received a request to reset your account's password. If you did not make this request, you can safely ignore this e-mail.",
          `Need assintance? Contact our <a href="mailto:askjarvas@gmail.com" style="color: #4A1A0D; text-decoration: none;">support team.</a>`,
          url,
          "Reset Password",
        ),
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ url, user }) => {
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Jarvas - Verify your Email",
        html: createEmailTemplate(
          "Verify your Account!",
          "Hey there! Please confirm your email to activate your Jarvas account. This helps us keep your account secure.",
          `Need help? Contact our <a href="mailto:askjarvas@gmail.com" style="color: #4A1A0D; text-decoration: none;">support team.</a>`,
          url,
          "Verify Email",
        ),
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const stripeCustomer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: user.id,
            },
          });

          await redis.set(`stripe:user:${user.id}`, stripeCustomer.id);
        },
      },
    },
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        defaultValue: "free",
        input: false,
        returned: true,
      },
      creditsUsed: {
        type: "number",
        defaultValue: 0,
        input: false,
        returned: true,
      },
      messagesUsed: {
        type: "number",
        defaultValue: 0,
        input: false,
        returned: true,
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const stripeCustomerId = (await redis.get(
          `stripe:user:${user.id}`,
        )) as string;

        const stripeStatus = (await redis.get(
          `stripe:customer:${stripeCustomerId}`,
        )) as StripeSubCache;

        if (!stripeStatus) {
          await redis.del(`stripe:user:${user.id}`);
          return;
        }

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

        await redis.del(
          `stripe:user:${user.id}`,
          `stripe:customer:${stripeCustomerId}`,
        );
      },
    },
  },
});
