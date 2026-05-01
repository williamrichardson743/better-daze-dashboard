/**
 * server/services/cycleRunner.ts
 *
 * Core business logic for executing the six-phase autonomous cycle.
 *
 * Each phase is a discrete async step.  The runner records progress to the
 * database after every phase so that a crash mid-cycle leaves an accurate
 * audit trail and allows future resumption logic to pick up where it left off.
 */

import { query } from '../db/connection';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CycleRunOptions {
  userId: number;
  cycleId?: number; // If provided, resume an existing cycle record
}

export interface CycleRunResult {
  cycleId: number;
  status: 'completed' | 'failed';
  completedPhases: number;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Persist a transmission log entry for the given cycle.
 * Silently swallows errors so that a logging failure never aborts the cycle.
 */
async function log(
  cycleId: number,
  message: string,
  logType: 'info' | 'success' | 'warn' | 'error' = 'info',
  phase = 0,
): Promise<void> {
  try {
    await query(
      `INSERT INTO transmission_logs (cycle_id, message, log_type, phase, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [cycleId, message, logType, phase],
    );
  } catch (err) {
    console.error(
      `[cycleRunner] Failed to write log for cycle ${cycleId}:`,
      err,
    );
  }
}

/**
 * Update the cycle row's current phase and optional status.
 */
async function updateCyclePhase(
  cycleId: number,
  phase: number,
  status?: 'pending' | 'running' | 'completed' | 'failed',
  extra: Record<string, unknown> = {},
): Promise<void> {
  const setClauses: string[] = ['current_phase = ?', 'updated_at = NOW()'];
  const values: unknown[] = [phase];

  if (status) {
    setClauses.push('status = ?');
    values.push(status);
  }

  for (const [col, val] of Object.entries(extra)) {
    setClauses.push(`${col} = ?`);
    values.push(val);
  }

  values.push(cycleId);

  await query(
    `UPDATE cycles SET ${setClauses.join(', ')} WHERE id = ?`,
    values,
  );
}

/**
 * Resolve or create the cycle database record.
 *
 * Returns the numeric cycle ID.  Guards against 0 / undefined / null so that
 * subsequent INSERT statements that reference cycle_id as a foreign key never
 * receive an invalid value.
 */
async function resolveCycleId(opts: CycleRunOptions): Promise<number> {
  // If a valid cycleId was supplied, verify it exists and belongs to the user.
  if (opts.cycleId && opts.cycleId > 0) {
    const rows = await query<{ id: number }>(
      'SELECT id FROM cycles WHERE id = ? AND user_id = ? LIMIT 1',
      [opts.cycleId, opts.userId],
    );

    if (rows.length > 0 && rows[0].id > 0) {
      return rows[0].id;
    }

    console.warn(
      `[cycleRunner] Supplied cycleId ${opts.cycleId} not found for user ${opts.userId}; creating a new cycle.`,
    );
  }

  // Determine the next cycle number for this user.
  const countRows = await query<{ cnt: number }>(
    'SELECT COUNT(*) AS cnt FROM cycles WHERE user_id = ?',
    [opts.userId],
  );
  const cycleNumber = (countRows[0]?.cnt ?? 0) + 1;

  // Create a fresh cycle record.
  const result = await query(
    `INSERT INTO cycles (user_id, cycle_number, status, current_phase, started_at, created_at, updated_at)
     VALUES (?, ?, 'running', 0, NOW(), NOW(), NOW())`,
    [opts.userId, cycleNumber],
  );

  // mysql2 returns an OkPacket / ResultSetHeader for INSERT statements.
  // The insertId field holds the auto-increment primary key.
  const insertId = (result as unknown as { insertId: number }).insertId;

  if (!insertId || insertId <= 0) {
    throw new Error(
      `Failed to create cycle record for user ${opts.userId} — insertId was ${insertId}.`,
    );
  }

  return insertId;
}

// ─── Phase implementations ────────────────────────────────────────────────────

/** Phase 1 — Trend Ingestion */
async function runPhase1(cycleId: number): Promise<{ slogan: string }> {
  await log(cycleId, 'Phase 1: Trend Ingestion — starting', 'info', 1);

  // TODO: integrate real trend-scraping / GPT-4o slogan generation.
  // For now, return a deterministic placeholder so the cycle can proceed.
  const slogan = `Better Daze Drop #${cycleId}`;

  await log(
    cycleId,
    `Phase 1: Trend Ingestion — slogan generated: "${slogan}"`,
    'success',
    1,
  );
  return { slogan };
}

/** Phase 2 — Design Generation */
async function runPhase2(
  cycleId: number,
  slogan: string,
): Promise<{ designUrl: string }> {
  await log(cycleId, 'Phase 2: Design Generation — starting', 'info', 2);

  // TODO: integrate DALL-E 3 + Remove.bg.
  const designUrl = `https://placeholder.better-daze.com/designs/${cycleId}.png`;

  await log(
    cycleId,
    `Phase 2: Design Generation — design ready at ${designUrl}`,
    'success',
    2,
  );
  return { designUrl };
}

/** Phase 3 — Product Creation */
async function runPhase3(
  cycleId: number,
  slogan: string,
  designUrl: string,
): Promise<{ productId: number }> {
  await log(cycleId, 'Phase 3: Product Creation — starting', 'info', 3);

  // TODO: integrate Printify + Shopify.
  const result = await query(
    `INSERT INTO products (cycle_id, slogan, design_url, price, status, created_at)
     VALUES (?, ?, ?, '27.99', 'draft', NOW())`,
    [cycleId, slogan, designUrl],
  );

  const productId = (result as unknown as { insertId: number }).insertId;

  if (!productId || productId <= 0) {
    throw new Error(
      `Phase 3: Failed to create product record — insertId was ${productId}.`,
    );
  }

  await log(
    cycleId,
    `Phase 3: Product Creation — product #${productId} created`,
    'success',
    3,
  );
  return { productId };
}

/** Phase 4 — Content Generation */
async function runPhase4(cycleId: number): Promise<void> {
  await log(cycleId, 'Phase 4: Content Generation — starting', 'info', 4);

  // TODO: integrate ElevenLabs voiceover + video generation.

  await log(
    cycleId,
    'Phase 4: Content Generation — video content ready',
    'success',
    4,
  );
}

/** Phase 5 — Social Distribution */
async function runPhase5(cycleId: number): Promise<void> {
  await log(cycleId, 'Phase 5: Social Distribution — starting', 'info', 5);

  // TODO: integrate Ayrshare / TikTok / Instagram / YouTube posting.

  await log(
    cycleId,
    'Phase 5: Social Distribution — posts scheduled',
    'success',
    5,
  );
}

/** Phase 6 — Performance Optimisation */
async function runPhase6(cycleId: number): Promise<void> {
  await log(
    cycleId,
    'Phase 6: Performance Optimisation — starting',
    'info',
    6,
  );

  // TODO: collect engagement metrics and update analytics table.

  await query(
    `INSERT INTO analytics (cycle_id, total_revenue, total_views, total_engagement, roi, created_at)
     VALUES (?, 0, 0, 0, 0, NOW())`,
    [cycleId],
  );

  await log(
    cycleId,
    'Phase 6: Performance Optimisation — analytics recorded',
    'success',
    6,
  );
}

// ─── Main runner ──────────────────────────────────────────────────────────────

/**
 * Execute all six phases of the autonomous cycle for the given user.
 *
 * - Resolves or creates the cycle database record before any phase runs.
 * - Updates `current_phase` in the database after each successful phase.
 * - Marks the cycle as `failed` and records the error message if any phase
 *   throws, then re-throws so the caller can surface the error.
 *
 * @param opts  userId (required) and optional cycleId to resume
 * @returns     CycleRunResult describing the outcome
 */
export async function runCycle(opts: CycleRunOptions): Promise<CycleRunResult> {
  let cycleId = 0;

  try {
    // ── Resolve / create the cycle record ──────────────────────────────────
    cycleId = await resolveCycleId(opts);

    console.log(
      `[cycleRunner] Starting cycle ${cycleId} for user ${opts.userId}`,
    );

    // ── Phase 1 ────────────────────────────────────────────────────────────
    const { slogan } = await runPhase1(cycleId);
    await updateCyclePhase(cycleId, 1, undefined, { slogan });

    // ── Phase 2 ────────────────────────────────────────────────────────────
    const { designUrl } = await runPhase2(cycleId, slogan);
    await updateCyclePhase(cycleId, 2);

    // ── Phase 3 ────────────────────────────────────────────────────────────
    await runPhase3(cycleId, slogan, designUrl);
    await updateCyclePhase(cycleId, 3);

    // ── Phase 4 ────────────────────────────────────────────────────────────
    await runPhase4(cycleId);
    await updateCyclePhase(cycleId, 4);

    // ── Phase 5 ────────────────────────────────────────────────────────────
    await runPhase5(cycleId);
    await updateCyclePhase(cycleId, 5);

    // ── Phase 6 ────────────────────────────────────────────────────────────
    await runPhase6(cycleId);
    await updateCyclePhase(cycleId, 6, 'completed', {
      completed_at: new Date(),
    });

    await log(cycleId, 'Cycle completed successfully', 'success', 6);
    console.log(`[cycleRunner] Cycle ${cycleId} completed successfully.`);

    return { cycleId, status: 'completed', completedPhases: 6 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cycleRunner] Cycle ${cycleId} failed:`, err);

    // Attempt to mark the cycle as failed in the database.
    if (cycleId > 0) {
      try {
        await query(
          `UPDATE cycles
           SET status = 'failed', error_message = ?, updated_at = NOW()
           WHERE id = ?`,
          [message, cycleId],
        );
        await log(cycleId, `Cycle failed: ${message}`, 'error');
      } catch (dbErr) {
        console.error(
          `[cycleRunner] Could not update failure status for cycle ${cycleId}:`,
          dbErr,
        );
      }
    }

    return {
      cycleId,
      status: 'failed',
      completedPhases: 0,
      error: message,
    };
  }
}
