import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
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

  product: createRouter({
    create: authedQuery
      .input(
        z.object({
          cycleId: z.number().default(1),
          name: z.string().min(1),
          description: z.string().optional(),
          slogan: z.string().optional(),
          designUrl: z.string().optional(),
          mockupUrl: z.string().optional(),
          productType: z.enum(["tshirt", "hoodie", "mug", "poster", "sticker", "hat", "tote", "other"]).default("tshirt"),
          price: z.string().default("24.99"),
          cost: z.string().optional(),
          status: z.enum(["draft", "pending", "approved", "live", "sold_out", "discontinued"]).default("draft"),
          inventory: z.number().default(100),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const sku = `BD-${input.productType.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
        const [result] = await db.insert(schema.products).values({
          ...input,
          sku,
        }).$returningId();
        return { id: result.id, sku };
      }),
    update: authedQuery
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          slogan: z.string().optional(),
          designUrl: z.string().optional(),
          mockupUrl: z.string().optional(),
          price: z.string().optional(),
          status: z.enum(["draft", "pending", "approved", "live", "sold_out", "discontinued"]).optional(),
          inventory: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        await db.update(schema.products).set(data).where(eq(schema.products.id, id));
        return { success: true };
      }),
    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.products).where(eq(schema.products.id, input.id));
      return { success: true };
    }),
    publish: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.update(schema.products).set({ status: "live" }).where(eq(schema.products.id, input.id));
      return { success: true };
    }),
  }),
});
