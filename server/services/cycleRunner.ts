/**
 * Cycle Runner — Main Orchestrator
 * Executes all 9 steps of the daily print-on-demand workflow in sequence.
 * Logs each step to the database and handles errors gracefully so a single
 * step failure never aborts the entire run.
 */

import { query } from '../db/connection';
import { detectTrends, type TrendResult } from './cycleSteps/trendDetection';
import { generateDesign, type DesignResult } from './cycleSteps/designGeneration';
import { createProduct, type ProductResult } from './cycleSteps/productCreation';
import { publishToShopify, type ShopifyPublishResult } from './cycleSteps/publishToShopify';
import { createVideo, type VideoResult } from './cycleSteps/videoCreation';
import { distributeToSocial, type SocialDistributionResult } from './cycleSteps/socialDistribution';
import { syncOrders, type OrderSyncResult } from './cycleSteps/orderSync';
import { trackRevenue, type RevenueResult } from './cycleSteps/revenueTracking';
import { notifyOwner, type NotificationResult } from './cycleSteps/ownerNotification';

export interface CycleSummary {
  cycleRunId: number;
  trends: TrendResult[];
  design: DesignResult;
  product: ProductResult;
  shopify: ShopifyPublishResult;
  video: VideoResult;
  social: SocialDistributionResult;
  orders: OrderSyncResult;
  revenue: RevenueResult;
  notification: NotificationResult;
  completedAt: string;
  durationMs: number;
}

// ─── Database helpers ────────────────────────────────────────────────────────

async function createCycleRun(): Promise<number> {
  const result = await query<{ insertId: number }>(
    'INSERT INTO cycle_runs (status, started_at) VALUES (?, NOW())',
    ['running']
  );
  // mysql2 returns OkPacket with insertId
  return (result as any).insertId ?? 0;
}

async function completeCycleRun(id: number, summary: CycleSummary): Promise<void> {
  await query(
    'UPDATE cycle_runs SET status = ?, completed_at = NOW(), summary = ? WHERE id = ?',
    ['completed', JSON.stringify(summary), id]
  );
}

async function failCycleRun(id: number, error: string): Promise<void> {
  await query(
    'UPDATE cycle_runs SET status = ?, completed_at = NOW(), error_message = ? WHERE id = ?',
    ['failed', error, id]
  );
}

