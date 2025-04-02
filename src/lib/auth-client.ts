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
      .min(8, { message: "Your Password needs at least 8 characters" }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match",
    path: ["passwordConfirmation"],
  });

export type Session = typeof authClient.$Infer.Session;
