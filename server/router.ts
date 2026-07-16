import { router } from "./trpc";
import { merchantsRouter } from "./routers/merchants";
import { paymentsRouter } from "./routers/payments";

export const appRouter = router({
  merchants: merchantsRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
