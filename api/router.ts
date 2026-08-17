import { authRouter } from "./auth-router.js";
import { dashboardRouter } from "./dashboard-router.js";
import { adminRouter } from "./admin-router.js";
import { shopRouter } from "./shop-router.js";
import { campaignRouter } from "./campaign-router.js";
import { operationsRouter } from "./operations-router.js";
import { agentRouter } from "./agent-router.js";
import { waitlistRouter } from "./waitlist-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  admin: adminRouter,
  shop: shopRouter,
  campaign: campaignRouter,
  operations: operationsRouter,
  agent: agentRouter,
  waitlist: waitlistRouter,
});

export type AppRouter = typeof appRouter;
