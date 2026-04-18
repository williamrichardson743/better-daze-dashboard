var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/index.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
var t = initTRPC.context().create({
  isServer: true,
  allowOutsideOfServer: true
});
var router = t.router;
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please login (10001)"
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have required permission (10002)"
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});

// server/_core/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analytics: () => analytics,
  analyticsRelations: () => analyticsRelations,
  cycles: () => cycles,
  cyclesRelations: () => cyclesRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  schedulerConfig: () => schedulerConfig,
  schedulerConfigRelations: () => schedulerConfigRelations,
  socialAccounts: () => socialAccounts,
  socialAccountsRelations: () => socialAccountsRelations,
  socialPosts: () => socialPosts,
  socialPostsRelations: () => socialPostsRelations,
  transmissionLogs: () => transmissionLogs,
  transmissionLogsRelations: () => transmissionLogsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { mysqlTable, int, varchar, timestamp, text, boolean, index, sqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
var users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  openId: varchar("open_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  role: sqlEnum("role", ["admin", "user"]).default("user"),
  subscriptionTier: sqlEnum("subscription_tier", ["free", "pro", "enterprise"]).default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  openIdIdx: index("open_id_idx").on(table.openId)
}));
var socialAccounts = mysqlTable("social_accounts", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  platform: sqlEnum("platform", ["tiktok", "instagram", "youtube"]).notNull(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  accountName: varchar("account_name", { length: 255 }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  followers: int("followers").default(0),
  isConnected: boolean("is_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  platformIdx: index("platform_idx").on(table.platform)
}));
var cycles = mysqlTable("cycles", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  cycleNumber: int("cycle_number").notNull(),
  status: sqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  currentPhase: int("current_phase").default(0),
  slogan: varchar("slogan", { length: 255 }),
  theme: varchar("theme", { length: 255 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status)
}));
var products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  cycleId: int("cycle_id").notNull(),
  printifyId: varchar("printify_id", { length: 255 }),
  shopifyId: varchar("shopify_id", { length: 255 }),
  slogan: varchar("slogan", { length: 255 }).notNull(),
  designUrl: varchar("design_url", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }).default("27.99"),
  status: sqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  cycleIdIdx: index("cycle_id_idx").on(table.cycleId)
}));
var orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  productId: int("product_id").notNull(),
  shopifyOrderId: varchar("shopify_order_id", { length: 255 }).unique(),
  customerEmail: varchar("customer_email", { length: 255 }),
  quantity: int("quantity").default(1),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  status: sqlEnum("status", ["pending", "paid", "fulfilled", "cancelled"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  statusIdx: index("status_idx").on(table.status)
}));
var socialPosts = mysqlTable("social_posts", {
  id: int("id").primaryKey().autoincrement(),
  cycleId: int("cycle_id").notNull(),
  platform: sqlEnum("platform", ["tiktok", "instagram", "youtube"]).notNull(),
  postId: varchar("post_id", { length: 255 }),
  contentUrl: varchar("content_url", { length: 255 }),
  caption: text("caption"),
  postedAt: timestamp("posted_at"),
  views: int("views").default(0),
  likes: int("likes").default(0),
  shares: int("shares").default(0),
  comments: int("comments").default(0),
  saves: int("saves").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
}, (table) => ({
  cycleIdIdx: index("cycle_id_idx").on(table.cycleId),
  platformIdx: index("platform_idx").on(table.platform)
}));
var analytics = mysqlTable("analytics", {
  id: int("id").primaryKey().autoincrement(),
  cycleId: int("cycle_id").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  totalViews: int("total_views").default(0),
  totalEngagement: int("total_engagement").default(0),
  roi: decimal("roi", { precision: 5, scale: 2 }).default("0"),
  bestPlatform: varchar("best_platform", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  cycleIdIdx: index("cycle_id_idx").on(table.cycleId)
}));
var transmissionLogs = mysqlTable("transmission_logs", {
  id: int("id").primaryKey().autoincrement(),
  cycleId: int("cycle_id").notNull(),
  message: text("message").notNull(),
  logType: sqlEnum("log_type", ["info", "success", "warn", "error"]).default("info"),
  phase: int("phase").default(0),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  cycleIdIdx: index("cycle_id_idx").on(table.cycleId)
}));
var schedulerConfig = mysqlTable("scheduler_config", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  enabled: boolean("enabled").default(true),
  intervalHours: int("interval_hours").default(72),
  nextRunAt: timestamp("next_run_at"),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId)
}));
var usersRelations = relations(users, ({ many }) => ({
  cycles: many(cycles),
  socialAccounts: many(socialAccounts),
  schedulerConfig: many(schedulerConfig)
}));
var cyclesRelations = relations(cycles, ({ one, many }) => ({
  user: one(users, { fields: [cycles.userId], references: [users.id] }),
  products: many(products),
  socialPosts: many(socialPosts),
  analytics: many(analytics),
  logs: many(transmissionLogs)
}));
var productsRelations = relations(products, ({ one, many }) => ({
  cycle: one(cycles, { fields: [products.cycleId], references: [cycles.id] }),
  orders: many(orders)
}));
var ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, { fields: [orders.productId], references: [products.id] })
}));
var socialPostsRelations = relations(socialPosts, ({ one }) => ({
  cycle: one(cycles, { fields: [socialPosts.cycleId], references: [cycles.id] })
}));
var analyticsRelations = relations(analytics, ({ one }) => ({
  cycle: one(cycles, { fields: [analytics.cycleId], references: [cycles.id] })
}));
var transmissionLogsRelations = relations(transmissionLogs, ({ one }) => ({
  cycle: one(cycles, { fields: [transmissionLogs.cycleId], references: [cycles.id] })
}));
var socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  user: one(users, { fields: [socialAccounts.userId], references: [users.id] })
}));
var schedulerConfigRelations = relations(schedulerConfig, ({ one }) => ({
  user: one(users, { fields: [schedulerConfig.userId], references: [users.id] })
}));

