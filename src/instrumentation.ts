import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";
import { env } from "./env";

export function register() {
  registerOTel({
    serviceName: "Jarvas",
    traceExporter: new LangfuseExporter({
      secretKey: env.LANGFUSE_SECRET_KEY,
      publicKey: env.LANGFUSE_PUBLIC_KEY,
      baseUrl: env.LANGFUSE_HOST,
    }),
  });
}
