import { db } from './_core/db';
import {
  users,
  cycles,
  products,
  orders,
  socialAccounts,
  socialPosts,
  analytics,
  transmissionLogs,
  schedulerConfig,
} from '../drizzle/schema';
import { eq, desc, and, sum } from 'drizzle-orm';

/**
 * User Management
 */
export async function upsertUser(openId: string, email: string, name?: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.openId, openId),
  });

  if (existing) {
    return existing;
  }

  const [user] = await db.insert(users).values({
    openId,
    email,
    name,
  });

  return user;
}

export async function getUser(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

/**
 * Cycle Management
 */
export async function createCycle(data: {
  userId: number;
  cycleNumber: number;
  status: string;
  currentPhase: number;
}) {
  const [cycle] = await db.insert(cycles).values(data);
  return cycle;
}

export async function getCycle(cycleId: number) {
  return db.query.cycles.findFirst({
    where: eq(cycles.id, cycleId),
  });
}

export async function getCurrentCycle(userId: number) {
  return db.query.cycles.findFirst({
    where: and(eq(cycles.userId, userId), eq(cycles.status, 'running')),
    orderBy: desc(cycles.createdAt),
  });
}

export async function updateCycle(cycleId: number, data: Partial<typeof cycles.$inferInsert>) {
  const [updated] = await db
    .update(cycles)
    .set(data)
    .where(eq(cycles.id, cycleId));
  return updated;
}

export async function getCycleHistory(userId: number, limit: number = 10) {
  return db.query.cycles.findMany({
    where: eq(cycles.userId, userId),
    orderBy: desc(cycles.createdAt),
    limit,
  });
}

/**
 * Product Management
 */
export async function createProduct(data: typeof products.$inferInsert) {
  const [product] = await db.insert(products).values(data);
  return product;
}

export async function getProducts(userId: number, cycleId?: number, limit: number = 20) {
  const where = cycleId
    ? and(eq(products.cycleId, cycleId))
    : undefined;

  return db.query.products.findMany({
    where,
    orderBy: desc(products.createdAt),
    limit,
  });
}

export async function updateProduct(productId: number, data: Partial<typeof products.$inferInsert>) {
  const [updated] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, productId));
  return updated;
}

/**
 * Order Management
 */
export async function syncShopifyOrders(userId: number) {
  // This would call Shopify API to fetch orders
  // For now, return mock data
  return {
    synced: 0,
    created: 0,
    updated: 0,
  };
}

export async function getShopifyStats(userId: number) {
  const orderStats = await db
    .select({
      totalRevenue: sum(orders.revenue),
      totalUnits: sum(orders.quantity),
    })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .innerJoin(cycles, eq(products.cycleId, cycles.id))
    .where(eq(cycles.userId, userId));

  const productCount = await db
    .select()
    .from(products)
    .innerJoin(cycles, eq(products.cycleId, cycles.id))
    .where(eq(cycles.userId, userId));

  const cycleCount = await db
    .select()
    .from(cycles)
    .where(and(eq(cycles.userId, userId), eq(cycles.status, 'completed')));

  return {
    totalRevenue: orderStats[0]?.totalRevenue || 0,
    totalUnits: orderStats[0]?.totalUnits || 0,
    activeProducts: productCount.length,
    cyclesRun: cycleCount.length,
  };
}

export async function getRecentOrders(userId: number, limit: number = 10) {
  return db.query.orders.findMany({
    limit,
    orderBy: desc(orders.createdAt),
  });
}

export async function getOrdersByProduct(productId: number) {
  return db.query.orders.findMany({
    where: eq(orders.productId, productId),
    orderBy: desc(orders.createdAt),
  });
}

/**
 * Social Media Management
 */
export async function createSocialAccount(data: typeof socialAccounts.$inferInsert) {
  const [account] = await db.insert(socialAccounts).values(data);
  return account;
}

export async function getSocialAccounts(userId: number) {
  return db.query.socialAccounts.findMany({
    where: eq(socialAccounts.userId, userId),
  });
}

export async function updateSocialAccount(
  accountId: number,
  data: Partial<typeof socialAccounts.$inferInsert>
) {
  const [updated] = await db
    .update(socialAccounts)
    .set(data)
    .where(eq(socialAccounts.id, accountId));
  return updated;
}

export async function getSocialStats(userId: number) {
  // This would aggregate stats from all social platforms
  return {
    tiktokViews: 0,
    instagramReach: 0,
    youtubeViews: 0,
  };
}

export async function createSocialPost(data: typeof socialPosts.$inferInsert) {
  const [post] = await db.insert(socialPosts).values(data);
  return post;
}

export async function getSocialPosts(userId: number, cycleId?: number, limit: number = 20) {
  const where = cycleId ? eq(socialPosts.cycleId, cycleId) : undefined;

  return db.query.socialPosts.findMany({
    where,
    orderBy: desc(socialPosts.createdAt),
    limit,
  });
}

export async function getSocialPostStats(postId: number) {
  return db.query.socialPosts.findFirst({
    where: eq(socialPosts.id, postId),
  });
}

/**
 * Analytics
 */
export async function createAnalytics(data: typeof analytics.$inferInsert) {
  const [record] = await db.insert(analytics).values(data);
  return record;
}

export async function getAnalyticsByCycle(cycleId: number) {
  return db.query.analytics.findFirst({
    where: eq(analytics.cycleId, cycleId),
  });
}

export async function getAnalyticsForUser(userId: number) {
  return db.query.analytics.findMany({
    limit: 30,
    orderBy: desc(analytics.createdAt),
  });
}

export async function getAnalyticsSummary(userId: number) {
  // Aggregate analytics across all cycles
  return {
    totalRevenue: 0,
    totalViews: 0,
    totalEngagement: 0,
    averageROI: 0,
  };
}

export async function getAnalyticsByPlatform(userId: number) {
  return {
    tiktok: { views: 0, engagement: 0, revenue: 0 },
    instagram: { views: 0, engagement: 0, revenue: 0 },
    youtube: { views: 0, engagement: 0, revenue: 0 },
  };
}

export async function calculateROI(cycleId: number) {
  const analytics_record = await getAnalyticsByCycle(cycleId);
  return analytics_record?.roi || 0;
}

/**
 * Transmission Logs
 */
export async function createTransmissionLog(data: typeof transmissionLogs.$inferInsert) {
  const [log] = await db.insert(transmissionLogs).values(data);
  return log;
}

export async function getTransmissionLogs(cycleId: number, limit: number = 50) {
  return db.query.transmissionLogs.findMany({
    where: eq(transmissionLogs.cycleId, cycleId),
    orderBy: desc(transmissionLogs.createdAt),
    limit,
  });
}

/**
 * Scheduler Configuration
 */
export async function updateSchedulerConfig(
  userId: number,
  data: Partial<typeof schedulerConfig.$inferInsert>
) {
  const existing = await db.query.schedulerConfig.findFirst({
    where: eq(schedulerConfig.userId, userId),
  });

  if (existing) {
    const [updated] = await db
      .update(schedulerConfig)
      .set(data)
      .where(eq(schedulerConfig.userId, userId));
    return updated;
  }

  const [created] = await db.insert(schedulerConfig).values({
    userId,
    ...data,
  });
  return created;
}

export async function getSchedulerConfig(userId: number) {
  return db.query.schedulerConfig.findFirst({
    where: eq(schedulerConfig.userId, userId),
  });
}
