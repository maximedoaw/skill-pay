import { db } from "@/db/client";
import { mockOperatorTransactions } from "@/db/schema";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const refId = req.headers.get("X-Reference-Id");
  const targetEnv = req.headers.get("X-Target-Environment");
  const subKey = req.headers.get("Ocp-Apim-Subscription-Key");

  if (!refId || !targetEnv || !subKey) {
    return new Response(null, { status: 400 });
  }
  if (!authHeader.startsWith("Bearer mock_") || subKey !== process.env.MTN_SUBSCRIPTION_KEY) {
    return new Response(null, { status: 401 });
  }

  await req.json();

  await db.insert(mockOperatorTransactions).values({
    operator: "MTN_MOMO",
    providerRef: refId,
    status: "PENDING",
  });

  return new Response(null, { status: 202 });
}