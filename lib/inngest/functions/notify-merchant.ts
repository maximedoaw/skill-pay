// lib/inngest/functions/notify-merchant.ts
import { createHmac } from "crypto";
import { eq } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "@/db/client";
import { transactions, merchants } from "@/db/schema";

export const notifyMerchant = inngest.createFunction(
  { id: "notify-merchant-webhook", retries: 4, triggers: { event: "transaction/status.updated" } },
  async ({ event, step }) => {
    const tx = await step.run("load-transaction", async () => {
      const t = await db.query.transactions.findFirst({ where: eq(transactions.id, event.data.transactionId) });
      const merchant = await db.query.merchants.findFirst({ where: eq(merchants.id, t!.merchantId) });
      return { ...t!, merchant: merchant! };
    });

    if (tx.merchant.webhookUrl) {
      await step.run("deliver-webhook", async () => {
        const payload = JSON.stringify({ transactionId: tx.id, status: tx.status });
        const signature = createHmac("sha256", tx.merchant.apiSecretHash).update(payload).digest("hex");
        const res = await fetch(tx.merchant.webhookUrl!, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Signature": signature },
          body: payload,
        });
        if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);
      });
    }

    if (tx.status === "FAILED" && tx.merchant.smsAlertsEnabled) {
      await step.sendEvent("trigger-sms-alert", {
        name: "merchant/sms-alert.requested",
        data: { transactionId: tx.id },
      });
    }
  }
);