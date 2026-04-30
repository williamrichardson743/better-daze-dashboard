/**
 * Step 8 — Revenue Tracking
 * Queries the database for today's orders and calculates earnings metrics.
 */

import { query } from '../../db/connection';

export interface RevenueResult {
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number; // percentage 0–100
  orderCount: number;
}

export async function trackRevenue(): Promise<RevenueResult> {
  console.log('💰 [Step 8] Calculating today\'s revenue metrics...');

  try {
    // Today's orders (UTC midnight to now)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const rows = await query<{
      total_revenue: string | null;
      total_cost: string | null;
      order_count: string | null;
    }>(
      `SELECT
         COALESCE(SUM(revenue), 0) AS total_revenue,
         COALESCE(SUM(cost), 0)    AS total_cost,
         COUNT(*)                  AS order_count
       FROM pod_orders
       WHERE ordered_at >= ?
         AND status NOT IN ('cancelled', 'refunded')`,
      [todayStart.toISOString().slice(0, 19).replace('T', ' ')]
    );

    const row = rows[0];
    const totalRevenue = parseFloat(row?.total_revenue ?? '0') || 0;
    const totalCost = parseFloat(row?.total_cost ?? '0') || 0;
    const orderCount = parseInt(row?.order_count ?? '0', 10) || 0;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    const result: RevenueResult = {
      totalRevenue,
      totalCost,
      profit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      orderCount,
    };

    console.log(`   ✅ Revenue: $${totalRevenue.toFixed(2)} | Cost: $${totalCost.toFixed(2)} | Profit: $${profit.toFixed(2)} (${result.profitMargin.toFixed(1)}%)`);
    return result;
  } catch (err: any) {
    console.error(`   ❌ Revenue tracking failed: ${err.message}`);
    return {
      totalRevenue: 0,
      totalCost: 0,
      profit: 0,
      profitMargin: 0,
      orderCount: 0,
    };
  }
}
