import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { adminRouter } from "./admin-router";
import { shopRouter } from "./shop-router";
import { campaignRouter } from "./campaign-router";
import { operationsRouter } from "./operations-router";
import { agentRouter } from "./agent-router";
import { agentHubRouter } from "./agent-hub-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  admin: adminRouter,
  shop: shopRouter,
  campaign: campaignRouter,
  operations: operationsRouter,
  agent: agentRouter,
  agentHub: agentHubRouter,
});

export type AppRouter = typeof appRouter;