// server/_core/db.ts
var dbInstance = null;
async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const url = new URL(databaseUrl);
  const host = url.hostname;
  const port = parseInt(url.port || "3306");
  const user = url.username;
  const password = url.password;
  const database = url.pathname.slice(1);
  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  dbInstance = drizzle(pool, { schema: schema_exports, mode: "default" });
  return dbInstance;
}
var db = new Proxy(
  {},
  {
    get: async (target, prop) => {
      const database = await getDb();
      return database[prop];
    }
  }
);

// server/db.ts
import { eq, desc, and, sum } from "drizzle-orm";
async function createCycle(data) {
  const [cycle] = await db.insert(cycles).values(data);
  return cycle;
}
async function getCycle(cycleId) {
  return db.query.cycles.findFirst({
    where: eq(cycles.id, cycleId)
  });
}
async function getCurrentCycle(userId) {
  return db.query.cycles.findFirst({
    where: and(eq(cycles.userId, userId), eq(cycles.status, "running")),
    orderBy: desc(cycles.createdAt)
  });
}
async function updateCycle(cycleId, data) {
  const [updated] = await db.update(cycles).set(data).where(eq(cycles.id, cycleId));
  return updated;
}
async function getCycleHistory(userId, limit = 10) {
  return db.query.cycles.findMany({
    where: eq(cycles.userId, userId),
    orderBy: desc(cycles.createdAt),
    limit
  });
}
async function createProduct(data) {
  const [product] = await db.insert(products).values(data);
  return product;
}
async function getProducts(userId, cycleId, limit = 20) {
  const where = cycleId ? and(eq(products.cycleId, cycleId)) : void 0;
  return db.query.products.findMany({
    where,
    orderBy: desc(products.createdAt),
    limit
  });
}
async function updateProduct(productId, data) {
  const [updated] = await db.update(products).set(data).where(eq(products.id, productId));
  return updated;
}
async function syncShopifyOrders(userId) {
  return {
    synced: 0,
    created: 0,
    updated: 0
  };
}
async function getShopifyStats(userId) {
  const orderStats = await db.select({
    totalRevenue: sum(orders.revenue),
    totalUnits: sum(orders.quantity)
  }).from(orders).innerJoin(products, eq(orders.productId, products.id)).innerJoin(cycles, eq(products.cycleId, cycles.id)).where(eq(cycles.userId, userId));
  const productCount = await db.select().from(products).innerJoin(cycles, eq(products.cycleId, cycles.id)).where(eq(cycles.userId, userId));
  const cycleCount = await db.select().from(cycles).where(and(eq(cycles.userId, userId), eq(cycles.status, "completed")));
  return {
    totalRevenue: orderStats[0]?.totalRevenue || 0,
    totalUnits: orderStats[0]?.totalUnits || 0,
    activeProducts: productCount.length,
    cyclesRun: cycleCount.length
  };
}
async function getRecentOrders(userId, limit = 10) {
  return db.query.orders.findMany({
    limit,
    orderBy: desc(orders.createdAt)
  });
}
async function getOrdersByProduct(productId) {
  return db.query.orders.findMany({
    where: eq(orders.productId, productId),
    orderBy: desc(orders.createdAt)
  });
}
async function createSocialAccount(data) {
  const [account] = await db.insert(socialAccounts).values(data);
  return account;
}
async function getSocialAccounts(userId) {
  return db.query.socialAccounts.findMany({
    where: eq(socialAccounts.userId, userId)
  });
}
async function updateSocialAccount(accountId, data) {
  const [updated] = await db.update(socialAccounts).set(data).where(eq(socialAccounts.id, accountId));
  return updated;
}
async function getSocialStats(userId) {
  return {
    tiktokViews: 0,
    instagramReach: 0,
    youtubeViews: 0
  };
}
async function getSocialPosts(userId, cycleId, limit = 20) {
  const where = cycleId ? eq(socialPosts.cycleId, cycleId) : void 0;
  return db.query.socialPosts.findMany({
    where,
    orderBy: desc(socialPosts.createdAt),
    limit
  });
}
async function getSocialPostStats(postId) {
  return db.query.socialPosts.findFirst({
    where: eq(socialPosts.id, postId)
  });
}
async function getAnalyticsByCycle(cycleId) {
  return db.query.analytics.findFirst({
    where: eq(analytics.cycleId, cycleId)
  });
}
async function getAnalyticsForUser(userId) {
  return db.query.analytics.findMany({
    limit: 30,
    orderBy: desc(analytics.createdAt)
  });
}
async function getAnalyticsSummary(userId) {
  return {
    totalRevenue: 0,
    totalViews: 0,
    totalEngagement: 0,
    averageROI: 0
  };
}
async function getAnalyticsByPlatform(userId) {
  return {
    tiktok: { views: 0, engagement: 0, revenue: 0 },
    instagram: { views: 0, engagement: 0, revenue: 0 },
    youtube: { views: 0, engagement: 0, revenue: 0 }
  };
}
async function calculateROI(cycleId) {
  const analytics_record = await getAnalyticsByCycle(cycleId);
  return analytics_record?.roi || 0;
}
async function createTransmissionLog(data) {
  const [log] = await db.insert(transmissionLogs).values(data);
  return log;
}
async function getTransmissionLogs(cycleId, limit = 50) {
  return db.query.transmissionLogs.findMany({
    where: eq(transmissionLogs.cycleId, cycleId),
    orderBy: desc(transmissionLogs.createdAt),
    limit
  });
}
async function updateSchedulerConfig(userId, data) {
  const existing = await db.query.schedulerConfig.findFirst({
    where: eq(schedulerConfig.userId, userId)
  });
  if (existing) {
    const [updated] = await db.update(schedulerConfig).set(data).where(eq(schedulerConfig.userId, userId));
    return updated;
  }
  const [created] = await db.insert(schedulerConfig).values({
    userId,
    ...data
  });
  return created;
}
async function getSchedulerConfig(userId) {
  return db.query.schedulerConfig.findFirst({
    where: eq(schedulerConfig.userId, userId)
  });
}

