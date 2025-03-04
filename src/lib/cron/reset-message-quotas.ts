import { db } from "@/db";
import { user } from "@/db/schema";

async function resetQuotas() {
  await db.update(user).set({ messagesUsed: 0, pagesUsed: 0 });
}

await resetQuotas();