async function logStep(
  cycleRunId: number,
  stepNumber: number,
  stepName: string,
  status: 'running' | 'completed' | 'failed',
  result?: any,
  errorMessage?: string
): Promise<void> {
  if (status === 'running') {
    await query(
      `INSERT INTO cycle_steps
         (cycle_run_id, step_number, step_name, status, started_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [cycleRunId, stepNumber, stepName, status]
    );
  } else {
    await query(
      `UPDATE cycle_steps
       SET status = ?, completed_at = NOW(), result = ?, error_message = ?
       WHERE cycle_run_id = ? AND step_number = ?`,
      [status, result ? JSON.stringify(result) : null, errorMessage ?? null, cycleRunId, stepNumber]
    );
  }
}

// ─── Step wrapper ────────────────────────────────────────────────────────────

async function runStep<T>(
  cycleRunId: number,
  stepNumber: number,
  stepName: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  await logStep(cycleRunId, stepNumber, stepName, 'running');
  try {
    const result = await fn();
    await logStep(cycleRunId, stepNumber, stepName, 'completed', result);
    return result;
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error(`❌ Step ${stepNumber} (${stepName}) failed: ${msg}`);
    await logStep(cycleRunId, stepNumber, stepName, 'failed', undefined, msg);
    return fallback;
  }
}

// ─── Main runner ─────────────────────────────────────────────────────────────

export async function runCycle(): Promise<CycleSummary> {
  const startTime = Date.now();
  console.log('\n🚀 ═══════════════════════════════════════════════════════');
  console.log('   BETTER DAZE — DAILY CYCLE STARTING');
  console.log('   ' + new Date().toUTCString());
  console.log('═══════════════════════════════════════════════════════\n');

  let cycleRunId = 0;
  try {
    cycleRunId = await createCycleRun();
    console.log(`📋 Cycle run ID: ${cycleRunId}`);
  } catch (err: any) {
    console.error('Failed to create cycle_run record:', err.message);
    // Continue without DB tracking if DB is unavailable
  }

  // ── Step 1: Trend Detection ──────────────────────────────────────────────
  const trends = await runStep(
    cycleRunId, 1, 'Trend Detection',
    () => detectTrends(),
    [{ keyword: 'trending now', searchVolume: 0 }]
  );

  // Pick the top keyword for this cycle
  const topKeyword = trends[0]?.keyword ?? 'trending now';

  // ── Step 2: Design Generation ────────────────────────────────────────────
  const design = await runStep(
    cycleRunId, 2, 'Design Generation',
    () => generateDesign(topKeyword),
    {
      designUrl: `https://placehold.co/1024x1024?text=${encodeURIComponent(topKeyword)}`,
      removedBgUrl: `https://placehold.co/1024x1024?text=${encodeURIComponent(topKeyword)}`,
    }
  );

  // ── Step 3: Product Creation ─────────────────────────────────────────────
  const product = await runStep(
    cycleRunId, 3, 'Product Creation',
    () => createProduct(topKeyword, design.removedBgUrl),
    {
      printifyProductId: `fallback-${Date.now()}`,
      productUrl: 'https://printify.com',
      cost: 10,
      price: 25,
    }
  );

  // ── Step 4: Publish to Shopify ───────────────────────────────────────────
  const shopify = await runStep(
    cycleRunId, 4, 'Publish to Shopify',
    () => publishToShopify(topKeyword, design.removedBgUrl, product.printifyProductId),
    {
      shopifyProductId: `fallback-${Date.now()}`,
      shopifyUrl: 'https://example.myshopify.com',
    }
  );

  // ── Step 5: Video Creation ───────────────────────────────────────────────
  const video = await runStep(
    cycleRunId, 5, 'Video Creation',
    () => createVideo(topKeyword),
    {
      videoUrl: `https://placehold.co/1080x1920?text=${encodeURIComponent(topKeyword)}`,
      script: `Check out our "${topKeyword}" tee — link in bio!`,
      duration: 15,
    }
  );

  // ── Step 6: Social Distribution ──────────────────────────────────────────
  const social = await runStep(
    cycleRunId, 6, 'Social Distribution',
    () => distributeToSocial(topKeyword, video.videoUrl, video.script),
    { scheduledPosts: [] }
  );

  // ── Step 7: Order Sync ───────────────────────────────────────────────────
  const orders = await runStep(
    cycleRunId, 7, 'Order Sync',
    () => syncOrders(cycleRunId),
    { newOrderCount: 0, totalRevenue: 0 }
  );

  // ── Step 8: Revenue Tracking ─────────────────────────────────────────────
  const revenue = await runStep(
    cycleRunId, 8, 'Revenue Tracking',
    () => trackRevenue(),
    { totalRevenue: 0, totalCost: 0, profit: 0, profitMargin: 0, orderCount: 0 }
  );

  // ── Step 9: Owner Notification ───────────────────────────────────────────
  const summary: CycleSummary = {
    cycleRunId,
    trends,
    design,
    product,
    shopify,
    video,
    social,
    orders,
    revenue,
    notification: { success: false, emailSent: false }, // filled below
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };

  const notification = await runStep(
    cycleRunId, 9, 'Owner Notification',
    () => notifyOwner(summary),
    { success: false, emailSent: false }
  );

  summary.notification = notification;
  summary.completedAt = new Date().toISOString();
  summary.durationMs = Date.now() - startTime;

  // Persist final summary
  if (cycleRunId > 0) {
    try {
      await completeCycleRun(cycleRunId, summary);
    } catch (err: any) {
      console.error('Failed to persist cycle summary:', err.message);
    }
  }

  console.log(`\n✅ Cycle completed in ${(summary.durationMs / 1000).toFixed(1)}s\n`);
  return summary;
}
