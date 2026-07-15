import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Utilisateur Clerk connecté, marchand pas encore forcément créé en DB — sert à l'onboarding
export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.clerkUserId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, clerkUserId: ctx.clerkUserId } });
});

// Marchand déjà onboardé — utilisé par payments/transactions
export const merchantProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.merchantId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Marchand non onboardé" });
  return next({ ctx: { ...ctx, merchantId: ctx.merchantId } });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});