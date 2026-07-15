import { and, eq, lt } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import { orangeAdapter } from "@/lib/operators/orange";
import { mtnAdapter } from "@/lib/operators/mtn";

export const reconcilePendingTransactions = inngest.createFunction(
  { id: "reconcile-pending-transactions", triggers: { cron: "*/5 * * * *" } },
  async ({ step }) => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const pending = await step.run("fetch-pending", () =>
      db.query.transactions.findMany({
        where: and(eq(transactions.status, "PENDING"), lt(transactions.createdAt, tenMinutesAgo)),
      })
    );

    for (const tx of pending) {
      await step.run(`check-status-${tx.id}`, async () => {
        if (!tx.operatorRef) return;
        const adapter = tx.operator === "ORANGE_MONEY" ? orangeAdapter : mtnAdapter;
        const result = await adapter.checkStatus(tx.operatorRef);
        if (result.status !== "PENDING") {
          await db.update(transactions).set({ status: result.status, statusReason: result.reason ?? null })
            .where(eq(transactions.id, tx.id));
          await inngest.send({ name: "transaction/status.updated", data: { transactionId: tx.id } });
        }
      });
    }
  }
);