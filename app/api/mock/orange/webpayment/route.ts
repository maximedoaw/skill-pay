// app/api/mock/orange/webpayment/route.ts
import { db } from "@/db/client";
import { mockOperatorTransactions } from "@/db/schema";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer mock_")) {
    return Response.json({ code: "AUTH_001", message: "Token d'accès manquant ou invalide" }, { status: 401 });
  }

  const body = await req.json();
  const payToken = crypto.randomUUID();

  await db.insert(mockOperatorTransactions).values({
    operator: "ORANGE_MONEY",
    providerRef: payToken,
    notifyUrl: body.notifyUrl,
    status: "PENDING",
  });

  return Response.json({ payToken, status: "PENDING" }, { status: 201 });
}