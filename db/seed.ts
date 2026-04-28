import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();

  // Seed default roles
  const defaultRoles = [
    { name: "admin", description: "Full system access", isCustom: false },
    { name: "user", description: "Standard user access", isCustom: false },
    { name: "viewer", description: "Read-only access", isCustom: false },
  ];

  for (const role of defaultRoles) {
    const existing = await db.select().from(schema.roles).where(eq(schema.roles.name, role.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.roles).values(role);
    }
  }

  // Seed default permissions for admin role
  const adminRole = await db.select().from(schema.roles).where(eq(schema.roles.name, "admin")).limit(1);
  if (adminRole.length > 0) {
    const adminRoleId = adminRole[0].id;
    const resources = ["products", "orders", "cycles", "users", "settings", "analytics", "social"] as const;
    const actions = ["create", "read", "update", "delete"] as const;

    for (const resource of resources) {
      for (const action of actions) {
        const existing = await db
          .select()
          .from(schema.permissions)
          .where(
            eq(schema.permissions.roleId, adminRoleId) &&
            eq(schema.permissions.resource, resource) &&
            eq(schema.permissions.action, action)
          )
          .limit(1);
        if (existing.length === 0) {
          await db.insert(schema.permissions).values({
            roleId: adminRoleId,
            resource,
            action,
            granted: true,
          });
        }
      }
    }
  }

  // Seed viewer permissions (read-only)
  const viewerRole = await db.select().from(schema.roles).where(eq(schema.roles.name, "viewer")).limit(1);
  if (viewerRole.length > 0) {
    const viewerRoleId = viewerRole[0].id;
    const resources = ["products", "orders", "cycles", "users", "settings", "analytics", "social"] as const;
    for (const resource of resources) {
      const existing = await db
        .select()
        .from(schema.permissions)
        .where(
          eq(schema.permissions.roleId, viewerRoleId) &&
          eq(schema.permissions.resource, resource) &&
          eq(schema.permissions.action, "read")
        )
        .limit(1);
      if (existing.length === 0) {
        await db.insert(schema.permissions).values({
          roleId: viewerRoleId,
          resource,
          action: "read",
          granted: true,
        });
      }
    }
  }

  // Seed sample cycles
  const sampleCycles = [
    {
      userId: 1,
      cycleNumber: 1,
      name: "Summer Vibes Collection",
      status: "completed" as const,
      currentPhase: "complete" as const,
      slogan: "Chase the sun, wear the daze",
      theme: "Summer / Beach / Warm",
      targetRevenue: "5000.00",
      actualRevenue: "7234.50",
    },
    {
      userId: 1,
      cycleNumber: 2,
      name: "Urban Nightlife Series",
      status: "active" as const,
      currentPhase: "production" as const,
      slogan: "City lights, better nights",
      theme: "Urban / Night / Neon",
      targetRevenue: "8000.00",
      actualRevenue: "3450.00",
    },
    {
      userId: 1,
      cycleNumber: 3,
      name: "Nature's Echo Drop",
      status: "draft" as const,
      currentPhase: "ideation" as const,
      slogan: "Wear the wild",
      theme: "Nature / Forest / Earth",
      targetRevenue: "6000.00",
      actualRevenue: "0.00",
    },
  ];

  for (const cycle of sampleCycles) {
    const existing = await db.select().from(schema.cycles).where(eq(schema.cycles.name, cycle.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.cycles).values(cycle);
    }
  }

  // Seed sample products
  const sampleProducts = [
    {
      cycleId: 1,
      name: "Sunset Dreams Tee",
      sku: "BD-SV-001",
      description: "Premium cotton tee with sunset gradient print",
      slogan: "Chase the sun",
      productType: "tshirt" as const,
      price: "34.99",
      cost: "12.50",
      status: "live" as const,
      inventory: 45,
      salesCount: 128,
    },
    {
      cycleId: 1,
      name: "Wave Rider Hoodie",
      sku: "BD-SV-002",
      description: "Cozy hoodie with ocean wave design",
      slogan: "Ride the wave",
      productType: "hoodie" as const,
      price: "64.99",
      cost: "24.00",
      status: "live" as const,
      inventory: 23,
      salesCount: 67,
    },
    {
      cycleId: 2,
      name: "Neon City Tee",
      sku: "BD-UN-001",
      description: "Black tee with neon city skyline",
      slogan: "City lights",
      productType: "tshirt" as const,
      price: "39.99",
      cost: "14.00",
      status: "live" as const,
      inventory: 56,
      salesCount: 89,
    },
    {
      cycleId: 2,
      name: "Midnight Mug",
      sku: "BD-UN-002",
      description: "Ceramic mug with midnight city design",
      slogan: "Better nights",
      productType: "mug" as const,
      price: "19.99",
      cost: "6.50",
      status: "pending" as const,
      inventory: 100,
      salesCount: 0,
    },
    {
      cycleId: 3,
      name: "Forest Spirit Tee",
      sku: "BD-NE-001",
      description: "Earth-tone tee with forest art",
      slogan: "Wear the wild",
      productType: "tshirt" as const,
      price: "34.99",
      cost: "12.50",
      status: "draft" as const,
      inventory: 0,
      salesCount: 0,
    },
  ];

  for (const product of sampleProducts) {
    const existing = await db.select().from(schema.products).where(eq(schema.products.sku, product.sku)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.products).values(product);
    }
  }

  // Seed sample orders
  const sampleOrders = [
    { productId: 1, customerName: "Alex Johnson", customerEmail: "alex@example.com", quantity: 2, unitPrice: "34.99", totalRevenue: "69.98", status: "delivered" as const },
    { productId: 1, customerName: "Sarah Chen", customerEmail: "sarah@example.com", quantity: 1, unitPrice: "34.99", totalRevenue: "34.99", status: "shipped" as const },
    { productId: 2, customerName: "Mike Ross", customerEmail: "mike@example.com", quantity: 1, unitPrice: "64.99", totalRevenue: "64.99", status: "delivered" as const },
    { productId: 3, customerName: "Emma Davis", customerEmail: "emma@example.com", quantity: 3, unitPrice: "39.99", totalRevenue: "119.97", status: "processing" as const },
    { productId: 1, customerName: "Chris Lee", customerEmail: "chris@example.com", quantity: 2, unitPrice: "34.99", totalRevenue: "69.98", status: "pending" as const },
  ];

  for (const order of sampleOrders) {
    await db.insert(schema.orders).values(order);
  }

  // Seed sample social accounts
  const sampleSocialAccounts = [
    { userId: 1, platform: "instagram" as const, accountHandle: "betterdaze.official", followerCount: 12450, status: "active" as const },
    { userId: 1, platform: "tiktok" as const, accountHandle: "betterdaze", followerCount: 8930, status: "active" as const },
    { userId: 1, platform: "twitter" as const, accountHandle: "betterdaze", followerCount: 5600, status: "active" as const },
  ];

  for (const account of sampleSocialAccounts) {
    const existing = await db.select().from(schema.socialAccounts).where(eq(schema.socialAccounts.accountHandle, account.accountHandle)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.socialAccounts).values(account);
    }
  }

  // Seed sample transmission logs
  const sampleLogs = [
    { cycleId: 1, message: "Cycle 1 completed successfully. Total revenue: $7,234.50", logType: "success" as const, phase: "complete" as const },
    { cycleId: 2, message: "Design phase completed. Moving to production.", logType: "info" as const, phase: "production" as const },
    { cycleId: 2, message: "Supplier confirmed: 200 units initial run", logType: "info" as const, phase: "production" as const },
    { cycleId: 3, message: "Brainstorming session completed. 12 concepts generated.", logType: "info" as const, phase: "ideation" as const },
    { cycleId: 2, message: "Low inventory alert: Neon City Tee below threshold", logType: "warning" as const, phase: "marketing" as const },
  ];

  for (const log of sampleLogs) {
    await db.insert(schema.transmissionLogs).values(log);
  }

  console.log("Seed completed successfully!");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
