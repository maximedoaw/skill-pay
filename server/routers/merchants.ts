// server/routers/merchants.ts
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { router, authedProcedure } from "../trpc";
import { merchants, merchantDocuments } from "@/db/schema";
import { db } from "@/db/client";

export const merchantsRouter = router({
  // Appelée par le dashboard juste après l'inscription Clerk — remplace le webhook user.created
  onboard: authedProcedure
    .input(z.object({
      businessName: z.string().min(2).max(255),
      phone: z.string().regex(/^237[0-9]{9}$/, "Format attendu: 237XXXXXXXXX"),
      documents: z.array(z.object({
        type: z.string(),
        name: z.string(),
        url: z.string().url(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.merchants.findFirst({ where: eq(merchants.clerkUserId, ctx.clerkUserId) });

      const clerkUser = await currentUser();
      const derivedUsername = clerkUser?.username || clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || clerkUser?.firstName || "anonymous";

      if (existing) {
        if (existing.username === "anonymous" && derivedUsername !== "anonymous") {
          await db.update(merchants).set({ username: derivedUsername }).where(eq(merchants.id, existing.id));
          return { ...existing, username: derivedUsername };
        }
        return existing; // idempotent
      }

      const apiKeyPublic = `sk_pub_${randomUUID().replace(/-/g, "")}`;
      const apiSecretPlain = randomUUID().replace(/-/g, "");
      const apiSecretHash = await bcrypt.hash(apiSecretPlain, 12);

      const [merchant] = await db.insert(merchants).values({
        clerkUserId: ctx.clerkUserId,
        username: derivedUsername,
        businessName: input.businessName,
        phone: input.phone,
        apiKeyPublic,
        apiSecretHash,
        status: "PENDING", // validation manuelle
      }).returning();

      if (input.documents && input.documents.length > 0) {
        await db.insert(merchantDocuments).values(
          input.documents.map((doc) => ({
            merchantId: merchant.id,
            type: doc.type,
            name: doc.name,
            url: doc.url,
            status: "PENDING",
          }))
        );
      }

      // Le secret en clair n'est renvoyé qu'une seule fois, ici — jamais stocké ni renvoyé ensuite
      return { ...merchant, apiSecretPlain };
    }),

  // Utilisée par le dashboard pour savoir si l'utilisateur doit voir le formulaire d'onboarding
  me: authedProcedure.query(async ({ ctx }) => {
    const merchant = await db.query.merchants.findFirst({ 
      where: eq(merchants.clerkUserId, ctx.clerkUserId),
      with: { documents: true },
    });
    return merchant ?? null;
  }),

  // Admin: Liste des marchands (filtrée par statut et recherche)
  list: authedProcedure
    .input(z.object({
      status: z.enum(["PENDING", "ACTIVE", "REJECTED", "ALL"]).default("PENDING"),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { status, search } = input;

      const allMerchants = await db.query.merchants.findMany({
        orderBy: (merchants, { desc }) => [desc(merchants.createdAt)],
        with: { documents: true },
      });

      return allMerchants.filter((m) => {
        const matchesStatus = status === "ALL" || m.status === status;
        const q = search?.toLowerCase().trim();
        const matchesSearch = !q
          || m.businessName.toLowerCase().includes(q)
          || m.phone.includes(q);
        return matchesStatus && matchesSearch;
      });
    }),

  // Admin: Mettre à jour le statut du marchand
  updateStatus: authedProcedure
    .input(z.object({
      merchantId: z.string().uuid(),
      status: z.enum(["ACTIVE", "REJECTED"]),
    }))
    .mutation(async ({ input }) => {
      // NOTE: En production, il faut vérifier ici que ctx.user.email est bien l'admin
      const [updated] = await db
        .update(merchants)
        .set({ status: input.status as any })
        .where(eq(merchants.id, input.merchantId))
        .returning();
      return updated;
    }),

  // Admin: Mettre à jour le statut d'un document
  updateDocumentStatus: authedProcedure
    .input(z.object({
      documentId: z.string().uuid(),
      status: z.enum(["APPROVED", "REJECTED"]),
      rejectionReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(merchantDocuments)
        .set({ status: input.status as any, rejectionReason: input.rejectionReason || null })
        .where(eq(merchantDocuments.id, input.documentId))
        .returning();

      // Si le document est approuvé, vérifier si TOUS les documents de ce marchand sont approuvés
      if (input.status === "APPROVED") {
        const allDocs = await db.query.merchantDocuments.findMany({
          where: eq(merchantDocuments.merchantId, updated.merchantId),
        });
        const allApproved = allDocs.length > 0 && allDocs.every(d => d.status === "APPROVED");
        if (allApproved) {
          await db
            .update(merchants)
            .set({ status: "ACTIVE" })
            .where(eq(merchants.id, updated.merchantId));
        }
      }

      return updated;
    }),
});