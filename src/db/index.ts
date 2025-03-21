import { env } from "@/env";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle(env.DATABASE_URL, {
  casing: "snake_case",
});
