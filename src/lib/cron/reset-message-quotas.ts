import { db } from "@/db";
import { user } from "@/db/schema";

async function resetMessageQuotas() {
  await db.update(user).set({ messagesUsed: 0 });
}

await resetMessageQuotas();