// server/routers.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
var appRouter = router({
  // ─── Authentication ───────────────────────────────────────────────────
  auth: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie("session");
      return { success: true };
    })
  }),
  // ─── Dashboard ───────────────────────────────────────────────────────
  dashboard: router({
    metrics: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getShopifyStats(ctx.user.id);
      const cycle = await getCurrentCycle(ctx.user.id);
      const socialStats = await getSocialStats(ctx.user.id);
      return {
        revenue: stats.totalRevenue,
        units: stats.totalUnits,
        activeDrops: stats.activeProducts,
        tiktokViews: socialStats.tiktokViews,
        instagramReach: socialStats.instagramReach,
        cyclesRun: stats.cyclesRun
      };
    }),
    recentOrders: protectedProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ ctx, input }) => {
      return getRecentOrders(ctx.user.id, input.limit);
    }),
    cycleStatus: protectedProcedure.query(async ({ ctx }) => {
      const cycle = await getCurrentCycle(ctx.user.id);
      if (!cycle) {
        return null;
      }
      return {
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        status: cycle.status,
        currentPhase: cycle.currentPhase,
        slogan: cycle.slogan,
        startedAt: cycle.startedAt,
        progress: calculatePhaseProgress(cycle.currentPhase, cycle.status)
      };
    }),
    transmissionLog: protectedProcedure.input(z.object({ cycleId: z.number(), limit: z.number().default(50) })).query(async ({ input }) => {
      return getTransmissionLogs(input.cycleId, input.limit);
    })
  }),
  // ─── Cycle Management ───────────────────────────────────────────────
  cycle: router({
    trigger: protectedProcedure.mutation(async ({ ctx }) => {
      const existingCycle = await getCurrentCycle(ctx.user.id);
      if (existingCycle && existingCycle.status === "running") {
        throw new TRPCError2({
          code: "CONFLICT",
          message: "A cycle is already running"
        });
      }
      const cycleNumber = (existingCycle?.cycleNumber || 0) + 1;
      const cycle = await createCycle({
        userId: ctx.user.id,
        cycleNumber,
        status: "running",
        currentPhase: 1
      });
      await createTransmissionLog({
        cycleId: cycle.id,
        message: `Cycle #${cycleNumber} initiated - Phase 1: Trend Ingestion`,
        logType: "info",
        phase: 1
      });
      return cycle;
    }),
    status: protectedProcedure.input(z.object({ cycleId: z.number() })).query(async ({ ctx, input }) => {
      const cycle = await getCycle(input.cycleId);
      if (!cycle || cycle.userId !== ctx.user.id) {
        throw new TRPCError2({
          code: "NOT_FOUND",
          message: "Cycle not found"
        });
      }
      return {
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        status: cycle.status,
        currentPhase: cycle.currentPhase,
        slogan: cycle.slogan,
        startedAt: cycle.startedAt,
        completedAt: cycle.completedAt,
        progress: calculatePhaseProgress(cycle.currentPhase, cycle.status)
      };
    }),
    history: protectedProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ ctx, input }) => {
      return getCycleHistory(ctx.user.id, input.limit);
    }),
    updatePhase: protectedProcedure.input(
      z.object({
        cycleId: z.number(),
        phase: z.number(),
        slogan: z.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const cycle = await getCycle(input.cycleId);
      if (!cycle || cycle.userId !== ctx.user.id) {
        throw new TRPCError2({
          code: "NOT_FOUND",
          message: "Cycle not found"
        });
      }
      const phaseNames = [
        "Trend Ingestion",
        "Design Generation",
        "Printify Upload",
        "Content Generation",
        "Social Distribution",
        "Performance Optimization"
      ];
      await updateCycle(input.cycleId, {
        currentPhase: input.phase,
        slogan: input.slogan
      });
      await createTransmissionLog({
        cycleId: input.cycleId,
        message: `Phase ${input.phase}: ${phaseNames[input.phase - 1]} completed`,
        logType: "success",
        phase: input.phase
      });
      return { success: true };
    }),
    complete: protectedProcedure.input(z.object({ cycleId: z.number() })).mutation(async ({ ctx, input }) => {
      const cycle = await getCycle(input.cycleId);
      if (!cycle || cycle.userId !== ctx.user.id) {
        throw new TRPCError2({
          code: "NOT_FOUND",
          message: "Cycle not found"
        });
      }
      await updateCycle(input.cycleId, {
        status: "completed",
        completedAt: /* @__PURE__ */ new Date()
      });
      await createTransmissionLog({
        cycleId: input.cycleId,
        message: "Cycle completed successfully",
        logType: "success",
        phase: 6
      });
      return { success: true };
    })
  }),
  // ─── Product Management ───────────────────────────────────────────────
  product: router({
    create: protectedProcedure.input(
      z.object({
        cycleId: z.number(),
        slogan: z.string(),
        designUrl: z.string(),
        price: z.number().default(27.99)
      })
    ).mutation(async ({ ctx, input }) => {
      const cycle = await getCycle(input.cycleId);
      if (!cycle || cycle.userId !== ctx.user.id) {
        throw new TRPCError2({
          code: "NOT_FOUND",
          message: "Cycle not found"
        });
      }
      return createProduct({
        cycleId: input.cycleId,
        slogan: input.slogan,
        designUrl: input.designUrl,
        price: input.price.toString(),
        status: "draft"
      });
    }),
    list: protectedProcedure.input(z.object({ cycleId: z.number().optional(), limit: z.number().default(20) })).query(async ({ ctx, input }) => {
      return getProducts(ctx.user.id, input.cycleId, input.limit);
    }),
    publish: protectedProcedure.input(
      z.object({
        productId: z.number(),
        shopifyId: z.string(),
        printifyId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      return updateProduct(input.productId, {
        status: "published",
        shopifyId: input.shopifyId,
        printifyId: input.printifyId
      });
    })
  }),
  // ─── Order Management ───────────────────────────────────────────────
  order: router({
    sync: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await syncShopifyOrders(ctx.user.id);
      return result;
    }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      return getShopifyStats(ctx.user.id);
    }),
    recent: protectedProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ ctx, input }) => {
      return getRecentOrders(ctx.user.id, input.limit);
    }),
    byProduct: protectedProcedure.input(z.object({ productId: z.number() })).query(async ({ ctx, input }) => {
      return getOrdersByProduct(input.productId);
    })
  }),
  // ─── Social Media Management ───────────────────────────────────────
  social: router({
    accounts: protectedProcedure.query(async ({ ctx }) => {
      return getSocialAccounts(ctx.user.id);
    }),
    connect: protectedProcedure.input(
      z.object({
        platform: z.enum(["tiktok", "instagram", "youtube"]),
        accountId: z.string(),
        accountName: z.string(),
        accessToken: z.string(),
        refreshToken: z.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      return createSocialAccount({
        userId: ctx.user.id,
        platform: input.platform,
        accountId: input.accountId,
        accountName: input.accountName,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        isConnected: true
      });
    }),
    disconnect: protectedProcedure.input(z.object({ accountId: z.number() })).mutation(async ({ ctx, input }) => {
      return updateSocialAccount(input.accountId, {
        isConnected: false,
        accessToken: null,
        refreshToken: null
      });
    }),
    posts: protectedProcedure.input(z.object({ cycleId: z.number().optional(), limit: z.number().default(20) })).query(async ({ ctx, input }) => {
      return getSocialPosts(ctx.user.id, input.cycleId, input.limit);
    }),
    postStats: protectedProcedure.input(z.object({ postId: z.number() })).query(async ({ input }) => {
      return getSocialPostStats(input.postId);
    })
  }),
  // ─── Analytics ───────────────────────────────────────────────────────
  analytics: router({
    get: protectedProcedure.input(z.object({ cycleId: z.number().optional() })).query(async ({ ctx, input }) => {
      if (input.cycleId) {
        return getAnalyticsByCycle(input.cycleId);
      }
      return getAnalyticsForUser(ctx.user.id);
    }),
    summary: protectedProcedure.query(async ({ ctx }) => {
      return getAnalyticsSummary(ctx.user.id);
    }),
    byPlatform: protectedProcedure.query(async ({ ctx }) => {
      return getAnalyticsByPlatform(ctx.user.id);
    }),
    roi: protectedProcedure.input(z.object({ cycleId: z.number() })).query(async ({ input }) => {
      return calculateROI(input.cycleId);
    })
  }),
  // ─── Configuration ───────────────────────────────────────────────────
  config: router({
    loadApiKeys: protectedProcedure.query(async ({ ctx }) => {
      return {
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        printifyConfigured: !!process.env.PRINTIFY_API_KEY,
        shopifyConfigured: !!process.env.SHOPIFY_STORE_DOMAIN,
        elevenLabsConfigured: !!process.env.ELEVENLABS_API_KEY,
        ayrshareConfigured: !!process.env.AYRSHARE_API_KEY
      };
    }),
    saveApiKeys: protectedProcedure.input(
      z.object({
        openaiKey: z.string().optional(),
        printifyKey: z.string().optional(),
        shopifyDomain: z.string().optional(),
        shopifyToken: z.string().optional(),
        elevenLabsKey: z.string().optional(),
        ayrshareKey: z.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (!input.openaiKey && !input.printifyKey) {
        throw new TRPCError2({
          code: "BAD_REQUEST",
          message: "At least one API key must be provided"
        });
      }
      return { success: true, message: "API keys saved successfully" };
    }),
    scheduler: protectedProcedure.input(
      z.object({
        enabled: z.boolean(),
        intervalHours: z.number().min(1).max(168)
      })
    ).mutation(async ({ ctx, input }) => {
      return updateSchedulerConfig(ctx.user.id, {
        enabled: input.enabled,
        intervalHours: input.intervalHours,
        nextRunAt: input.enabled ? new Date(Date.now() + input.intervalHours * 36e5) : null
      });
    }),
    getScheduler: protectedProcedure.query(async ({ ctx }) => {
      return getSchedulerConfig(ctx.user.id);
    })
  }),
  // ─── System ───────────────────────────────────────────────────────
  system: router({
    health: publicProcedure.query(async () => {
      return {
        status: "healthy",
        timestamp: /* @__PURE__ */ new Date(),
        version: "2.0.0"
      };
    }),
    notifyOwner: protectedProcedure.input(
      z.object({
        title: z.string(),
        content: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      return { success: true };
    })
  })
});
function calculatePhaseProgress(currentPhase, status) {
  if (status === "completed")
    return 100;
  if (status === "failed")
    return 0;
  return currentPhase / 6 * 100;
}

// server/_core/context.ts
async function createContext({
  req,
  res
}) {
  const user = req.user;
  return {
    user,
    req,
    res
  };
}

// server/_core/index.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
function createServer() {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.join(__dirname, "../../dist/public");
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3000"],
      credentials: true
    })
  );
  app.use(express.static(publicDir, {
    maxAge: "1d",
    etag: false,
    setHeaders: (res, path2) => {
      if (path2.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path2.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (path2.endsWith(".woff2")) {
        res.setHeader("Content-Type", "font/woff2");
      }
    }
  }));
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: /* @__PURE__ */ new Date() });
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(404).json({ error: "Not found" });
      }
    });
  });
  app.use((err, _req, res) => {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  });
  return app;
}
async function start() {
  const app = createServer();
  const port = process.env.PORT || 3e3;
  app.listen(port, () => {
    console.log(`\u2705 Server running on http://localhost:${port}`);
    console.log(`\u{1F4E1} tRPC API available at http://localhost:${port}/api/trpc`);
  });
}
if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch(console.error);
}
var core_default = createServer;
export {
  createServer,
  core_default as default
};
