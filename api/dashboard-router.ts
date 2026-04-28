import { createRouter, publicQuery } from "./middleware";
import * as dashboardQueries from "./queries/dashboard";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const [cycleStats, productStats, orderStats] = await Promise.all([
      dashboardQueries.getCycleStats(),
      dashboardQueries.getProductStats(),
      dashboardQueries.getOrderStats(),
    ]);

    return {
      cycles: cycleStats,
      products: productStats,
      orders: orderStats,
      totalRevenue: cycleStats.totalRevenue + orderStats.totalRevenue,
    };
  }),

  cycles: publicQuery.query(async () => {
    return dashboardQueries.findAllCycles(10);
  }),

  recentOrders: publicQuery.query(async () => {
    return dashboardQueries.findAllOrders(10);
  }),

  recentLogs: publicQuery.query(async () => {
    return dashboardQueries.findAllTransmissionLogs(10);
  }),

  socialAccounts: publicQuery.query(async () => {
    return dashboardQueries.findAllSocialAccounts();
  }),

  products: publicQuery.query(async () => {
    return dashboardQueries.findAllProducts(20);
  }),
});
