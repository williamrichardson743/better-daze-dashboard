import { z } from "zod";
import { eq, desc, and, isNull } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const agentRouter = createRouter({
  // ─── AGENTS ───
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.agents).orderBy(desc(schema.agents.updatedAt));
  }),

  register: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["ai_agent", "human", "system"]).default("ai_agent"),
        capabilities: z.array(z.string()).default([]),
        webhookUrl: z.string().optional(),
        apiKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(schema.agents).values(input).$returningId();
      return { id: result.id };
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["online", "offline", "busy", "idle"]),
        currentTaskId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.agents).set({ ...data, lastActive: new Date() }).where(eq(schema.agents.id, id));
      return { success: true };
    }),

  // ─── TASKS ───
  tasks: createRouter({
    list: publicQuery.query(async () => {
      const db = getDb();
      return db.select().from(schema.agentTasks).orderBy(desc(schema.agentTasks.createdAt));
    }),

    create: authedQuery
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          assignedAgentId: z.number().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
          category: z.enum(["immediate", "short_term", "deferred"]).default("short_term"),
          dueDate: z.date().optional(),
          requiresApproval: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        const [result] = await db.insert(schema.agentTasks).values({
          ...input,
          createdBy: ctx.user.id,
        }).$returningId();
        return { id: result.id };
      }),

    update: authedQuery
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["pending", "in_progress", "completed", "failed", "blocked"]).optional(),
          assignedAgentId: z.number().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          result: z.record(z.string(), z.any()).optional(),
          errorMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.status === "completed") {
          updateData.completedAt = new Date();
        }
        await db.update(schema.agentTasks).set(updateData).where(eq(schema.agentTasks.id, id));
        return { success: true };
      }),

    approve: authedQuery
      .input(z.object({ id: z.number(), approved: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        await db.update(schema.agentTasks).set({
          approvedBy: input.approved ? ctx.user.id : null,
          approvedAt: input.approved ? new Date() : null,
          status: input.approved ? "pending" : "blocked",
        }).where(eq(schema.agentTasks.id, input.id));
        return { success: true };
      }),

    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.agentTasks).where(eq(schema.agentTasks.id, input.id));
      return { success: true };
    }),

    // Auto-claim: agent picks up unassigned task matching their capabilities
    claim: authedQuery
      .input(z.object({ taskId: z.number(), agentId: z.number() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.update(schema.agentTasks).set({
          assignedAgentId: input.agentId,
          status: "in_progress",
        }).where(
          and(
            eq(schema.agentTasks.id, input.taskId),
            isNull(schema.agentTasks.assignedAgentId)
          )
        );
        // Also update agent status
        await db.update(schema.agents).set({
          status: "busy",
          currentTaskId: input.taskId,
          lastActive: new Date(),
        }).where(eq(schema.agents.id, input.agentId));
        return { success: true };
      }),
  }),

  // ─── MESSAGES ───
  messages: createRouter({
    list: publicQuery.query(async () => {
      const db = getDb();
      return db.select().from(schema.agentMessages).orderBy(desc(schema.agentMessages.createdAt)).limit(100);
    }),

    send: authedQuery
      .input(
        z.object({
          fromAgentId: z.number(),
          toAgentId: z.number().optional(),
          taskId: z.number().optional(),
          messageType: z.enum(["status_update", "question", "result", "error", "broadcast", "handoff"]).default("status_update"),
          content: z.string().min(1),
          metadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.insert(schema.agentMessages).values(input);
        return { success: true };
      }),
  }),
});
