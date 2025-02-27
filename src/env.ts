import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_STARTER_SUBSCRIPTION_ID: z.string().min(1),
    STRIPE_STARTER_PAGE_ID: z.string().min(1),
    STRIPE_STARTER_MSG_ID: z.string().min(1),
    STRIPE_PRO_SUBSCRIPTION_ID: z.string().min(1),
    STRIPE_PRO_PAGE_ID: z.string().min(1),
    STRIPE_PRO_MSG_ID: z.string().min(1),
    STRIPE_ENTERPRISE_SUBSCRIPTION_ID: z.string().min(1),
    STRIPE_ENTERPRISE_PAGE_ID: z.string().min(1),
    STRIPE_ENTERPRISE_MSG_ID: z.string().min(1),
    STRIPE_REDIRECT_BASE_URL: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    UPSTASH_REDIS_URL: z.string().min(1),
    UPSTASH_REDIS_TOKEN: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    PLAUSIBLE_DOMAIN: z.string().url(),
    RESEND_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_BILLING_LINK: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_STRIPE_BILLING_LINK:
      process.env.NEXT_PUBLIC_STRIPE_BILLING_LINK,
  },
});
