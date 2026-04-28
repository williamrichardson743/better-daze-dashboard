import { eq, and, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

// User queries
export async function findAllUsers(limit?: number, offset?: number) {
  const db = getDb();
  const baseQuery = db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  if (limit) {
    const limited = baseQuery.limit(limit);
    if (offset) return limited.offset(offset);
    return limited;
  }
  return baseQuery;
}

export async function findUserById(id: number) {
  const db = getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return rows.at(0);
}

export async function updateUser(id: number, data: Partial<typeof schema.users.$inferInsert>) {
  const db = getDb();
  await db.update(schema.users).set(data).where(eq(schema.users.id, id));
}

export async function deleteUser(id: number) {
  const db = getDb();
  await db.delete(schema.users).where(eq(schema.users.id, id));
}

// Cycle queries
export async function findAllCycles(limit?: number) {
  const db = getDb();
  const baseQuery = db.select().from(schema.cycles).orderBy(desc(schema.cycles.createdAt));
  if (limit) return baseQuery.limit(limit);
  return baseQuery;
}

export async function findCyclesByStatus(status: string) {
  const db = getDb();
  return db.select().from(schema.cycles).where(eq(schema.cycles.status, status as any));
}

export async function getCycleStats() {
  const db = getDb();
  const all = await db.select().from(schema.cycles);
  const total = all.length;
  const active = all.filter((c) => c.status === "active").length;
  const completed = all.filter((c) => c.status === "completed").length;
  const totalRevenue = all.reduce((sum, c) => sum + parseFloat(c.actualRevenue || "0"), 0);
  return { total, active, completed, totalRevenue };
}

// Product queries
export async function findAllProducts(limit?: number) {
  const db = getDb();
  const baseQuery = db.select().from(schema.products).orderBy(desc(schema.products.createdAt));
  if (limit) return baseQuery.limit(limit);
  return baseQuery;
}

export async function getProductStats() {
  const db = getDb();
  const all = await db.select().from(schema.products);
  const total = all.length;
  const live = all.filter((p) => p.status === "live").length;
  const totalSales = all.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  return { total, live, totalSales };
}

// Order queries
export async function findAllOrders(limit?: number) {
  const db = getDb();
  const baseQuery = db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
  if (limit) return baseQuery.limit(limit);
  return baseQuery;
}

export async function getOrderStats() {
  const db = getDb();
  const all = await db.select().from(schema.orders);
  const total = all.length;
  const pending = all.filter((o) => o.status === "pending").length;
  const totalRevenue = all.reduce((sum, o) => sum + parseFloat(o.totalRevenue || "0"), 0);
  return { total, pending, totalRevenue };
}

// Social account queries
export async function findAllSocialAccounts() {
  const db = getDb();
  return db.select().from(schema.socialAccounts).orderBy(desc(schema.socialAccounts.followerCount));
}

// Transmission log queries
export async function findAllTransmissionLogs(limit?: number) {
  const db = getDb();
  const baseQuery = db.select().from(schema.transmissionLogs).orderBy(desc(schema.transmissionLogs.createdAt));
  if (limit) return baseQuery.limit(limit);
  return baseQuery;
}

// Admin settings queries
export async function findAdminSettingsByUserId(userId: number) {
  const db = getDb();
  const rows = await db.select().from(schema.adminSettings).where(eq(schema.adminSettings.userId, userId)).limit(1);
  return rows.at(0);
}

export async function upsertAdminSettings(data: typeof schema.adminSettings.$inferInsert) {
  const db = getDb();
  const existing = await findAdminSettingsByUserId(data.userId);
  if (existing) {
    await db.update(schema.adminSettings).set(data).where(eq(schema.adminSettings.id, existing.id));
    return { ...existing, ...data };
  } else {
    await db.insert(schema.adminSettings).values(data);
    return data;
  }
}

// API key queries
export async function findApiKeysByUserId(userId: number) {
  const db = getDb();
  return db.select().from(schema.apiKeys).where(eq(schema.apiKeys.userId, userId)).orderBy(desc(schema.apiKeys.createdAt));
}

export async function createApiKey(data: typeof schema.apiKeys.$inferInsert) {
  const db = getDb();
  await db.insert(schema.apiKeys).values(data);
  return data;
}

export async function deleteApiKey(id: string) {
  const db = getDb();
  await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id));
}

// Session queries
export async function findSessionsByUserId(userId: number) {
  const db = getDb();
  return db.select().from(schema.sessions).where(eq(schema.sessions.userId, userId)).orderBy(desc(schema.sessions.lastActivity));
}

export async function deleteSession(id: string) {
  const db = getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
}

// Login history queries
export async function findLoginHistoryByUserId(userId: number, limit?: number) {
  const db = getDb();
  const baseQuery = db.select().from(schema.loginHistory).where(eq(schema.loginHistory.userId, userId)).orderBy(desc(schema.loginHistory.timestamp));
  if (limit) return baseQuery.limit(limit);
  return baseQuery;
}

// Role queries
export async function findAllRoles() {
  const db = getDb();
  return db.select().from(schema.roles).orderBy(schema.roles.name);
}

export async function findRoleById(id: number) {
  const db = getDb();
  const rows = await db.select().from(schema.roles).where(eq(schema.roles.id, id)).limit(1);
  return rows.at(0);
}

export async function createRole(data: typeof schema.roles.$inferInsert) {
  const db = getDb();
  await db.insert(schema.roles).values(data);
}

export async function updateRole(id: number, data: Partial<typeof schema.roles.$inferInsert>) {
  const db = getDb();
  await db.update(schema.roles).set(data).where(eq(schema.roles.id, id));
}

export async function deleteRole(id: number) {
  const db = getDb();
  await db.delete(schema.roles).where(eq(schema.roles.id, id));
}

// Permission queries
export async function findPermissionsByRoleId(roleId: number) {
  const db = getDb();
  return db.select().from(schema.permissions).where(eq(schema.permissions.roleId, roleId));
}

export async function upsertPermission(data: typeof schema.permissions.$inferInsert) {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.permissions)
    .where(
      and(
        eq(schema.permissions.roleId, data.roleId),
        eq(schema.permissions.resource, data.resource),
        eq(schema.permissions.action, data.action)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(schema.permissions)
      .set({ granted: data.granted })
      .where(eq(schema.permissions.id, existing[0].id));
  } else {
    await db.insert(schema.permissions).values(data);
  }
}

// Audit log queries
export async function createAuditLog(data: typeof schema.auditLogs.$inferInsert) {
  const db = getDb();
  await db.insert(schema.auditLogs).values(data);
}

export async function findAllAuditLogs(limit?: number) {
  const db = getDb();
  const baseQuery = db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp));
  if (limit) return baseQuery.limit(limit);
  return baseQuery;
}
