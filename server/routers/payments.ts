// server/routers/payments.ts
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, merchantProcedure } from "../trpc";
import { db } from "@/db/client";
import { transactions, merchants } from "@/db/schema";
import { resolveOperator } from "@/lib/routing";
import { orangeAdapter } from "@/lib/operators/orange";
import { mtnAdapter } from "@/lib/operators/mtn";
import { TRPCError } from "@trpc/server";

export const paymentsRouter = router({
  initiate: merchantProcedure
    .input(z.object({
      amount: z.number().int().positive(),
      currency: z.string().length(3).default("XAF"),
      payerMsisdn: z.string().regex(/^237[0-9]{9}$/, "Format MSISDN attendu: 237XXXXXXXXX"),
      externalId: z.string().min(1).max(128),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.transactions.findFirst({
        where: and(eq(transactions.merchantId, ctx.merchantId), eq(transactions.externalId, input.externalId)),
      });
      if (existing) return existing;

      const operator = await resolveOperator(input.payerMsisdn);
      if (!operator) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "PAY_003: numéro non rattaché à un opérateur supporté" });
      }

      const [tx] = await db.insert(transactions).values({
        merchantId: ctx.merchantId,
        operator,
        externalId: input.externalId,
        amount: input.amount,
        currency: input.currency,
        payerMsisdn: input.payerMsisdn,
        status: "INITIATED",
      }).returning();

      const merchant = await db.query.merchants.findFirst({ where: eq(merchants.id, ctx.merchantId) });
      const adapter = operator === "ORANGE_MONEY" ? orangeAdapter : mtnAdapter;

      const result = await adapter.initiatePayment({
        amount: input.amount,
        currency: input.currency,
        payerMsisdn: input.payerMsisdn,
        externalId: input.externalId,
        merchantMsisdn: merchant!.phone,
      });

      const [updated] = await db.update(transactions)
        .set({ operatorRef: result.operatorRef, status: "PENDING", updatedAt: new Date() })
        .where(eq(transactions.id, tx.id))
        .returning();

      return updated;
    }),

  getStatus: merchantProcedure
    .input(z.object({ transactionId: z.string().uuid() }))
    .query(({ input }) => db.query.transactions.findFirst({ where: eq(transactions.id, input.transactionId) })),

  list: merchantProcedure.query(({ ctx }) =>
    db.query.transactions.findMany({
      where: eq(transactions.merchantId, ctx.merchantId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 50,
    })
  ),
});