// lib/inngest/functions/expire.ts
import { and, eq, lt } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";

export const expireStaleTransactions = inngest.createFunction(
  { id: "expire-stale-transactions", triggers: { cron: "*/15 * * * *" } },
  async ({ step }) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await step.run("fetch-stale", () =>
      db.query.transactions.findMany({
        where: and(eq(transactions.status, "PENDING"), lt(transactions.createdAt, oneDayAgo)),
      })
    );
    for (const tx of stale) {
      await step.run(`expire-${tx.id}`, async () => {
        await db.update(transactions).set({ status: "EXPIRED" }).where(eq(transactions.id, tx.id));
        await inngest.send({ name: "transaction/status.updated", data: { transactionId: tx.id } });
      });
    }
  }
);