/**
 * server/jobs/cycleRunnerJob.ts
 *
 * Cron-based scheduler that triggers the autonomous cycle on a configurable
 * interval (default: every 72 hours).
 *
 * Design goals:
 * - initializeCronJob() never throws — if the pool isn't ready or the cron
 *   library fails to load, the error is logged and the server continues.
 * - Each cron tick is wrapped in a try-catch so a single failed run does not
 *   crash the process or prevent future runs.
 * - The job is a no-op when SCHEDULER_ENABLED is not "true", making it safe
 *   to deploy without configuring a scheduler.
 */

import { waitForPool } from '../db/connection';
import { runCycle } from '../services/cycleRunner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduledJob {
  stop: () => void;
}

// ─── Internal state ───────────────────────────────────────────────────────────

let activeJob: ScheduledJob | null = null;
let isRunning = false; // Guard against overlapping executions

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert an interval in hours to a cron expression.
 * Falls back to a 72-hour schedule for unsupported intervals.
 */
function hoursToCron(hours: number): string {
  // Simple mapping for common intervals
  if (hours === 1) return '0 * * * *';
  if (hours === 6) return '0 */6 * * *';
  if (hours === 12) return '0 */12 * * *';
  if (hours === 24) return '0 0 * * *';
  if (hours === 48) return '0 0 */2 * *';
  if (hours === 72) return '0 0 */3 * *';
  if (hours === 168) return '0 0 * * 0'; // weekly

  // Generic: run at midnight every N days (approximate for > 24 h)
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `0 0 */${days} * *`;
  }

  // Sub-day: run every N hours
  if (hours < 24) {
    return `0 */${hours} * * *`;
  }

  // Fallback: every 3 days ≈ 72 hours
  console.warn(
    `[cycleRunnerJob] Cannot map ${hours}h to a clean cron expression; defaulting to 72-hour schedule.`,
  );
  return '0 0 */3 * *';
}

/**
 * Retrieve the system user ID that owns the scheduler.
 * Returns null if no suitable user is found, in which case the job is skipped.
 */
async function getSchedulerUserId(): Promise<number | null> {
  try {
    const { query } = await import('../db/connection');
    const rows = await query<{ id: number }>(
      `SELECT u.id
       FROM users u
       JOIN scheduler_config sc ON sc.user_id = u.id
       WHERE sc.enabled = 1
       ORDER BY sc.updated_at DESC
       LIMIT 1`,
      [],
    );

    if (rows.length > 0 && rows[0].id > 0) {
      return rows[0].id;
    }

    console.warn(
      '[cycleRunnerJob] No user with an enabled scheduler config found; skipping run.',
    );
    return null;
  } catch (err) {
    console.error('[cycleRunnerJob] Failed to query scheduler user:', err);
    return null;
  }
}

/**
 * The function executed on each cron tick.
 * Wrapped in a try-catch so errors never propagate to the cron library.
 */
async function onTick(): Promise<void> {
  if (isRunning) {
    console.log(
      '[cycleRunnerJob] Previous cycle is still running; skipping this tick.',
    );
    return;
  }

  isRunning = true;
  console.log('[cycleRunnerJob] Cron tick — starting scheduled cycle run.');

  try {
    const userId = await getSchedulerUserId();
    if (userId === null) {
      return;
    }

    const result = await runCycle({ userId });

    if (result.status === 'completed') {
      console.log(
        `[cycleRunnerJob] Scheduled cycle ${result.cycleId} completed successfully.`,
      );
    } else {
      console.error(
        `[cycleRunnerJob] Scheduled cycle ${result.cycleId} failed: ${result.error}`,
      );
    }
  } catch (err) {
    // This should not happen because runCycle() catches its own errors,
    // but guard here as a last resort.
    console.error('[cycleRunnerJob] Unexpected error during cron tick:', err);
  } finally {
    isRunning = false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialise the cron job.
 *
 * - Waits for the database pool to be ready before scheduling.
 * - Does NOT throw — any error is logged and the function returns gracefully
 *   so that the HTTP server can still start.
 * - Respects the SCHEDULER_ENABLED and SCHEDULER_INTERVAL_HOURS env vars.
 *
 * @param intervalHours  Override the scheduling interval (default: 72)
 */
export async function initializeCronJob(intervalHours = 72): Promise<void> {
  const enabled = process.env.SCHEDULER_ENABLED === 'true';

  if (!enabled) {
    console.log(
      '[cycleRunnerJob] Scheduler is disabled (SCHEDULER_ENABLED != "true"). Skipping.',
    );
    return;
  }

  // Wait for the database pool before scheduling so the first tick doesn't
  // fail with a "pool not ready" error.
  try {
    await waitForPool();
  } catch (err) {
    console.error(
      '[cycleRunnerJob] Database pool not ready; cron job will not be started:',
      err,
    );
    return;
  }

  // Dynamically import node-cron so that a missing dependency doesn't crash
  // the module at load time — the server can still serve HTTP requests.
  let cron: typeof import('node-cron');
  try {
    cron = await import('node-cron');
  } catch (err) {
    console.error(
      '[cycleRunnerJob] Failed to import node-cron; cron job will not be started:',
      err,
    );
    return;
  }

  const hours =
    Number(process.env.SCHEDULER_INTERVAL_HOURS) || intervalHours;
  const cronExpression = hoursToCron(hours);

  console.log(
    `[cycleRunnerJob] Scheduling cycle runner — interval: ${hours}h, cron: "${cronExpression}"`,
  );

  try {
    activeJob = cron.schedule(cronExpression, () => {
      // onTick is async; fire-and-forget with explicit error capture.
      onTick().catch((err) => {
        console.error('[cycleRunnerJob] Unhandled error in onTick:', err);
      });
    });

    console.log('[cycleRunnerJob] Cron job started successfully.');
  } catch (err) {
    console.error('[cycleRunnerJob] Failed to schedule cron job:', err);
  }
}

/**
 * Stop the active cron job, if one is running.
 * Safe to call even if the job was never started.
 */
export function stopCronJob(): void {
  if (activeJob) {
    activeJob.stop();
    activeJob = null;
    console.log('[cycleRunnerJob] Cron job stopped.');
  }
}

/**
 * Manually trigger a single cycle run outside of the cron schedule.
 * Useful for the POST /api/cycle/run endpoint.
 *
 * @param userId  The user on whose behalf the cycle runs
 * @param cycleId Optional existing cycle record to resume
 */
export async function triggerManualRun(
  userId: number,
  cycleId?: number,
): Promise<ReturnType<typeof runCycle>> {
  if (isRunning) {
    throw new Error(
      'A cycle is already running. Please wait for it to complete before starting another.',
    );
  }

  return runCycle({ userId, cycleId });
}
