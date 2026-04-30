/**
 * Cycle Runner Job
 * Schedules the 9-step daily cycle to run at 9 AM UTC every day.
 * Also exports triggerCycleManually() for on-demand execution.
 */

import cron from 'node-cron';
import { runCycle, type CycleSummary } from '../services/cycleRunner';

// Track whether a cycle is currently running to prevent overlapping runs
let isRunning = false;

async function executeCycle(): Promise<CycleSummary | null> {
  if (isRunning) {
    console.log('⚠️  Cycle already running — skipping this trigger');
    return null;
  }

  isRunning = true;
  try {
    return await runCycle();
  } finally {
    isRunning = false;
  }
}

/**
 * Initialize the cron schedule.
 * Runs daily at 09:00 UTC (cron: "0 9 * * *").
 */
export function initializeCronJob(): void {
  const schedule = process.env.CYCLE_CRON_SCHEDULE ?? '0 9 * * *';

  console.log(`⏰ Scheduling daily cycle runner: "${schedule}" (UTC)`);

  cron.schedule(schedule, async () => {
    console.log(`\n⏰ Cron triggered at ${new Date().toUTCString()}`);
    await executeCycle();
  }, {
    timezone: 'UTC',
  });

  console.log('✅ Cycle runner cron job initialized');
}

/**
 * Manually trigger the cycle outside of the cron schedule.
 * Used by the POST /api/cycle/run endpoint.
 */
export async function triggerCycleManually(): Promise<CycleSummary | null> {
  console.log(`\n🔧 Manual cycle trigger at ${new Date().toUTCString()}`);
  return executeCycle();
}

export { isRunning };
