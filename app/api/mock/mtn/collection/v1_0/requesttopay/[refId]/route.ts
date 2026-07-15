// app/api/mock/mtn/collection/v1_0/requesttopay/[refId]/route.ts
import { db } from "@/db/client";
import { mockOperatorTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { refId: string } }) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const subKey = req.headers.get("Ocp-Apim-Subscription-Key");

  if (!authHeader.startsWith("Bearer mock_") || subKey !== process.env.MTN_SUBSCRIPTION_KEY) {
    return new Response(null, { status: 401 });
  }

  const mockTx = await db.query.mockOperatorTransactions.findFirst({
    where: eq(mockOperatorTransactions.providerRef, params.refId),
  });
  if (!mockTx) return new Response(null, { status: 404 });

  return Response.json({ status: mockTx.status, reason: null });
}