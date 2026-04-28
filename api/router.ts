import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
