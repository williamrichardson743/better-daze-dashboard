/**
 * Better Daze — Postgres (Supabase) schema.
 *
 * Converted from MySQL/TiDB per backlog tickets B-01..B-04. Conversion rules
 * are recorded in docs/migration/mysql-to-postgres-matrix.md; change that
 * document whenever a rule below changes.
 *
 *   mysqlTable                  -> pgTable
 *   serial (bigint unsigned)    -> bigserial({ mode: "number" })
 *   bigint unsigned FK          -> bigint({ mode: "number" }) + explicit .references()
 *   mysqlEnum                   -> pgEnum (named "<table>_<column>")
 *   json                        -> jsonb
 *   timestamp                   -> timestamp with time zone
 *   int                         -> integer
 */

import {
  pgTable,
  pgEnum,
  bigserial,
  bigint,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── COLUMN HELPERS ──────────────────────────────────────────────────────────
// Every timestamp is stored with a time zone so UTC offsets survive the
// migration; MySQL TIMESTAMP had no offset and was read back as server-local.

const pk = () => bigserial("id", { mode: "number" }).primaryKey();
const fk = (name: string) => bigint(name, { mode: "number" });
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const createdAt = () => ts("createdAt").defaultNow().notNull();
const updatedAt = () =>
  ts("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

// ─── ENUM TYPES ──────────────────────────────────────────────────────────────
// Postgres enums are database-level types, so each one is declared once and
// reused only where the value set is genuinely identical.

export const usersRoleEnum = pgEnum("users_role", ["user", "admin", "viewer"]);
export const usersStatusEnum = pgEnum("users_status", ["active", "inactive"]);

export const cyclesStatusEnum = pgEnum("cycles_status", [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
]);
export const cyclePhaseEnum = pgEnum("cycle_phase", [
  "ideation",
  "design",
  "review",
  "production",
  "marketing",
  "complete",
]);

export const productsTypeEnum = pgEnum("products_type", [
  "tshirt",
  "hoodie",
  "mug",
  "poster",
  "sticker",
  "hat",
  "tote",
  "other",
]);
export const productsStatusEnum = pgEnum("products_status", [
  "draft",
  "pending",
  "approved",
  "live",
  "sold_out",
  "discontinued",
]);

export const ordersStatusEnum = pgEnum("orders_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "tiktok",
  "twitter",
  "facebook",
  "pinterest",
  "youtube",
  "other",
]);
export const socialAccountsStatusEnum = pgEnum("social_accounts_status", [
  "active",
  "expired",
  "disconnected",
  "error",
]);
export const socialPostsStatusEnum = pgEnum("social_posts_status", [
  "scheduled",
  "published",
  "failed",
  "draft",
]);
export const socialTemplatesPlatformEnum = pgEnum("social_templates_platform", [
  "instagram",
  "tiktok",
  "twitter",
  "facebook",
  "pinterest",
]);

export const transmissionLogsTypeEnum = pgEnum("transmission_logs_type", [
  "info",
  "warning",
  "error",
  "success",
  "debug",
]);

export const adminSettingsThemeEnum = pgEnum("admin_settings_theme", [
  "light",
  "dark",
  "auto",
]);
export const adminSettingsNotificationFrequencyEnum = pgEnum(
  "admin_settings_notification_frequency",
  ["instant", "daily", "weekly"]
);
export const adminSettingsDefaultViewEnum = pgEnum("admin_settings_default_view", [
  "grid",
  "list",
]);
export const adminSettingsCycleFrequencyEnum = pgEnum(
  "admin_settings_cycle_frequency",
  ["daily", "weekly", "monthly"]
);

export const loginHistoryStatusEnum = pgEnum("login_history_status", [
  "success",
  "failed",
]);

export const permissionsResourceEnum = pgEnum("permissions_resource", [
  "products",
  "orders",
  "cycles",
  "users",
  "settings",
  "analytics",
  "social",
]);
export const permissionsActionEnum = pgEnum("permissions_action", [
  "create",
  "read",
  "update",
  "delete",
]);

export const subscriptionsPlanEnum = pgEnum("subscriptions_plan", [
  "starter",
  "growth",
  "enterprise",
]);
export const subscriptionsStatusEnum = pgEnum("subscriptions_status", [
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "trialing",
]);

export const customerOrdersStatusEnum = pgEnum("customer_orders_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);
export const customerOrdersFulfillmentStatusEnum = pgEnum(
  "customer_orders_fulfillment_status",
  ["unfulfilled", "pending", "fulfilled", "partial", "returned"]
);
export const customerOrdersPaymentStatusEnum = pgEnum(
  "customer_orders_payment_status",
  ["pending", "paid", "failed", "refunded"]
);

export const campaignsStatusEnum = pgEnum("campaigns_status", [
  "draft",
  "scheduled",
  "active",
  "paused",
  "completed",
]);
export const campaignsPostFrequencyEnum = pgEnum("campaigns_post_frequency", [
  "hourly",
  "daily",
  "weekly",
]);

export const pipelineRunsStatusEnum = pgEnum("pipeline_runs_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);
export const pipelineRunsPhaseEnum = pgEnum("pipeline_runs_phase", [
  "trend",
  "design",
  "printify",
  "shopify",
  "social",
  "log",
  "complete",
]);
// Shared by all six per-phase status columns; identical value set in MySQL.
export const pipelinePhaseStatusEnum = pgEnum("pipeline_phase_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
]);

export const actionItemsSectionEnum = pgEnum("action_items_section", [
  "immediate",
  "short_term",
  "deferred",
]);
export const actionItemsPriorityEnum = pgEnum("action_items_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const actionItemsStatusEnum = pgEnum("action_items_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const agentTasksStatusEnum = pgEnum("agent_tasks_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "blocked",
]);
export const agentTasksPriorityEnum = pgEnum("agent_tasks_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const agentTasksCategoryEnum = pgEnum("agent_tasks_category", [
  "immediate",
  "short_term",
  "deferred",
  "01_content_creation",
  "02_platform_presence",
  "03_email_dm_outreach",
]);

export const agentMessagesTypeEnum = pgEnum("agent_messages_type", [
  "status_update",
  "question",
  "result",
  "error",
  "broadcast",
  "handoff",
]);

export const agentAssignmentsStatusEnum = pgEnum("agent_assignments_status", [
  "assigned",
  "started",
  "completed",
  "failed",
]);

export const apiCredentialsStatusEnum = pgEnum("api_credentials_status", [
  "active",
  "expiring",
  "expired",
  "needs_rotation",
  "error",
  "unknown",
]);

export const agentsStatusEnum = pgEnum("agents_status", [
  "idle",
  "busy",
  "offline",
  "error",
]);

// ─── CORE TABLES ─────────────────────────────────────────────────────────────

// Waitlist signups (public email capture for marketing pushes)
export const waitlistSignups = pgTable("waitlistSignups", {
  id: pk(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 100 }),
  createdAt: createdAt(),
});

