import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { runPhase3 } from "./integrations/cycleRunner.js";

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

    /**
     * start — triggers the Printify/Shopify pipeline for a run.
     *
     * Accepts optional product details. When slogan + designImageUrl (or
     * designImageBase64) are provided, Phase 3 runs immediately: image upload,
     * product creation on Printify, and publish to Shopify. When those fields
     * are omitted the run is simply marked in_progress so the caller can drive
     * the trend/design phases and supply product details via a follow-up call.
     *
     * Backward-compatible: existing callers that pass only { id } still work.
     */
    start: adminQuery
      .input(
        z.object({
          id: z.number(),
          // Phase 3 inputs — optional so the endpoint stays backward-compatible.
          slogan: z.string().optional(),
          designImageUrl: z.string().url().optional(),
          designImageBase64: z.string().optional(),
          designFileName: z.string().optional(),
          productType: z.enum(["tee", "mug", "poster", "hoodie"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const startedAt = new Date();

        // Mark the run in-progress and enter the printify phase.
        await db
          .update(schema.pipelineRuns)
          .set({
            status: "in_progress",
            currentPhase: "printify",
            printifyPhaseStatus: "in_progress",
            startedAt,
          })
          .where(eq(schema.pipelineRuns.id, input.id));

        // Only execute Phase 3 when product details were supplied.
        if (input.slogan && (input.designImageUrl || input.designImageBase64)) {
          const result = await runPhase3({
            slogan: input.slogan,
            designImageUrl: input.designImageUrl,
            designImageBase64: input.designImageBase64,
            designFileName: input.designFileName,
            productType: input.productType,
          });

          if (result.published && !result.error) {
            // Phase 3 + Shopify publish succeeded — advance to social phase.
            await db
              .update(schema.pipelineRuns)
              .set({
                currentPhase: "social",
                printifyPhaseStatus: "completed",
                shopifyPhaseStatus: "completed",
                name: `${input.slogan} | printify:${result.printifyProductId} | shopify:${result.shopifyProductId ?? "pending"}`,
              })
              .where(eq(schema.pipelineRuns.id, input.id));

            return {
              success: true,
              printifyProductId: result.printifyProductId,
              shopifyProductId: result.shopifyProductId,
              title: result.title,
              productType: result.productType,
            };
          } else {
            // Phase 3 failed — mark the run failed with the error message.
            await db
              .update(schema.pipelineRuns)
              .set({
                status: "failed",
                currentPhase: "printify",
                printifyPhaseStatus: "failed",
                errorMessage: result.error ?? "runPhase3 returned published=false",
              })
              .where(eq(schema.pipelineRuns.id, input.id));

            return {
              success: false,
              error: result.error ?? "Phase 3 failed",
            };
          }
        }

        // No product details — return immediately. Caller drives the next phase.
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
          ...input,
          userId: ctx.user.id,
        }).$returningId();
        return { id: result.id };
      }),
    update: authedQuery
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          section: z.enum(["immediate", "short_term", "deferred"]).optional(),
          priority: z.enum(["low", "medium", "high", "critical"]).optional(),
          isCompleted: z.boolean().optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        await db.update(schema.actionItems).set(data).where(eq(schema.actionItems.id, id));
        return { success: true };
      }),
    toggleComplete: authedQuery
      .input(z.object({ id: z.number(), isCompleted: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db
          .update(schema.actionItems)
          .set({
            isCompleted: input.isCompleted,
            completedAt: input.isCompleted ? new Date() : null,
          })
          .where(eq(schema.actionItems.id, input.id));
        return { success: true };
      }),
    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.actionItems).where(eq(schema.actionItems.id, input.id));
      return { success: true };
    }),
  }),

  // ─── API CREDENTIALS HEALTH MONITORING ───
  credentials: createRouter({
    list: authedQuery.query(async () => {
      const db = getDb();
      return db.select().from(schema.apiCredentials).orderBy(desc(schema.apiCredentials.updatedAt));
    }),
    upsert: adminQuery
      .input(
        z.object({
          service: z.string().min(1),
          label: z.string().optional(),
          status: z.enum(["active", "inactive", "error", "unknown"]).default("unknown"),
          lastChecked: z.date().optional(),
          metadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const existing = await db
          .select()
          .from(schema.apiCredentials)
          .where(eq(schema.apiCredentials.service, input.service))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(schema.apiCredentials)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(schema.apiCredentials.service, input.service));
        } else {
          await db.insert(schema.apiCredentials).values(input);
        }
        return { success: true };
      }),
    updateStatus: adminQuery
      .input(
        z.object({
          service: z.string().min(1),
          status: z.enum(["active", "inactive", "error", "unknown"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        await db
          .update(schema.apiCredentials)
          .set({ status: input.status, lastChecked: new Date(), updatedAt: new Date() })
          .where(eq(schema.apiCredentials.service, input.service));
        return { success: true };
      }),
    delete: adminQuery.input(z.object({ service: z.string() })).mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(schema.apiCredentials)
        .where(eq(schema.apiCredentials.service, input.service));
      return { success: true };
    }),
  }),
});
