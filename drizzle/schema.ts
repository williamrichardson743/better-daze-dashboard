import { mysqlTable, int, varchar, timestamp, text, float, boolean, index, sqlEnum, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ─── Users & Authentication ───────────────────────────────────────────────

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  openId: varchar('open_id', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }),
  role: sqlEnum('role', ['admin', 'user']).default('user'),
  subscriptionTier: sqlEnum('subscription_tier', ['free', 'pro', 'enterprise']).default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  openIdIdx: index('open_id_idx').on(table.openId),
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// ─── Social Media Accounts ───────────────────────────────────────────────

export const socialAccounts = mysqlTable('social_accounts', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  platform: sqlEnum('platform', ['tiktok', 'instagram', 'youtube']).notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  accountName: varchar('account_name', { length: 255 }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  followers: int('followers').default(0),
  isConnected: boolean('is_connected').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  platformIdx: index('platform_idx').on(table.platform),
}));

export type InsertSocialAccount = typeof socialAccounts.$inferInsert;
export type SelectSocialAccount = typeof socialAccounts.$inferSelect;

// ─── Cycles (6-Phase Workflow) ───────────────────────────────────────────

export const cycles = mysqlTable('cycles', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  cycleNumber: int('cycle_number').notNull(),
  status: sqlEnum('status', ['pending', 'running', 'completed', 'failed']).default('pending'),
  currentPhase: int('current_phase').default(0),
  slogan: varchar('slogan', { length: 255 }),
  theme: varchar('theme', { length: 255 }),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
}));

export type InsertCycle = typeof cycles.$inferInsert;
export type SelectCycle = typeof cycles.$inferSelect;

// ─── Products ───────────────────────────────────────────────────────────

export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  cycleId: int('cycle_id').notNull(),
  printifyId: varchar('printify_id', { length: 255 }),
  shopifyId: varchar('shopify_id', { length: 255 }),
  slogan: varchar('slogan', { length: 255 }).notNull(),
  designUrl: varchar('design_url', { length: 255 }),
  price: decimal('price', { precision: 10, scale: 2 }).default('27.99'),
  status: sqlEnum('status', ['draft', 'published', 'archived']).default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  cycleIdIdx: index('cycle_id_idx').on(table.cycleId),
}));

export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────

export const orders = mysqlTable('orders', {
  id: int('id').primaryKey().autoincrement(),
  productId: int('product_id').notNull(),
  shopifyOrderId: varchar('shopify_order_id', { length: 255 }).unique(),
  customerEmail: varchar('customer_email', { length: 255 }),
  quantity: int('quantity').default(1),
  revenue: decimal('revenue', { precision: 10, scale: 2 }),
  status: sqlEnum('status', ['pending', 'paid', 'fulfilled', 'cancelled']).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  productIdIdx: index('product_id_idx').on(table.productId),
  statusIdx: index('status_idx').on(table.status),
}));

export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;

// ─── Social Posts ───────────────────────────────────────────────────────

export const socialPosts = mysqlTable('social_posts', {
  id: int('id').primaryKey().autoincrement(),
  cycleId: int('cycle_id').notNull(),
  platform: sqlEnum('platform', ['tiktok', 'instagram', 'youtube']).notNull(),
  postId: varchar('post_id', { length: 255 }),
  contentUrl: varchar('content_url', { length: 255 }),
  caption: text('caption'),
  postedAt: timestamp('posted_at'),
  views: int('views').default(0),
  likes: int('likes').default(0),
  shares: int('shares').default(0),
  comments: int('comments').default(0),
  saves: int('saves').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  cycleIdIdx: index('cycle_id_idx').on(table.cycleId),
  platformIdx: index('platform_idx').on(table.platform),
}));

export type InsertSocialPost = typeof socialPosts.$inferInsert;
export type SelectSocialPost = typeof socialPosts.$inferSelect;

// ─── Analytics ───────────────────────────────────────────────────────

export const analytics = mysqlTable('analytics', {
  id: int('id').primaryKey().autoincrement(),
  cycleId: int('cycle_id').notNull(),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  totalViews: int('total_views').default(0),
  totalEngagement: int('total_engagement').default(0),
  roi: decimal('roi', { precision: 5, scale: 2 }).default('0'),
  bestPlatform: varchar('best_platform', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  cycleIdIdx: index('cycle_id_idx').on(table.cycleId),
}));

export type InsertAnalytics = typeof analytics.$inferInsert;
export type SelectAnalytics = typeof analytics.$inferSelect;

// ─── Transmission Logs ───────────────────────────────────────────────────

export const transmissionLogs = mysqlTable('transmission_logs', {
  id: int('id').primaryKey().autoincrement(),
  cycleId: int('cycle_id').notNull(),
  message: text('message').notNull(),
  logType: sqlEnum('log_type', ['info', 'success', 'warn', 'error']).default('info'),
  phase: int('phase').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  cycleIdIdx: index('cycle_id_idx').on(table.cycleId),
}));

export type InsertTransmissionLog = typeof transmissionLogs.$inferInsert;
export type SelectTransmissionLog = typeof transmissionLogs.$inferSelect;

// ─── Scheduler Configuration ───────────────────────────────────────────

export const schedulerConfig = mysqlTable('scheduler_config', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  enabled: boolean('enabled').default(true),
  intervalHours: int('interval_hours').default(72),
  nextRunAt: timestamp('next_run_at'),
  lastRunAt: timestamp('last_run_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
}));

export type InsertSchedulerConfig = typeof schedulerConfig.$inferInsert;
export type SelectSchedulerConfig = typeof schedulerConfig.$inferSelect;

// ─── Relations ───────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  cycles: many(cycles),
  socialAccounts: many(socialAccounts),
  schedulerConfig: many(schedulerConfig),
}));

export const cyclesRelations = relations(cycles, ({ one, many }) => ({
  user: one(users, { fields: [cycles.userId], references: [users.id] }),
  products: many(products),
  socialPosts: many(socialPosts),
  analytics: many(analytics),
  logs: many(transmissionLogs),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  cycle: one(cycles, { fields: [products.cycleId], references: [cycles.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, { fields: [orders.productId], references: [products.id] }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  cycle: one(cycles, { fields: [socialPosts.cycleId], references: [cycles.id] }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  cycle: one(cycles, { fields: [analytics.cycleId], references: [cycles.id] }),
}));

export const transmissionLogsRelations = relations(transmissionLogs, ({ one }) => ({
  cycle: one(cycles, { fields: [transmissionLogs.cycleId], references: [cycles.id] }),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  user: one(users, { fields: [socialAccounts.userId], references: [users.id] }),
}));

export const schedulerConfigRelations = relations(schedulerConfig, ({ one }) => ({
  user: one(users, { fields: [schedulerConfig.userId], references: [users.id] }),
}));
