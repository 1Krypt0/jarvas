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
        subject: "Reponha a sua password",
        html: createEmailTemplate(
          "Repõe a tua password!",
          "Recebemos um pedido para repor a password da tua conta. Se não fez este pedido, pode ignorar este e-mail sem problemas.",
          `Se não fez um pedido de reposição de password, por favor ignore este e-mail. Precisa de ajuda? Contacte a nossa <a href="askjarvas@gmail.com" style="color: #4A1A0D; text-decoration: none;">equipa de apoio.</a>`,
          url,
          "Repor a Password",
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
        subject: "Verifique o seu email",
        html: createEmailTemplate(
          "Verifica a tua Conta!",
          "Olá! Por favor confirma o teu email para ativares a tua conta no Jarvas. Isto ajuda-nos a manter a tua conta segura.",
          `Precisa de ajuda? Contacte a nossa <a href="askjarvas@gmail.com" style="color: #4A1A0D; text-decoration: none;">equipa de apoio.</a>`,
          url,
          "Verificar Endereço",
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
      pagesUsed: {
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
