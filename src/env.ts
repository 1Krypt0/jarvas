import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_JARVAS_SUBSCRIPTION_ID: z.string().min(1),
    STRIPE_FILES_SUBSCRIPTION_ID: z.string().min(1),
    STRIPE_CHAT_SUBSCRIPTION_ID: z.string().min(1),
    STRIPE_REDIRECT_BASE_URL: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    UPSTASH_REDIS_URL: z.string().min(1),
    UPSTASH_REDIS_TOKEN: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
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
