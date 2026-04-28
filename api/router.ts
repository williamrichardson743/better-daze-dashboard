import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { adminRouter } from "./admin-router";
import { billingRouter } from "./billing-router";
import { shopRouter } from "./shop-router";
import { campaignRouter } from "./campaign-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  admin: adminRouter,
  billing: billingRouter,
  shop: shopRouter,
  campaign: campaignRouter,
});

export type AppRouter = typeof appRouter;
