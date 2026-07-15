import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: Request) {
  const body = await req.json();

  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.operatorRef, body.referenceId),
  });
  if (!tx) return new Response(null, { status: 404 });

  await db.update(transactions)
    .set({ status: body.status, statusReason: body.reason ?? null, updatedAt: new Date() })
    .where(eq(transactions.id, tx.id));

  await inngest.send({ name: "transaction/status.updated", data: { transactionId: tx.id } });

  return Response.json({ received: true });
}