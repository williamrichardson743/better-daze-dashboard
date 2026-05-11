import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const operationsRouter = createRouter({
  // ─── PIPELINE RUNS ───
  pipeline: createRouter({
    list: authedQuery.query(async () => {
      const db = getDb();
      return db.select().from(schema.pipelineRuns).orderBy(desc(schema.pipelineRuns.createdAt)).limit(50);
    }),
    create: adminQuery
      .input(
        z.object({
          name: z.string().min(1),
          cycleId: z.number().optional(),
          status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).default("pending"),
          currentPhase: z.enum(["trend", "design", "printify", "shopify", "social", "log", "complete"]).default("trend"),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const [result] = await db.insert(schema.pipelineRuns).values({
          ...input,
          trendPhaseStatus: "pending",
          designPhaseStatus: "pending",
          printifyPhaseStatus: "pending",
          shopifyPhaseStatus: "pending",
          socialPhaseStatus: "pending",
          logPhaseStatus: "pending",
        }).$returningId();
        return result;
      }),
    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).optional(),
          currentPhase: z.enum(["trend", "design", "printify", "shopify", "social", "log", "complete"]).optional(),
          trendPhaseStatus: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
          designPhaseStatus: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
          printifyPhaseStatus: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
          shopifyPhaseStatus: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
          socialPhaseStatus: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
          logPhaseStatus: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
          duration: z.number().optional(),
          errorMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        await db.update(schema.pipelineRuns).set(data).where(eq(schema.pipelineRuns.id, id));
        return { success: true };
      }),
    delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.pipelineRuns).where(eq(schema.pipelineRuns.id, input.id));
      return { success: true };
    }),
    start: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.update(schema.pipelineRuns).set({
        status: "in_progress",
        trendPhaseStatus: "in_progress",
        startedAt: new Date(),
      }).where(eq(schema.pipelineRuns.id, input.id));
      return { success: true };
    }),
  }),

  // ─── ACTION ITEMS / CHECKLIST ───
  actions: createRouter({
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.actionItems)
        .where(eq(schema.actionItems.userId, ctx.user.id))
        .orderBy(desc(schema.actionItems.priority), desc(schema.actionItems.createdAt));
    }),
    create: authedQuery
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          section: z.enum(["immediate", "short_term", "deferred"]).default("immediate"),
          priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
          dueDate: z.date().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        const [result] = await db.insert(schema.actionItems).values({
          userId: ctx.user.id,
          ...input,
        }).$returningId();
        return result;
      }),
    update: authedQuery
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          section: z.enum(["immediate", "short_term", "deferred"]).optional(),
          priority: z.enum(["low", "medium", "high", "critical"]).optional(),
          status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
          dueDate: z.date().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        await db.update(schema.actionItems).set(data).where(eq(schema.actionItems.id, id));
        return { success: true };
      }),
    toggleComplete: authedQuery.input(z.object({ id: z.number(), completed: z.boolean() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.update(schema.actionItems).set({
        status: input.completed ? "completed" : "open",
        completedAt: input.completed ? new Date() : null,
      }).where(eq(schema.actionItems.id, input.id));
      return { success: true };
    }),
    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.actionItems).where(eq(schema.actionItems.id, input.id));
      return { success: true };
    }),
  }),

  // ─── API CREDENTIALS HEALTH ───
  credentials: createRouter({
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select({
        id: schema.apiCredentials.id,
        userId: schema.apiCredentials.userId,
        serviceName: schema.apiCredentials.serviceName,
        displayName: schema.apiCredentials.displayName,
        status: schema.apiCredentials.status,
        lastVerifiedAt: schema.apiCredentials.lastVerifiedAt,
        expiresAt: schema.apiCredentials.expiresAt,
        scope: schema.apiCredentials.scope,
        metadata: schema.apiCredentials.metadata,
        createdAt: schema.apiCredentials.createdAt,
        updatedAt: schema.apiCredentials.updatedAt,
      }).from(schema.apiCredentials)
        .where(eq(schema.apiCredentials.userId, ctx.user.id))
        .orderBy(desc(schema.apiCredentials.updatedAt));
    }),
    upsert: adminQuery
      .input(
        z.object({
          id: z.number().optional(),
          serviceName: z.string().min(1),
          displayName: z.string().min(1),
          status: z.enum(["active", "expiring", "expired", "needs_rotation", "error", "unknown"]).default("unknown"),
          expiresAt: z.date().optional(),
          scope: z.string().optional(),
          metadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        if (input.id) {
          const { id, ...data } = input;
          await db.update(schema.apiCredentials).set({
            ...data,
            lastVerifiedAt: new Date(),
          }).where(eq(schema.apiCredentials.id, id));
          return { success: true, id };
        } else {
          const [result] = await db.insert(schema.apiCredentials).values({
            userId: ctx.user.id,
            serviceName: input.serviceName,
            displayName: input.displayName,
            status: input.status,
            lastVerifiedAt: new Date(),
            expiresAt: input.expiresAt,
            scope: input.scope,
            metadata: input.metadata,
          }).$returningId();
          return { success: true, id: result.id };
        }
      }),
    updateStatus: adminQuery
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["active", "expiring", "expired", "needs_rotation", "error", "unknown"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.update(schema.apiCredentials).set({
          status: input.status,
          lastVerifiedAt: new Date(),
        }).where(eq(schema.apiCredentials.id, input.id));
        return { success: true };
      }),
    delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.apiCredentials).where(eq(schema.apiCredentials.id, input.id));
      return { success: true };
    }),
  }),
});