export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type InsertWaitlistSignup = typeof waitlistSignups.$inferInsert;

// Users table (extended from auth scaffold)
export const users = pgTable("users", {
  id: pk(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: usersRoleEnum("role").default("user").notNull(),
  status: usersStatusEnum("status").default("active").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  lastSignInAt: ts("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Cycles table (POD design cycles)
export const cycles = pgTable(
  "cycles",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cycleNumber: integer("cycleNumber").notNull(),
    name: varchar("name", { length: 255 }),
    status: cyclesStatusEnum("status").default("draft").notNull(),
    currentPhase: cyclePhaseEnum("currentPhase").default("ideation").notNull(),
    startDate: ts("startDate"),
    endDate: ts("endDate"),
    targetRevenue: decimal("targetRevenue", { precision: 10, scale: 2 }),
    actualRevenue: decimal("actualRevenue", { precision: 10, scale: 2 }).default(
      "0.00"
    ),
    slogan: varchar("slogan", { length: 500 }),
    theme: varchar("theme", { length: 100 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cycles_userId_idx").on(table.userId),
    index("cycles_status_idx").on(table.status),
    uniqueIndex("cycles_userId_cycleNumber_key").on(table.userId, table.cycleNumber),
  ]
);

export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = typeof cycles.$inferInsert;

// Products table
export const products = pgTable(
  "products",
  {
    id: pk(),
    cycleId: fk("cycleId")
      .notNull()
      .references(() => cycles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }),
    description: text("description"),
    slogan: varchar("slogan", { length: 500 }),
    designUrl: varchar("designUrl", { length: 500 }),
    mockupUrl: varchar("mockupUrl", { length: 500 }),
    productType: productsTypeEnum("productType").default("tshirt").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    cost: decimal("cost", { precision: 10, scale: 2 }),
    status: productsStatusEnum("status").default("draft").notNull(),
    inventory: integer("inventory").default(0),
    salesCount: integer("salesCount").default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("products_cycleId_idx").on(table.cycleId),
    index("products_status_idx").on(table.status),
    uniqueIndex("products_sku_key").on(table.sku),
  ]
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table (internal revenue records)
export const orders = pgTable(
  "orders",
  {
    id: pk(),
    productId: fk("productId")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    shopifyOrderId: varchar("shopifyOrderId", { length: 100 }),
    customerName: varchar("customerName", { length: 255 }),
    customerEmail: varchar("customerEmail", { length: 320 }),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).notNull(),
    status: ordersStatusEnum("status").default("pending").notNull(),
    shippingAddress: jsonb("shippingAddress"),
    trackingNumber: varchar("trackingNumber", { length: 100 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("orders_productId_idx").on(table.productId),
    index("orders_createdAt_idx").on(table.createdAt),
    uniqueIndex("orders_shopifyOrderId_key").on(table.shopifyOrderId),
  ]
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Social accounts table
export const socialAccounts = pgTable(
  "socialAccounts",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    accountHandle: varchar("accountHandle", { length: 255 }),
    accountId: varchar("accountId", { length: 255 }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    followerCount: integer("followerCount").default(0),
    status: socialAccountsStatusEnum("status").default("active").notNull(),
    lastSyncAt: ts("lastSyncAt"),
    createdAt: createdAt(),
  },
  (table) => [index("socialAccounts_userId_idx").on(table.userId)]
);

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

// Social posts table
export const socialPosts = pgTable(
  "socialPosts",
  {
    id: pk(),
    cycleId: fk("cycleId")
      .notNull()
      .references(() => cycles.id, { onDelete: "cascade" }),
    accountId: fk("accountId")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    postId: varchar("postId", { length: 255 }),
    content: text("content"),
    mediaUrls: jsonb("mediaUrls"),
    status: socialPostsStatusEnum("status").default("draft").notNull(),
    scheduledAt: ts("scheduledAt"),
    publishedAt: ts("publishedAt"),
    metrics: jsonb("metrics"),
    createdAt: createdAt(),
  },
  (table) => [
    index("socialPosts_cycleId_idx").on(table.cycleId),
    index("socialPosts_accountId_idx").on(table.accountId),
    index("socialPosts_status_idx").on(table.status),
  ]
);

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;

// Transmission logs table
export const transmissionLogs = pgTable(
  "transmissionLogs",
  {
    id: pk(),
    cycleId: fk("cycleId")
      .notNull()
      .references(() => cycles.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    logType: transmissionLogsTypeEnum("logType").default("info").notNull(),
    phase: cyclePhaseEnum("phase").default("ideation").notNull(),
    metadata: jsonb("metadata"),
    createdAt: createdAt(),
  },
  (table) => [
    index("transmissionLogs_cycleId_idx").on(table.cycleId),
    index("transmissionLogs_createdAt_idx").on(table.createdAt),
  ]
);

export type TransmissionLog = typeof transmissionLogs.$inferSelect;
export type InsertTransmissionLog = typeof transmissionLogs.$inferInsert;

// Admin settings table
export const adminSettings = pgTable(
  "adminSettings",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    theme: adminSettingsThemeEnum("theme").default("auto").notNull(),
    emailNotifications: boolean("emailNotifications").default(true),
    inAppNotifications: boolean("inAppNotifications").default(true),
    notificationFrequency: adminSettingsNotificationFrequencyEnum(
      "notificationFrequency"
    )
      .default("daily")
      .notNull(),
    itemsPerPage: integer("itemsPerPage").default(20),
    defaultView: adminSettingsDefaultViewEnum("defaultView")
      .default("grid")
      .notNull(),
    autoPublish: boolean("autoPublish").default(false),
    cycleFrequency: adminSettingsCycleFrequencyEnum("cycleFrequency")
      .default("weekly")
      .notNull(),
    companyName: varchar("companyName", { length: 255 }).default("Better Daze"),
    logoUrl: varchar("logoUrl", { length: 500 }),
    primaryColor: varchar("primaryColor", { length: 7 }).default("#6366f1"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("adminSettings_userId_key").on(table.userId)]
);

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;

// API keys table
export const apiKeys = pgTable(
  "apiKeys",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    keyHash: varchar("keyHash", { length: 255 }).notNull(),
    permissions: jsonb("permissions"),
    createdAt: createdAt(),
    lastUsed: ts("lastUsed"),
    expiresAt: ts("expiresAt"),
  },
  (table) => [
    index("apiKeys_userId_idx").on(table.userId),
    uniqueIndex("apiKeys_keyHash_key").on(table.keyHash),
  ]
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// Sessions table (custom GitHub OAuth sessions; ownership stays with the app)
export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: varchar("userAgent", { length: 500 }),
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: createdAt(),
    lastActivity: ts("lastActivity").defaultNow().notNull(),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)]
);

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// Login history table
export const loginHistory = pgTable(
  "loginHistory",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    timestamp: ts("timestamp").defaultNow().notNull(),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: varchar("userAgent", { length: 500 }),
    status: loginHistoryStatusEnum("status").notNull(),
    failureReason: varchar("failureReason", { length: 255 }),
  },
  (table) => [
    index("loginHistory_userId_idx").on(table.userId),
    index("loginHistory_timestamp_idx").on(table.timestamp),
  ]
);

export type LoginRecord = typeof loginHistory.$inferSelect;
export type InsertLoginRecord = typeof loginHistory.$inferInsert;

// Roles table
export const roles = pgTable("roles", {
  id: pk(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  isCustom: boolean("isCustom").default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

// Permissions table
export const permissions = pgTable(
  "permissions",
  {
    id: pk(),
    roleId: fk("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    resource: permissionsResourceEnum("resource").notNull(),
    action: permissionsActionEnum("action").notNull(),
    granted: boolean("granted").default(false),
  },
  (table) => [
    uniqueIndex("permissions_roleId_resource_action_key").on(
      table.roleId,
      table.resource,
      table.action
    ),
  ]
);

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

// Audit log table
export const auditLogs = pgTable(
  "auditLogs",
  {
    id: pk(),
    userId: fk("userId").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    resource: varchar("resource", { length: 50 }).notNull(),
    details: jsonb("details"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    timestamp: ts("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("auditLogs_userId_idx").on(table.userId),
    index("auditLogs_timestamp_idx").on(table.timestamp),
  ]
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Subscriptions table (Stripe billing)
export const subscriptions = pgTable("subscriptions", {
  id: pk(),
  userId: fk("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  plan: subscriptionsPlanEnum("plan").default("starter").notNull(),
  status: subscriptionsStatusEnum("status").default("active").notNull(),
  currentPeriodStart: ts("currentPeriodStart"),
  currentPeriodEnd: ts("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── E-COMMERCE TABLES ───────────────────────────────────────────────────────

// Product variants (sizes, colors)
export const productVariants = pgTable(
  "productVariants",
  {
    id: pk(),
    productId: fk("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 100 }),
    size: varchar("size", { length: 20 }),
    color: varchar("color", { length: 50 }),
    colorHex: varchar("colorHex", { length: 7 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    inventory: integer("inventory").default(0),
    createdAt: createdAt(),
  },
  (table) => [
    index("productVariants_productId_idx").on(table.productId),
    uniqueIndex("productVariants_sku_key").on(table.sku),
  ]
);

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// Product images (mockups)
export const productImages = pgTable(
  "productImages",
  {
    id: pk(),
    productId: fk("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: fk("variantId").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    url: varchar("url", { length: 500 }).notNull(),
    alt: varchar("alt", { length: 255 }),
    isPrimary: boolean("isPrimary").default(false),
    sortOrder: integer("sortOrder").default(0),
    createdAt: createdAt(),
  },
  (table) => [
    index("productImages_productId_idx").on(table.productId),
    index("productImages_variantId_idx").on(table.variantId),
  ]
);

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

// Collections / Categories
export const collections = pgTable("collections", {
  id: pk(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: boolean("isActive").default(true),
  sortOrder: integer("sortOrder").default(0),
  createdAt: createdAt(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

// Product to Collection junction
export const productCollections = pgTable(
  "productCollections",
  {
    id: pk(),
    productId: fk("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: fk("collectionId")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("productCollections_productId_collectionId_key").on(
      table.productId,
      table.collectionId
    ),
    index("productCollections_collectionId_idx").on(table.collectionId),
  ]
);

export type ProductCollection = typeof productCollections.$inferSelect;
export type InsertProductCollection = typeof productCollections.$inferInsert;

// Customer orders (public store orders)
export const customerOrders = pgTable(
  "customerOrders",
  {
    id: pk(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull(),
    customerName: varchar("customerName", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    status: customerOrdersStatusEnum("status").default("pending").notNull(),
    fulfillmentStatus: customerOrdersFulfillmentStatusEnum("fulfillmentStatus")
      .default("unfulfilled")
      .notNull(),
    paymentStatus: customerOrdersPaymentStatusEnum("paymentStatus")
      .default("pending")
      .notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0.00"),
    tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    shippingAddress: jsonb("shippingAddress"),
    billingAddress: jsonb("billingAddress"),
    paymentReference: varchar("paymentReference", { length: 255 }),
    trackingNumber: varchar("trackingNumber", { length: 100 }),
    trackingUrl: varchar("trackingUrl", { length: 500 }),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("customerOrders_email_idx").on(table.email),
    index("customerOrders_status_idx").on(table.status),
    index("customerOrders_createdAt_idx").on(table.createdAt),
  ]
);

export type CustomerOrder = typeof customerOrders.$inferSelect;
export type InsertCustomerOrder = typeof customerOrders.$inferInsert;

// Order items (line items)
export const orderItems = pgTable(
  "orderItems",
  {
    id: pk(),
    orderId: fk("orderId")
      .notNull()
      .references(() => customerOrders.id, { onDelete: "cascade" }),
    productId: fk("productId")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: fk("variantId").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    productName: varchar("productName", { length: 255 }).notNull(),
    variantName: varchar("variantName", { length: 100 }),
    sku: varchar("sku", { length: 100 }),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
    imageUrl: varchar("imageUrl", { length: 500 }),
    createdAt: createdAt(),
  },
  (table) => [
    index("orderItems_orderId_idx").on(table.orderId),
    index("orderItems_productId_idx").on(table.productId),
  ]
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Campaigns table (automated marketing)
export const campaigns = pgTable(
  "campaigns",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    cycleId: fk("cycleId").references(() => cycles.id, { onDelete: "set null" }),
    status: campaignsStatusEnum("status").default("draft").notNull(),
    startDate: ts("startDate"),
    endDate: ts("endDate"),
    platforms: jsonb("platforms"), // ["instagram", "tiktok", "twitter"]
    autoPublishProducts: boolean("autoPublishProducts").default(false),
    autoGenerateSocial: boolean("autoGenerateSocial").default(false),
    postFrequency: campaignsPostFrequencyEnum("postFrequency").default("daily"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("campaigns_userId_idx").on(table.userId),
    index("campaigns_cycleId_idx").on(table.cycleId),
  ]
);

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// Social post templates
export const socialTemplates = pgTable(
  "socialTemplates",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    platform: socialTemplatesPlatformEnum("platform").notNull(),
    captionTemplate: text("captionTemplate"),
    hashtagSet: jsonb("hashtagSet"),
    imagePrompt: text("imagePrompt"),
    isDefault: boolean("isDefault").default(false),
    createdAt: createdAt(),
  },
  (table) => [index("socialTemplates_userId_idx").on(table.userId)]
);

export type SocialTemplate = typeof socialTemplates.$inferSelect;
export type InsertSocialTemplate = typeof socialTemplates.$inferInsert;

// Pipeline runs (autonomous cycle phases)
export const pipelineRuns = pgTable(
  "pipelineRuns",
  {
    id: pk(),
    cycleId: fk("cycleId").references(() => cycles.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    status: pipelineRunsStatusEnum("status").default("pending").notNull(),
    currentPhase: pipelineRunsPhaseEnum("currentPhase").default("trend").notNull(),
    trendPhaseStatus: pipelinePhaseStatusEnum("trendPhaseStatus").default("pending"),
    designPhaseStatus:
      pipelinePhaseStatusEnum("designPhaseStatus").default("pending"),
    printifyPhaseStatus:
      pipelinePhaseStatusEnum("printifyPhaseStatus").default("pending"),
    shopifyPhaseStatus:
      pipelinePhaseStatusEnum("shopifyPhaseStatus").default("pending"),
    socialPhaseStatus:
      pipelinePhaseStatusEnum("socialPhaseStatus").default("pending"),
    logPhaseStatus: pipelinePhaseStatusEnum("logPhaseStatus").default("pending"),
    startedAt: ts("startedAt").defaultNow(),
    completedAt: ts("completedAt"),
    duration: integer("duration"), // seconds
    result: jsonb("result"),
    errorMessage: text("errorMessage"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("pipelineRuns_cycleId_idx").on(table.cycleId),
    index("pipelineRuns_status_idx").on(table.status),
  ]
);

export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type InsertPipelineRun = typeof pipelineRuns.$inferInsert;

// Action items / checklist
export const actionItems = pgTable(
  "actionItems",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    section: actionItemsSectionEnum("section").default("immediate").notNull(),
    priority: actionItemsPriorityEnum("priority").default("medium").notNull(),
    status: actionItemsStatusEnum("status").default("open").notNull(),
    dueDate: ts("dueDate"),
    completedAt: ts("completedAt"),
    tags: jsonb("tags"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("actionItems_userId_idx").on(table.userId),
    index("actionItems_status_idx").on(table.status),
  ]
);

export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = typeof actionItems.$inferInsert;

// ─── AGENT HUB TABLES ────────────────────────────────────────────────────────

// Agents table (declared before agentTasks so its id can be referenced)
export const agents = pgTable("agents", {
  id: pk(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  status: agentsStatusEnum("status").default("idle").notNull(),
  lastActive: ts("lastActive"),
  capabilities: jsonb("capabilities"),
  metadata: jsonb("metadata"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Agent Hub tasks
export const agentTasks = pgTable(
  "agentTasks",
  {
    id: pk(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    assignedAgentId: fk("assignedAgentId").references(() => agents.id, {
      onDelete: "set null",
    }),
    createdBy: fk("createdBy")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: agentTasksStatusEnum("status").default("pending").notNull(),
    priority: agentTasksPriorityEnum("priority").default("medium").notNull(),
    dueDate: ts("dueDate"),
    category: agentTasksCategoryEnum("category").default("short_term").notNull(),
    requiresApproval: boolean("requiresApproval").default(false),
    approvedBy: fk("approvedBy").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: ts("approvedAt"),
    result: jsonb("result"),
    errorMessage: text("errorMessage"),
    metadata: jsonb("metadata"),
    contextStack: jsonb("contextStack"),
    outputData: jsonb("outputData"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    completedAt: ts("completedAt"),
  },
  (table) => [
    index("agentTasks_createdBy_idx").on(table.createdBy),
    index("agentTasks_assignedAgentId_idx").on(table.assignedAgentId),
    index("agentTasks_status_idx").on(table.status),
  ]
);

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

// Agent-to-agent messaging
export const agentMessages = pgTable(
  "agentMessages",
  {
    id: pk(),
    fromAgentId: fk("fromAgentId")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    toAgentId: fk("toAgentId").references(() => agents.id, {
      onDelete: "cascade",
    }), // null = broadcast
    taskId: fk("taskId").references(() => agentTasks.id, { onDelete: "cascade" }),
    messageType: agentMessagesTypeEnum("messageType")
      .default("status_update")
      .notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    createdAt: createdAt(),
  },
  (table) => [
    index("agentMessages_fromAgentId_idx").on(table.fromAgentId),
    index("agentMessages_taskId_idx").on(table.taskId),
  ]
);

export type AgentMessage = typeof agentMessages.$inferSelect;
export type InsertAgentMessage = typeof agentMessages.$inferInsert;

// Task assignment tracking
export const agentAssignments = pgTable(
  "agentAssignments",
  {
    id: pk(),
    agentId: fk("agentId")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    taskId: fk("taskId")
      .notNull()
      .references(() => agentTasks.id, { onDelete: "cascade" }),
    assignedAt: ts("assignedAt").defaultNow().notNull(),
    startedAt: ts("startedAt"),
    completedAt: ts("completedAt"),
    result: jsonb("result"),
    status: agentAssignmentsStatusEnum("status").default("assigned").notNull(),
  },
  (table) => [
    index("agentAssignments_agentId_idx").on(table.agentId),
    index("agentAssignments_taskId_idx").on(table.taskId),
  ]
);

export type AgentAssignment = typeof agentAssignments.$inferSelect;
export type InsertAgentAssignment = typeof agentAssignments.$inferInsert;

// API credential inventory (names and status only; never credential values)
export const apiCredentials = pgTable(
  "apiCredentials",
  {
    id: pk(),
    userId: fk("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceName: varchar("serviceName", { length: 255 }).notNull(),
    displayName: varchar("displayName", { length: 255 }).notNull(),
    status: apiCredentialsStatusEnum("status").default("unknown").notNull(),
    lastVerifiedAt: ts("lastVerifiedAt"),
    expiresAt: ts("expiresAt"),
    scope: text("scope"),
    metadata: jsonb("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("apiCredentials_userId_serviceName_key").on(
      table.userId,
      table.serviceName
    ),
  ]
);

export type ApiCredential = typeof apiCredentials.$inferSelect;
export type InsertApiCredential = typeof apiCredentials.$inferInsert;

// ─── INTEGRATION DURABILITY (F-01) ───────────────────────────────────────────
// Durable state for every Printify/Shopify operation: provider IDs, mappings,
// idempotency keys, retry attempts, error classification and reconciliation
// status. Nothing in the POD path may be treated as production-safe until it
// is recorded here — an HTTP 200 from a provider is not completion evidence.

export const integrationRunTypeEnum = pgEnum("integration_run_type", [
  "pod_cycle",
  "product_publish",
  "reconciliation",
  "webhook",
  "manual",
]);
export const integrationRunStatusEnum = pgEnum("integration_run_status", [
  "pending",
  "running",
  "succeeded",
  "failed",
  "cancelled",
  "needs_attention",
]);
export const integrationStepEnum = pgEnum("integration_step", [
  "upload_image",
  "create_printify_product",
  "publish_to_shopify",
  "verify_shopify_product",
  "reconcile",
  "complete",
]);
export const integrationStepStatusEnum = pgEnum("integration_step_status", [
  "pending",
  "running",
  "succeeded",
  "failed",
  "skipped",
]);
export const integrationErrorClassEnum = pgEnum("integration_error_class", [
  "transient",
  "permanent",
  "unknown",
]);
export const integrationProviderEnum = pgEnum("integration_provider", [
  "printify",
  "shopify",
]);
export const providerResourceTypeEnum = pgEnum("provider_resource_type", [
  "product",
  "variant",
  "image",
  "order",
]);
export const reconciliationStatusEnum = pgEnum("reconciliation_status", [
  "unverified",
  "verified",
  "mismatched",
  "missing",
]);
export const reconciliationCheckEnum = pgEnum("reconciliation_check", [
  "provider_mapping",
  "shopify_product",
  "shopify_variants",
  "media",
  "price",
  "shipping",
  "storefront_availability",
  "checkout_handoff",
  "fulfillment_routing",
]);
export const reconciliationCheckStatusEnum = pgEnum(
  "reconciliation_check_status",
  ["pending", "passed", "failed", "skipped"]
);

/**
 * One durable row per integration operation. `idempotencyKey` is unique, so a
 * replayed request resumes the existing run instead of creating a second one.
 */
export const integrationRuns = pgTable(
  "integrationRuns",
  {
    id: pk(),
    idempotencyKey: varchar("idempotencyKey", { length: 191 }).notNull(),
    runType: integrationRunTypeEnum("runType").notNull(),
    status: integrationRunStatusEnum("status").default("pending").notNull(),
    cycleId: fk("cycleId").references(() => cycles.id, { onDelete: "set null" }),
    productId: fk("productId").references(() => products.id, {
      onDelete: "set null",
    }),
    pipelineRunId: fk("pipelineRunId").references(() => pipelineRuns.id, {
      onDelete: "set null",
    }),
    attemptCount: integer("attemptCount").default(0).notNull(),
    maxAttempts: integer("maxAttempts").default(3).notNull(),
    // Set while a worker holds the run; prevents overlapping scheduled runs (G-03).
    lockedAt: ts("lockedAt"),
    lockedBy: varchar("lockedBy", { length: 191 }),
    startedAt: ts("startedAt"),
    completedAt: ts("completedAt"),
    nextRetryAt: ts("nextRetryAt"),
    errorClass: integrationErrorClassEnum("errorClass"),
    lastErrorCode: varchar("lastErrorCode", { length: 100 }),
    lastErrorMessage: text("lastErrorMessage"),
    reconciliationStatus: reconciliationStatusEnum("reconciliationStatus")
      .default("unverified")
      .notNull(),
    // Request/response references only — never provider tokens or secrets.
    metadata: jsonb("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("integrationRuns_idempotencyKey_key").on(table.idempotencyKey),
    index("integrationRuns_status_idx").on(table.status),
    index("integrationRuns_productId_idx").on(table.productId),
    index("integrationRuns_nextRetryAt_idx").on(table.nextRetryAt),
  ]
);

export type IntegrationRun = typeof integrationRuns.$inferSelect;
export type InsertIntegrationRun = typeof integrationRuns.$inferInsert;

/**
 * One row per attempt of one step of a run (F-02). Every step records its own
 * start/end, provider response reference, error classification and retry
 * eligibility, so a partially completed POD cycle is resumable.
 */
export const integrationSteps = pgTable(
  "integrationSteps",
  {
    id: pk(),
    runId: fk("runId")
      .notNull()
      .references(() => integrationRuns.id, { onDelete: "cascade" }),
    step: integrationStepEnum("step").notNull(),
    attempt: integer("attempt").default(1).notNull(),
    status: integrationStepStatusEnum("status").default("pending").notNull(),
    provider: integrationProviderEnum("provider"),
    providerRequestRef: varchar("providerRequestRef", { length: 191 }),
    providerResponseRef: varchar("providerResponseRef", { length: 191 }),
    httpStatus: integer("httpStatus"),
    errorClass: integrationErrorClassEnum("errorClass"),
    errorCode: varchar("errorCode", { length: 100 }),
    errorMessage: text("errorMessage"),
    retryable: boolean("retryable").default(false).notNull(),
    startedAt: ts("startedAt"),
    completedAt: ts("completedAt"),
    // Correlation id shared with Vercel request logs (H-03).
    correlationId: varchar("correlationId", { length: 191 }),
    payload: jsonb("payload"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("integrationSteps_runId_step_attempt_key").on(
      table.runId,
      table.step,
      table.attempt
    ),
    index("integrationSteps_runId_idx").on(table.runId),
    index("integrationSteps_status_idx").on(table.status),
    index("integrationSteps_correlationId_idx").on(table.correlationId),
  ]
);

export type IntegrationStep = typeof integrationSteps.$inferSelect;
export type InsertIntegrationStep = typeof integrationSteps.$inferInsert;

/**
 * Local record <-> provider record mapping (F-01, F-06). A product is not
 * publishable evidence until its Printify and Shopify resources both map here.
 */
export const providerMappings = pgTable(
  "providerMappings",
  {
    id: pk(),
    provider: integrationProviderEnum("provider").notNull(),
    resourceType: providerResourceTypeEnum("resourceType").notNull(),
    providerResourceId: varchar("providerResourceId", { length: 191 }).notNull(),
    productId: fk("productId").references(() => products.id, {
      onDelete: "cascade",
    }),
    variantId: fk("variantId").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    runId: fk("runId").references(() => integrationRuns.id, {
      onDelete: "set null",
    }),
    reconciliationStatus: reconciliationStatusEnum("reconciliationStatus")
      .default("unverified")
      .notNull(),
    lastVerifiedAt: ts("lastVerifiedAt"),
    details: jsonb("details"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("providerMappings_provider_resource_key").on(
      table.provider,
      table.resourceType,
      table.providerResourceId
    ),
    index("providerMappings_productId_idx").on(table.productId),
    index("providerMappings_variantId_idx").on(table.variantId),
    index("providerMappings_reconciliationStatus_idx").on(
      table.reconciliationStatus
    ),
  ]
);

export type ProviderMapping = typeof providerMappings.$inferSelect;
export type InsertProviderMapping = typeof providerMappings.$inferInsert;

/**
 * One row per required completion condition per product (F-04). The DONE rule
 * is enforced from these rows, not from operator convention.
 */
export const reconciliationChecks = pgTable(
  "reconciliationChecks",
  {
    id: pk(),
    productId: fk("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    runId: fk("runId").references(() => integrationRuns.id, {
      onDelete: "set null",
    }),
    check: reconciliationCheckEnum("check").notNull(),
    status: reconciliationCheckStatusEnum("status").default("pending").notNull(),
    detail: jsonb("detail"),
    failureReason: text("failureReason"),
    checkedAt: ts("checkedAt"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("reconciliationChecks_productId_check_key").on(
      table.productId,
      table.check
    ),
    index("reconciliationChecks_status_idx").on(table.status),
  ]
);

export type ReconciliationCheck = typeof reconciliationChecks.$inferSelect;
export type InsertReconciliationCheck = typeof reconciliationChecks.$inferInsert;

/**
 * Every check that must pass before a product may be marked DONE (F-04).
 * Consumed by the completion rule so the list lives in code, not convention.
 */
export const REQUIRED_RECONCILIATION_CHECKS = [
  "provider_mapping",
  "shopify_product",
  "shopify_variants",
  "media",
  "price",
  "shipping",
  "storefront_availability",
  "checkout_handoff",
  "fulfillment_routing",
] as const;
