// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { reconcilePendingTransactions } from "@/lib/inngest/functions/reconcile";
import { notifyMerchant } from "@/lib/inngest/functions/notify-merchant";
import { expireStaleTransactions } from "@/lib/inngest/functions/expire";
import { sendSmsAlert } from "@/lib/inngest/functions/send-sms-alert";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [reconcilePendingTransactions, notifyMerchant, expireStaleTransactions, sendSmsAlert],
});