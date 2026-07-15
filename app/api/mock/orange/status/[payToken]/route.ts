import { db } from "@/db/client";
import { mockOperatorTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: { payToken: string } }) {
  const mockTx = await db.query.mockOperatorTransactions.findFirst({
    where: eq(mockOperatorTransactions.providerRef, params.payToken),
  });
  if (!mockTx) return new Response(null, { status: 404 });
  return Response.json({ status: mockTx.status });
}