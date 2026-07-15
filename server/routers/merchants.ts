// server/routers/merchants.ts
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { router, authedProcedure } from "../trpc";
import { merchants } from "@/db/schema";
import { db } from "@/db/client";

export const merchantsRouter = router({
  // Appelée par le dashboard juste après l'inscription Clerk — remplace le webhook user.created
  onboard: authedProcedure
    .input(z.object({
      businessName: z.string().min(2).max(255),
      phone: z.string().regex(/^237[0-9]{9}$/, "Format attendu: 237XXXXXXXXX"),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.merchants.findFirst({ where: eq(merchants.clerkUserId, ctx.clerkUserId) });
      if (existing) return existing; // idempotent — pas d'erreur si déjà onboardé

      const apiKeyPublic = `sk_pub_${randomUUID().replace(/-/g, "")}`;
      const apiSecretPlain = randomUUID().replace(/-/g, "");
      const apiSecretHash = await bcrypt.hash(apiSecretPlain, 12);

      const [merchant] = await db.insert(merchants).values({
        clerkUserId: ctx.clerkUserId,
        businessName: input.businessName,
        phone: input.phone,
        apiKeyPublic,
        apiSecretHash,
        status: "ACTIVE", // pas de validation manuelle dans le MVP
      }).returning();

      // Le secret en clair n'est renvoyé qu'une seule fois, ici — jamais stocké ni renvoyé ensuite
      return { ...merchant, apiSecretPlain };
    }),

  // Utilisée par le dashboard pour savoir si l'utilisateur doit voir le formulaire d'onboarding
  me: authedProcedure.query(({ ctx }) =>
    db.query.merchants.findFirst({ where: eq(merchants.clerkUserId, ctx.clerkUserId) })
  ),
});