// app/simulateur/mtn/[refId]/actions.ts
"use server";

import { db } from "@/db/client";
import { mockOperatorTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function confirmMtnPayment(refId: string, accepted: boolean) {
  const mockTx = await db.query.mockOperatorTransactions.findFirst({
    where: eq(mockOperatorTransactions.providerRef, refId),
  });
  if (!mockTx) throw new Error("X-Reference-Id inconnu");

  const status = accepted ? "SUCCESSFUL" : "FAILED";

  await db.update(mockOperatorTransactions)
    .set({ status, confirmedAt: new Date() })
    .where(eq(mockOperatorTransactions.id, mockTx.id));

  // MTN n'a pas de notifyUrl par requête (le ProviderCallbackHost est enregistré une fois
  // au provisionnement, §7.2 du CDC) — le simulateur POST directement vers le callback fixe.
  await fetch(`${process.env.APP_URL}/api/callbacks/mtn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      referenceId: refId,
      status,
      reason: accepted ? undefined : "APPROVAL_REJECTED",
    }),
  });
}