import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  decimal,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

// Users table (extended from auth scaffold)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "viewer"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Cycles table (POD design cycles)
export const cycles = mysqlTable("cycles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  cycleNumber: int("cycleNumber").notNull(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed", "archived"]).default("draft").notNull(),
  currentPhase: mysqlEnum("currentPhase", ["ideation", "design", "review", "production", "marketing", "complete"]).default("ideation").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  targetRevenue: decimal("targetRevenue", { precision: 10, scale: 2 }),
  actualRevenue: decimal("actualRevenue", { precision: 10, scale: 2 }).default("0.00"),
  slogan: varchar("slogan", { length: 500 }),
  theme: varchar("theme", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = typeof cycles.$inferInsert;

// Products table
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  cycleId: bigint("cycleId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  description: text("description"),
  slogan: varchar("slogan", { length: 500 }),
  designUrl: varchar("designUrl", { length: 500 }),
  mockupUrl: varchar("mockupUrl", { length: 500 }),
  productType: mysqlEnum("productType", ["tshirt", "hoodie", "mug", "poster", "sticker", "hat", "tote", "other"]).default("tshirt").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["draft", "pending", "approved", "live", "sold_out", "discontinued"]).default("draft").notNull(),
  inventory: int("inventory").default(0),
  salesCount: int("salesCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  shopifyOrderId: varchar("shopifyOrderId", { length: 100 }),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  shippingAddress: json("shippingAddress"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Social accounts table
export const socialAccounts = mysqlTable("socialAccounts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "twitter", "facebook", "pinterest", "youtube", "other"]).notNull(),
  accountHandle: varchar("accountHandle", { length: 255 }),
  accountId: varchar("accountId", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  followerCount: int("followerCount").default(0),
  status: mysqlEnum("status", ["active", "expired", "disconnected", "error"]).default("active").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

// Social posts table
export const socialPosts = mysqlTable("socialPosts", {
  id: serial("id").primaryKey(),
  cycleId: bigint("cycleId", { mode: "number", unsigned: true }).notNull(),
  accountId: bigint("accountId", { mode: "number", unsigned: true }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "twitter", "facebook", "pinterest", "youtube", "other"]).notNull(),
  postId: varchar("postId", { length: 255 }),
  content: text("content"),
  mediaUrls: json("mediaUrls"),
  status: mysqlEnum("status", ["scheduled", "published", "failed", "draft"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  metrics: json("metrics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;

// Transmission logs table
export const transmissionLogs = mysqlTable("transmissionLogs", {
  id: serial("id").primaryKey(),
  cycleId: bigint("cycleId", { mode: "number", unsigned: true }).notNull(),
  message: text("message").notNull(),
  logType: mysqlEnum("logType", ["info", "warning", "error", "success", "debug"]).default("info").notNull(),
  phase: mysqlEnum("phase", ["ideation", "design", "review", "production", "marketing", "complete"]).default("ideation").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TransmissionLog = typeof transmissionLogs.$inferSelect;
export type InsertTransmissionLog = typeof transmissionLogs.$inferInsert;

// Admin settings table
export const adminSettings = mysqlTable("adminSettings", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).default("auto").notNull(),
  emailNotifications: boolean("emailNotifications").default(true),
  inAppNotifications: boolean("inAppNotifications").default(true),
  notificationFrequency: mysqlEnum("notificationFrequency", ["instant", "daily", "weekly"]).default("daily").notNull(),
  itemsPerPage: int("itemsPerPage").default(20),
  defaultView: mysqlEnum("defaultView", ["grid", "list"]).default("grid").notNull(),
  autoPublish: boolean("autoPublish").default(false),
  cycleFrequency: mysqlEnum("cycleFrequency", ["daily", "weekly", "monthly"]).default("weekly").notNull(),
  companyName: varchar("companyName", { length: 255 }).default("Better Daze"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#6366f1"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;

// API keys table
export const apiKeys = mysqlTable("apiKeys", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("keyHash", { length: 255 }).notNull(),
  permissions: json("permissions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsed: timestamp("lastUsed"),
  expiresAt: timestamp("expiresAt"),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// Sessions table
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  userAgent: varchar("userAgent", { length: 500 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastActivity: timestamp("lastActivity").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// Login history table
export const loginHistory = mysqlTable("loginHistory", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  status: mysqlEnum("status", ["success", "failed"]).notNull(),
  failureReason: varchar("failureReason", { length: 255 }),
});

export type LoginRecord = typeof loginHistory.$inferSelect;
export type InsertLoginRecord = typeof loginHistory.$inferInsert;

// Roles table
export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  isCustom: boolean("isCustom").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

// Permissions table
export const permissions = mysqlTable("permissions", {
  id: serial("id").primaryKey(),
  roleId: bigint("roleId", { mode: "number", unsigned: true }).notNull(),
  resource: mysqlEnum("resource", ["products", "orders", "cycles", "users", "settings", "analytics", "social"]).notNull(),
  action: mysqlEnum("action", ["create", "read", "update", "delete"]).notNull(),
  granted: boolean("granted").default(false),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

// Audit log table
export const auditLogs = mysqlTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 50 }).notNull(),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ─── E-COMMERCE TABLES ───

// Product variants (sizes, colors)
export const productVariants = mysqlTable("productVariants", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  sku: varchar("sku", { length: 100 }),
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 50 }),
  colorHex: varchar("colorHex", { length: 7 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  inventory: int("inventory").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// Product images (mockups)
export const productImages = mysqlTable("productImages", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variantId: bigint("variantId", { mode: "number", unsigned: true }),
  url: varchar("url", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 255 }),
  isPrimary: boolean("isPrimary").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

// Collections / Categories
export const collections = mysqlTable("collections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

// Product to Collection junction
export const productCollections = mysqlTable("productCollections", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  collectionId: bigint("collectionId", { mode: "number", unsigned: true }).notNull(),
});

export type ProductCollection = typeof productCollections.$inferSelect;
export type InsertProductCollection = typeof productCollections.$inferInsert;

// Customer orders (public store orders)
export const customerOrders = mysqlTable("customerOrders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["unfulfilled", "pending", "fulfilled", "partial", "returned"]).default("unfulfilled").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0.00"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  shippingAddress: json("shippingAddress"),
  billingAddress: json("billingAddress"),
  paymentReference: varchar("paymentReference", { length: 255 }),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CustomerOrder = typeof customerOrders.$inferSelect;
export type InsertCustomerOrder = typeof customerOrders.$inferInsert;

// Order items (line items)
export const orderItems = mysqlTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variantId: bigint("variantId", { mode: "number", unsigned: true }),
  productName: varchar("productName", { length: 255 }).notNull(),
  variantName: varchar("variantName", { length: 100 }),
  sku: varchar("sku", { length: 100 }),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Campaigns table (automated marketing)
export const campaigns = mysqlTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cycleId: bigint("cycleId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "scheduled", "active", "paused", "completed"]).default("draft").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  platforms: json("platforms"), // ["instagram", "tiktok", "twitter"]
  autoPublishProducts: boolean("autoPublishProducts").default(false),
  autoGenerateSocial: boolean("autoGenerateSocial").default(false),
  postFrequency: mysqlEnum("postFrequency", ["hourly", "daily", "weekly"]).default("daily"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// Social post templates
export const socialTemplates = mysqlTable("socialTemplates", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "twitter", "facebook", "pinterest"]).notNull(),
  captionTemplate: text("captionTemplate"),
  hashtagSet: json("hashtagSet"),
  imagePrompt: text("imagePrompt"),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialTemplate = typeof socialTemplates.$inferSelect;
export type InsertSocialTemplate = typeof socialTemplates.$inferInsert;

// Pipeline runs (autonomous cycle phases)
export const pipelineRuns = mysqlTable("pipelineRuns", {
  id: serial("id").primaryKey(),
  cycleId: bigint("cycleId", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed", "cancelled"]).default("pending").notNull(),
  currentPhase: mysqlEnum("currentPhase", ["trend", "design", "printify", "shopify", "social", "log", "complete"]).default("trend").notNull(),
  trendPhaseStatus: mysqlEnum("trendPhaseStatus", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  designPhaseStatus: mysqlEnum("designPhaseStatus", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  printifyPhaseStatus: mysqlEnum("printifyPhaseStatus", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  shopifyPhaseStatus: mysqlEnum("shopifyPhaseStatus", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  socialPhaseStatus: mysqlEnum("socialPhaseStatus", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  logPhaseStatus: mysqlEnum("logPhaseStatus", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  startedAt: timestamp("startedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
  duration: int("duration"), // seconds
  result: json("result"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type InsertPipelineRun = typeof pipelineRuns.$inferInsert;

// Action items / checklist
export const actionItems = mysqlTable("actionItems", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  section: mysqlEnum("section", ["immediate", "short_term", "deferred"]).default("immediate").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "completed", "cancelled"]).default("open").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = typeof actionItems.$inferInsert;

// API credentials health monitoring
export const apiCredentials = mysqlTable("apiCredentials", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  serviceName: varchar("serviceName", { length: 100 }).notNull(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "expiring", "expired", "needs_rotation", "error", "unknown"]).default("unknown").notNull(),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  expiresAt: timestamp("expiresAt"),
  scope: varchar("scope", { length: 500 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ApiCredential = typeof apiCredentials.$inferSelect;
export type InsertApiCredential = typeof apiCredentials.$inferInsert;

// ─── AGENT HUB TABLES ───

// Registered agents (AI + human)
export const agents = mysqlTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["ai_agent", "human", "system"]).default("ai_agent").notNull(),
  status: mysqlEnum("status", ["online", "offline", "busy", "idle"]).default("idle").notNull(),
  currentTaskId: bigint("currentTaskId", { mode: "number", unsigned: true }),
  lastActive: timestamp("lastActive").defaultNow(),
  capabilities: json("capabilities").$type<string[]>().default([]),
  webhookUrl: varchar("webhookUrl", { length: 500 }),
  apiKey: varchar("apiKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Tasks for agents
export const agentTasks = mysqlTable("agentTasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedAgentId: bigint("assignedAgentId", { mode: "number", unsigned: true }),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed", "blocked"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  category: mysqlEnum("category", ["immediate", "short_term", "deferred"]).default("short_term").notNull(),
  requiresApproval: boolean("requiresApproval").default(false),
  approvedBy: bigint("approvedBy", { mode: "number", unsigned: true }),
  approvedAt: timestamp("approvedAt"),
  result: json("result"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  completedAt: timestamp("completedAt"),
});

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

// Agent-to-agent messaging
export const agentMessages = mysqlTable("agentMessages", {
  id: serial("id").primaryKey(),
  fromAgentId: bigint("fromAgentId", { mode: "number", unsigned: true }).notNull(),
  toAgentId: bigint("toAgentId", { mode: "number", unsigned: true }), // null = broadcast
  taskId: bigint("taskId", { mode: "number", unsigned: true }),
  messageType: mysqlEnum("messageType", ["status_update", "question", "result", "error", "broadcast", "handoff"]).default("status_update").notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentMessage = typeof agentMessages.$inferSelect;
export type InsertAgentMessage = typeof agentMessages.$inferInsert;

// Task assignment tracking
export const agentAssignments = mysqlTable("agentAssignments", {
  id: serial("id").primaryKey(),
  agentId: bigint("agentId", { mode: "number", unsigned: true }).notNull(),
  taskId: bigint("taskId", { mode: "number", unsigned: true }).notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  result: json("result"),
  status: mysqlEnum("status", ["assigned", "started", "completed", "failed"]).default("assigned").notNull(),
});

export type AgentAssignment = typeof agentAssignments.$inferSelect;
export type InsertAgentAssignment = typeof agentAssignments.$inferInsert;
