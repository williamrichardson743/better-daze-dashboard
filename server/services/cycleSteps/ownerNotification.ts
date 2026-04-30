/**
 * Step 9 — Owner Notification
 * Logs a full daily summary to the console (and optionally sends an email).
 * Email sending can be wired up via SendGrid/Nodemailer using OWNER_EMAIL env var.
 */

import type { CycleSummary } from '../cycleRunner';

export interface NotificationResult {
  success: boolean;
  emailSent: boolean;
}

function formatSummary(summary: CycleSummary): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '  BETTER DAZE — DAILY CYCLE SUMMARY',
    `  Run ID : ${summary.cycleRunId}`,
    `  Date   : ${new Date().toUTCString()}`,
    '═══════════════════════════════════════════════════════',
    '',
    '📊 TREND DETECTION',
    ...summary.trends.map((t) => `   • "${t.keyword}" — ${t.searchVolume.toLocaleString()} searches`),
    '',
    '🎨 DESIGN GENERATION',
    `   Design URL : ${summary.design.designUrl.substring(0, 80)}`,
    '',
    '🖨️  PRODUCT CREATION',
    `   Printify ID : ${summary.product.printifyProductId}`,
    `   Product URL : ${summary.product.productUrl}`,
    `   Cost / Price: $${summary.product.cost.toFixed(2)} / $${summary.product.price.toFixed(2)}`,
    '',
    '🛍️  SHOPIFY LISTING',
    `   Shopify ID  : ${summary.shopify.shopifyProductId}`,
    `   Store URL   : ${summary.shopify.shopifyUrl}`,
    '',
    '🎬 VIDEO CREATION',
    `   Script : "${summary.video.script.substring(0, 100)}..."`,
    `   Duration: ${summary.video.duration}s`,
    '',
    '📱 SOCIAL DISTRIBUTION',
    ...summary.social.scheduledPosts.map(
      (p) => `   • ${p.platform.padEnd(10)} → ${p.scheduledTime}`
    ),
    '',
    '📦 ORDER SYNC',
    `   New Orders   : ${summary.orders.newOrderCount}`,
    `   Revenue Synced: $${summary.orders.totalRevenue.toFixed(2)}`,
    '',
    '💰 REVENUE TRACKING',
    `   Today Revenue : $${summary.revenue.totalRevenue.toFixed(2)}`,
    `   Today Cost    : $${summary.revenue.totalCost.toFixed(2)}`,
    `   Today Profit  : $${summary.revenue.profit.toFixed(2)}`,
    `   Profit Margin : ${summary.revenue.profitMargin.toFixed(1)}%`,
    `   Orders Today  : ${summary.revenue.orderCount}`,
    '',
    '═══════════════════════════════════════════════════════',
  ];

  return lines.join('\n');
}

export async function notifyOwner(summary: CycleSummary): Promise<NotificationResult> {
  console.log('\n📧 [Step 9] Sending owner notification...\n');

  const report = formatSummary(summary);
  console.log(report);

  // Optional: send via email if OWNER_EMAIL is configured
  const ownerEmail = process.env.OWNER_EMAIL;
  let emailSent = false;

  if (ownerEmail) {
    // TODO: Wire up SendGrid / Nodemailer here
    // Example with SendGrid:
    // await sgMail.send({ to: ownerEmail, from: 'noreply@betterdaze.com',
    //   subject: `Daily Cycle Report — ${new Date().toDateString()}`, text: report });
    console.log(`   📬 Email would be sent to: ${ownerEmail} (not yet wired up)`);
    emailSent = false; // set to true once email transport is configured
  } else {
    console.log('   ℹ️  OWNER_EMAIL not set — skipping email delivery');
  }

  return { success: true, emailSent };
}
