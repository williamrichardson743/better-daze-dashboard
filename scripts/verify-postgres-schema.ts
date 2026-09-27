/**
 * Postgres cutover verification (tickets B-03, B-06, C-06, D-01, F-03).
 *
 * Runs representative reads and writes against the DATABASE_URL currently
 * configured and prints a pass/fail report. It is safe to run against a
 * staging Supabase project: every row it creates is removed again, and it
 * refuses to run when the connection string looks like production unless
 * ALLOW_PRODUCTION_VERIFY=1 is set.
 *
 *   DATABASE_URL=... pnpm run db:verify
 *
 * Checks: enum round-trip, timestamp/timezone round-trip, decimal fidelity,
 * jsonb round-trip, foreign-key enforcement, cascade delete, the GitHub
 * identity upsert, INSERT ... RETURNING id, and integration-run idempotency.
 */

import { eq } from "drizzle-orm";
import { getDb, closeDb } from "../api/queries/connection.js";
import * as schema from "../db/schema.js";

type Result = { name: string; ok: boolean; detail: string };
const results: Result[] = [];

async function check(name: string, run: () => Promise<string>) {
  try {
    results.push({ name, ok: true, detail: await run() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    results.push({ name, ok: false, detail });
  }
}

/** Expects the callback to reject; used for constraint-enforcement checks. */
async function expectRejection(run: () => Promise<unknown>, label: string) {
  try {
    await run();
  } catch {
    return `${label} rejected as expected`;
  }
  throw new Error(`${label} was accepted but should have been rejected`);
}

const VERIFY_UNION_ID = `github:verify-${Date.now()}`;

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!process.env.ALLOW_PRODUCTION_VERIFY && /prod/i.test(url)) {
    throw new Error(
      "DATABASE_URL looks like production. Set ALLOW_PRODUCTION_VERIFY=1 to override."
    );
  }

  const db = getDb();
  let userId = 0;
  let cycleId = 0;
  let productId = 0;

  await check("connectivity", async () => {
    await db.select().from(schema.users).limit(1);
    return "select against users succeeded";
  });

  await check("insert returning id (was $returningId)", async () => {
    const [row] = await db
      .insert(schema.users)
      .values({
        unionId: VERIFY_UNION_ID,
        name: "Cutover Verification",
        email: `verify-${Date.now()}@better-daze.invalid`,
        role: "viewer",
        status: "active",
      })
      .returning({ id: schema.users.id });
    userId = row.id;
    if (!userId) throw new Error("no id returned");
    return `users.id ${userId}`;
  });

  await check("identity upsert (onConflictDoUpdate on unionId)", async () => {
    await db
      .insert(schema.users)
      .values({ unionId: VERIFY_UNION_ID, name: "Cutover Verification v2" })
      .onConflictDoUpdate({
        target: schema.users.unionId,
        set: { name: "Cutover Verification v2", lastSignInAt: new Date() },
      });
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.unionId, VERIFY_UNION_ID));
    if (rows.length !== 1) throw new Error(`expected 1 row, found ${rows.length}`);
    if (rows[0].name !== "Cutover Verification v2")
      throw new Error("update set was not applied");
    return "one row, updated in place";
  });

  await check("enum + timestamptz + decimal round-trip", async () => {
    const startDate = new Date("2026-02-01T12:30:00.000Z");
    const [row] = await db
      .insert(schema.cycles)
      .values({
        userId,
        cycleNumber: 9001,
        name: "verification cycle",
        status: "active",
        currentPhase: "production",
        startDate,
        targetRevenue: "1234.56",
      })
      .returning({ id: schema.cycles.id });
    cycleId = row.id;
    const [stored] = await db
      .select()
      .from(schema.cycles)
      .where(eq(schema.cycles.id, cycleId));
    if (stored.status !== "active" || stored.currentPhase !== "production")
      throw new Error("enum value did not round-trip");
    if (stored.startDate?.toISOString() !== startDate.toISOString())
      throw new Error(
        `timestamp drifted: ${stored.startDate?.toISOString()} != ${startDate.toISOString()}`
      );
    if (stored.targetRevenue !== "1234.56")
      throw new Error(`decimal drifted: ${stored.targetRevenue}`);
    return "enum, UTC timestamp and decimal(10,2) preserved";
  });

  await check("jsonb round-trip", async () => {
    const [row] = await db
      .insert(schema.products)
      .values({
        cycleId,
        name: "verification product",
        productType: "tshirt",
        price: "32.99",
        status: "draft",
      })
      .returning({ id: schema.products.id });
    productId = row.id;
    await db.insert(schema.orders).values({
      productId,
      quantity: 2,
      unitPrice: "32.99",
      totalRevenue: "65.98",
      shippingAddress: { city: "San Francisco", zip: "94110", lines: ["1 A St"] },
    });
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.productId, productId));
    const address = order.shippingAddress as { lines?: string[] } | null;
    if (address?.lines?.[0] !== "1 A St") throw new Error("jsonb did not round-trip");
    return "nested jsonb object preserved";
  });

  await check("foreign key enforcement", async () =>
    expectRejection(
      () =>
        db.insert(schema.products).values({
          cycleId: 2147483600,
          name: "orphan",
          price: "1.00",
        }),
      "product with a non-existent cycleId"
    )
  );

  await check("integration run idempotency key is unique (F-03)", async () => {
    const key = `verify-${Date.now()}`;
    await db
      .insert(schema.integrationRuns)
      .values({ idempotencyKey: key, runType: "product_publish", productId });
    const detail = await expectRejection(
      () =>
        db
          .insert(schema.integrationRuns)
          .values({ idempotencyKey: key, runType: "product_publish", productId }),
      "replayed idempotency key"
    );
    return detail;
  });

  await check("reconciliation check is unique per product+check (F-04)", async () => {
    await db
      .insert(schema.reconciliationChecks)
      .values({ productId, check: "storefront_availability", status: "pending" });
    return expectRejection(
      () =>
        db
          .insert(schema.reconciliationChecks)
          .values({ productId, check: "storefront_availability", status: "passed" }),
      "duplicate reconciliation check"
    );
  });

  await check("revenue rows block a user delete (RESTRICT)", async () =>
    expectRejection(
      () => db.delete(schema.users).where(eq(schema.users.id, userId)),
      "deleting a user whose products carry order rows"
    )
  );

  await check("cascade delete cleans dependent rows", async () => {
    // orders.productId is RESTRICT on purpose, so revenue records are removed
    // deliberately before the owning user can be deleted.
    await db.delete(schema.orders).where(eq(schema.orders.productId, productId));
    await db.delete(schema.users).where(eq(schema.users.id, userId));
    const cycles = await db
      .select()
      .from(schema.cycles)
      .where(eq(schema.cycles.id, cycleId));
    const products = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, productId));
    if (cycles.length || products.length)
      throw new Error("dependent rows survived the user delete");
    return "user delete cascaded to cycles and products";
  });
}

main()
  .catch((error) => {
    results.push({
      name: "verification run",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  })
  .finally(async () => {
    await closeDb();
    const failed = results.filter((r) => !r.ok);
    for (const r of results) {
      console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}\n      ${r.detail}`);
    }
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    process.exit(failed.length ? 1 : 0);
  });
