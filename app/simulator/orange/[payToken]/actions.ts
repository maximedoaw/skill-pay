"use server";

import { db } from "@/db/client";
import { mockOperatorTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function confirmOrangePayment(payToken: string, accepted: boolean) {
  const mockTx = await db.query.mockOperatorTransactions.findFirst({
    where: eq(mockOperatorTransactions.providerRef, payToken),
  });
  if (!mockTx) throw new Error("payToken inconnu");

  const status = accepted ? "SUCCESSFUL" : "FAILED";

  await db.update(mockOperatorTransactions)
    .set({ status, confirmedAt: new Date() })
    .where(eq(mockOperatorTransactions.id, mockTx.id));

  if (mockTx.notifyUrl) {
    await fetch(mockTx.notifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payToken, status: accepted ? "SUCCESSFULL" : "FAILED" }),
    });
  }
}