import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { EventEmitter } from "events";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

// Real-time alert event hub — consumed by SSE endpoints or webhook listeners
export const agentEE = new EventEmitter();

type ContextEntry = { origin: string; timestamp: string; log: string };

export const agentHubRouter = createRouter({
  listTasks: authedQuery
    .input(z.object({}).optional())
    .query(async () => {
      const db = getDb();
      return db
        .select()
        .from(schema.agentTasks)
        .orderBy(desc(schema.agentTasks.createdAt))
        .limit(200);
    }),

  createTask: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        category: z.string().default("01_content_creation"),
        requiresApproval: z.boolean().default(false),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const initStack: ContextEntry[] = [
        {
          origin: "system_init",
          timestamp: new Date().toISOString(),
          log: `Task provisioned under blueprint sequence: ${input.category.toUpperCase()}`,
        },
      ];

      const [result] = await db
        .insert(schema.agentTasks)
        .values({
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          priority: input.priority,
          category: input.category,
          requiresApproval: input.requiresApproval,
          metadata: input.metadata,
          status: "pending",
          contextStack: initStack,
        })
        .$returningId();

      if (input.requiresApproval) {
        agentEE.emit("alert", {
          id: `alert_${result.id}`,
          type: "APPROVAL_REQUIRED",
          message: `CRITICAL ACTION GATE: "${input.title}" requires admin sign-off.`,
          timestamp: new Date().toISOString(),
        });
      }

      return result;
    }),

  updateTaskStatus: adminQuery
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum([
          "pending",
          "in_progress",
          "completed",
          "failed",
          "blocked",
        ]),
        outputData: z.record(z.string(), z.any()).optional(),
        agentLog: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [existing] = await db
        .select()
        .from(schema.agentTasks)
        .where(eq(schema.agentTasks.id, input.taskId))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      const prevStack: ContextEntry[] =
        (existing.contextStack as ContextEntry[]) ?? [];

      const updatedStack: ContextEntry[] = input.agentLog
        ? [
            ...prevStack,
            {
              origin: "agent_callback",
              timestamp: new Date().toISOString(),
              log: input.agentLog,
            },
          ]
        : prevStack;

      await db
        .update(schema.agentTasks)
        .set({
          status: input.status,
          contextStack: updatedStack,
          ...(input.outputData !== undefined
            ? { outputData: input.outputData }
            : {}),
        })
        .where(eq(schema.agentTasks.id, input.taskId));

      if (input.status === "completed") {
        await runStateMachineCascades(db, {
          ...existing,
          contextStack: updatedStack,
          outputData: (input.outputData ?? existing.outputData) as Record<
            string,
            unknown
          > | null,
        });
      }

      return { success: true, taskId: input.taskId, status: input.status };
    }),
});

/**
 * State machine cascade — auto-chains tasks through the 3-gap marketing pipeline.
 * GAP 01 (content_creation) → GAP 02 (platform_presence) → GAP 03 (email_dm_outreach)
 */
async function runStateMachineCascades(
  db: ReturnType<typeof getDb>,
  completedTask: typeof schema.agentTasks.$inferSelect & {
    contextStack: ContextEntry[];
    outputData: Record<string, unknown> | null;
  }
) {
  const timestamp = new Date().toISOString();
  const inheritedStack: ContextEntry[] = completedTask.contextStack ?? [];

  if (completedTask.category === "01_content_creation") {
    await db.insert(schema.agentTasks).values({
      createdBy: completedTask.createdBy,
      title: `Cross-Platform Listing Sync // Follow-up to BD-LOG-${completedTask.id}`,
      description: `Automated distributor payload generation. Sync finalized catalog materials across IG, FB Marketplace, Craigslist, Kashew.`,
      priority: completedTask.priority,
      category: "02_platform_presence",
      status: "pending",
      requiresApproval: false,
      metadata: completedTask.metadata as Record<string, unknown>,
      contextStack: [
        ...inheritedStack,
        {
          origin: "state_machine_transition",
          timestamp,
          log: `Auto-chained from completed BD-LOG-${completedTask.id}. Context payload forwarded.`,
        },
      ],
      outputData: null,
    });
    return;
  }

  if (completedTask.category === "02_platform_presence") {
    const [result] = await db
      .insert(schema.agentTasks)
      .values({
        createdBy: completedTask.createdBy,
        title: `Warm Lead DM Optimization Blast`,
        description: `Targeted outreach monitoring based on inventory distribution metadata. Dispatch contextual scripts to waiting customer segments.`,
        priority: "medium",
        category: "03_email_dm_outreach",
        status: "pending",
        requiresApproval: true,
        metadata: completedTask.metadata as Record<string, unknown>,
        contextStack: [
          ...inheritedStack,
          {
            origin: "state_machine_transition",
            timestamp,
            log: `Linear execution advanced to Outreach phase from BD-LOG-${completedTask.id}.`,
          },
        ],
        outputData: null,
      })
      .$returningId();

    agentEE.emit("alert", {
      id: `alert_${result.id}`,
      type: "APPROVAL_REQUIRED",
      message: `CRITICAL ACTION GATE: "Warm Lead DM Optimization Blast" initialized and locked. Admin validation mandatory.`,
      timestamp,
    });
  }
}
