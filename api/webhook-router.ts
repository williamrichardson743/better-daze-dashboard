import { Hono } from "hono";
import { timingSafeEqual } from "crypto";
import { agentHubRouter } from "./agent-hub-router.js";
import type { User } from "../db/schema.js";

export const webhookRouter = new Hono();

webhookRouter.post("/shopify", async c => {
  const body = await c.req.json();
  // Handle Shopify order webhooks
  if (body.id && body.line_items) {
    // Process order creation/update
  }
  return c.json({ received: true });
});

/**
 * POST /api/webhooks/agent-callback
 * Secure programmatic ingest channel for active agent execution routines.
 * Verifies AGENT_SECRET_KEY via constant-time comparison, then updates task
 * status and triggers state machine cascades via the tRPC router.
 */
webhookRouter.post("/agent-callback", async c => {
  const secret = process.env.AGENT_SECRET_KEY;
  if (!secret) {
    return c.json({ error: "Webhook secret not configured." }, 500);
  }

  const signature = c.req.header("x-bd-agent-signature") ?? "";
  let signatureValid = false;
  try {
    signatureValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(secret)
    );
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    return c.json(
      { error: "DENIED: Security signature verification invalid." },
      401
    );
  }

  let body: {
    taskId?: unknown;
    status?: unknown;
    outputData?: unknown;
    agentLog?: unknown;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body." }, 400);
  }

  const { taskId, status, outputData, agentLog } = body;
  if (!taskId || !status) {
    return c.json(
      { error: "Missing mandatory parameters: taskId, status." },
      400
    );
  }

  // Construct a minimal internal admin context — never exposed externally
  const internalAdminUser: User = {
    id: 0,
    unionId: "webhook-internal",
    name: "Webhook System",
    email: null,
    avatar: null,
    role: "admin",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignInAt: new Date(),
  };

  const caller = agentHubRouter.createCaller({
    req: c.req.raw,
    resHeaders: new Headers(),
    user: internalAdminUser,
  });

  try {
    const result = await caller.updateTaskStatus({
      taskId: Number(taskId),
      status: status as
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "blocked",
      outputData: outputData as Record<string, unknown> | undefined,
      agentLog: agentLog
        ? `[Webhook Ingest] ${agentLog}`
        : "[Webhook Ingest] No log provided.",
    });

    return c.json({
      success: true,
      message: "Agent pipeline update accepted.",
      taskId: result.taskId,
      currentState: result.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: "Internal pipeline error.", details: message }, 500);
  }
});
