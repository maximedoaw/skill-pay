// server/context.ts
import { auth } from "@clerk/nextjs/server";
import { merchants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";

export async function createContext() {
  const { userId, sessionClaims } = await auth();

  // Peut être null si le marchand ne s'est pas encore "onboardé" — normal, pas une erreur.
  const merchant = userId
    ? await db.query.merchants.findFirst({ where: eq(merchants.clerkUserId, userId) })
    : null;

  return {
    clerkUserId: userId ?? null,
    merchantId: merchant?.id ?? null,
    role: (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;