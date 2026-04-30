/**
 * Step 7 — Order Sync (Shopify)
 * Fetches orders from the last 24 hours via the Shopify Admin API
 * and inserts new ones into the database.
 * Falls back to zero counts when credentials are absent.
 */

import axios from 'axios';
import { query } from '../../db/connection';

export interface OrderSyncResult {
  newOrderCount: number;
  totalRevenue: number;
}

const SHOPIFY_API_VERSION = '2024-01';

interface ShopifyOrder {
  id: number;
  name: string;
  financial_status: string;
  total_price: string;
  line_items: Array<{ product_id: number; quantity: number; price: string }>;
  created_at: string;
}

async function fetchShopifyOrders(
  domain: string,
  token: string,
  cycleRunId: number
): Promise<OrderSyncResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const response = await axios.get(
    `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/orders.json`,
    {
      params: {
        status: 'any',
        created_at_min: since,
        limit: 250,
        fields: 'id,name,financial_status,total_price,line_items,created_at',
      },
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    }
  );

  const orders: ShopifyOrder[] = response.data.orders ?? [];
  let newOrderCount = 0;
  let totalRevenue = 0;

  for (const order of orders) {
    const shopifyOrderId = String(order.id);
    const revenue = parseFloat(order.total_price) || 0;
    const status = order.financial_status ?? 'pending';
    const orderedAt = order.created_at;

    // Upsert — skip if already synced
    const existing = await query(
      'SELECT id FROM pod_orders WHERE shopify_order_id = ?',
      [shopifyOrderId]
    );

    if (existing.length === 0) {
      await query(
        `INSERT INTO pod_orders
           (cycle_run_id, shopify_order_id, revenue, cost, status, ordered_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cycleRunId, shopifyOrderId, revenue, 10.0, status, orderedAt]
      );
      newOrderCount++;
      totalRevenue += revenue;
    }
  }

  return { newOrderCount, totalRevenue };
}

export async function syncOrders(cycleRunId: number): Promise<OrderSyncResult> {
  console.log('📦 [Step 7] Syncing Shopify orders from last 24 hours...');

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

  if (!domain || !token) {
    console.warn('   ⚠️  Shopify credentials not set — skipping order sync');
    return { newOrderCount: 0, totalRevenue: 0 };
  }

  try {
    const result = await fetchShopifyOrders(domain, token, cycleRunId);
    console.log(`   ✅ Synced ${result.newOrderCount} new orders — $${result.totalRevenue.toFixed(2)} revenue`);
    return result;
  } catch (err: any) {
    console.error(`   ❌ Order sync failed: ${err.message}`);
    return { newOrderCount: 0, totalRevenue: 0 };
  }
}
