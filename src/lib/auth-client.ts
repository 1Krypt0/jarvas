import { env } from "@/env";
import { createAuthClient } from "better-auth/react";
import { z } from "zod";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const registerSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: "A password precisa de pelo menos 8 dígitos" }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As passwords têm de condizer",
    path: ["passwordConfirmation"],
  });

export type Session = typeof authClient.$Infer.Session;
