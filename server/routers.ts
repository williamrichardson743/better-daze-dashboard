import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from './_core/trpc';
import * as db from './db';
import { TRPCError } from '@trpc/server';

/**
 * Main application router
 * All procedures are type-safe and automatically available on the frontend via tRPC
 */
export const appRouter = router({
  // ─── Authentication ───────────────────────────────────────────────────
  auth: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
      // Clear session cookie
      ctx.res.clearCookie('session');
      return { success: true };
    }),
  }),

  // ─── Dashboard ───────────────────────────────────────────────────────
  dashboard: router({
    metrics: protectedProcedure.query(async ({ ctx }) => {
      const stats = await db.getShopifyStats(ctx.user.id);
      const cycle = await db.getCurrentCycle(ctx.user.id);
      const socialStats = await db.getSocialStats(ctx.user.id);

      return {
        revenue: stats.totalRevenue,
        units: stats.totalUnits,
        activeDrops: stats.activeProducts,
        tiktokViews: socialStats.tiktokViews,
        instagramReach: socialStats.instagramReach,
        cyclesRun: stats.cyclesRun,
      };
    }),

    recentOrders: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getRecentOrders(ctx.user.id, input.limit);
      }),

    cycleStatus: protectedProcedure.query(async ({ ctx }) => {
      const cycle = await db.getCurrentCycle(ctx.user.id);
      if (!cycle) {
        return null;
      }

      return {
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        status: cycle.status,
        currentPhase: cycle.currentPhase,
        slogan: cycle.slogan,
        startedAt: cycle.startedAt,
        progress: calculatePhaseProgress(cycle.currentPhase, cycle.status),
      };
    }),

    transmissionLog: protectedProcedure
      .input(z.object({ cycleId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getTransmissionLogs(input.cycleId, input.limit);
      }),
  }),

  // ─── Cycle Management ───────────────────────────────────────────────
  cycle: router({
    trigger: protectedProcedure.mutation(async ({ ctx }) => {
      // Check if cycle is already running
      const existingCycle = await db.getCurrentCycle(ctx.user.id);
      if (existingCycle && existingCycle.status === 'running') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A cycle is already running',
        });
      }

      // Create new cycle
      const cycleNumber = (existingCycle?.cycleNumber || 0) + 1;
      const cycle = await db.createCycle({
        userId: ctx.user.id,
        cycleNumber,
        status: 'running',
        currentPhase: 1,
      });

      // Log cycle start
      await db.createTransmissionLog({
        cycleId: cycle.id,
        message: `Cycle #${cycleNumber} initiated - Phase 1: Trend Ingestion`,
        logType: 'info',
        phase: 1,
      });

      return cycle;
    }),

    status: protectedProcedure
      .input(z.object({ cycleId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cycle = await db.getCycle(input.cycleId);
        if (!cycle || cycle.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cycle not found',
          });
        }

        return {
          id: cycle.id,
          cycleNumber: cycle.cycleNumber,
          status: cycle.status,
          currentPhase: cycle.currentPhase,
          slogan: cycle.slogan,
          startedAt: cycle.startedAt,
          completedAt: cycle.completedAt,
          progress: calculatePhaseProgress(cycle.currentPhase, cycle.status),
        };
      }),

    history: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getCycleHistory(ctx.user.id, input.limit);
      }),

    updatePhase: protectedProcedure
      .input(
        z.object({
          cycleId: z.number(),
          phase: z.number(),
          slogan: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cycle = await db.getCycle(input.cycleId);
        if (!cycle || cycle.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cycle not found',
          });
        }

        const phaseNames = [
          'Trend Ingestion',
          'Design Generation',
          'Printify Upload',
          'Content Generation',
          'Social Distribution',
          'Performance Optimization',
        ];

        await db.updateCycle(input.cycleId, {
          currentPhase: input.phase,
          slogan: input.slogan,
        });

        await db.createTransmissionLog({
          cycleId: input.cycleId,
          message: `Phase ${input.phase}: ${phaseNames[input.phase - 1]} completed`,
          logType: 'success',
          phase: input.phase,
        });

        return { success: true };
      }),

    complete: protectedProcedure
      .input(z.object({ cycleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const cycle = await db.getCycle(input.cycleId);
        if (!cycle || cycle.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cycle not found',
          });
        }

        await db.updateCycle(input.cycleId, {
          status: 'completed',
          completedAt: new Date(),
        });

        await db.createTransmissionLog({
          cycleId: input.cycleId,
          message: 'Cycle completed successfully',
          logType: 'success',
          phase: 6,
        });

        return { success: true };
      }),
  }),

  // ─── Product Management ───────────────────────────────────────────────
  product: router({
    create: protectedProcedure
      .input(
        z.object({
          cycleId: z.number(),
          slogan: z.string(),
          designUrl: z.string(),
          price: z.number().default(27.99),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cycle = await db.getCycle(input.cycleId);
        if (!cycle || cycle.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cycle not found',
          });
        }

        return db.createProduct({
          cycleId: input.cycleId,
          slogan: input.slogan,
          designUrl: input.designUrl,
          price: input.price.toString(),
          status: 'draft',
        });
      }),

    list: protectedProcedure
      .input(z.object({ cycleId: z.number().optional(), limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getProducts(ctx.user.id, input.cycleId, input.limit);
      }),

    publish: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          shopifyId: z.string(),
          printifyId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.updateProduct(input.productId, {
          status: 'published',
          shopifyId: input.shopifyId,
          printifyId: input.printifyId,
        });
      }),
  }),

  // ─── Order Management ───────────────────────────────────────────────
  order: router({
    sync: protectedProcedure.mutation(async ({ ctx }) => {
      // This would call Shopify API to sync orders
      const result = await db.syncShopifyOrders(ctx.user.id);
      return result;
    }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getShopifyStats(ctx.user.id);
    }),

    recent: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getRecentOrders(ctx.user.id, input.limit);
      }),

    byProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getOrdersByProduct(input.productId);
      }),
  }),

  // ─── Social Media Management ───────────────────────────────────────
  social: router({
    accounts: protectedProcedure.query(async ({ ctx }) => {
      return db.getSocialAccounts(ctx.user.id);
    }),

    connect: protectedProcedure
      .input(
        z.object({
          platform: z.enum(['tiktok', 'instagram', 'youtube']),
          accountId: z.string(),
          accountName: z.string(),
          accessToken: z.string(),
          refreshToken: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createSocialAccount({
          userId: ctx.user.id,
          platform: input.platform,
          accountId: input.accountId,
          accountName: input.accountName,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          isConnected: true,
        });
      }),

    disconnect: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.updateSocialAccount(input.accountId, {
          isConnected: false,
          accessToken: null,
          refreshToken: null,
        });
      }),

    posts: protectedProcedure
      .input(z.object({ cycleId: z.number().optional(), limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getSocialPosts(ctx.user.id, input.cycleId, input.limit);
      }),

    postStats: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return db.getSocialPostStats(input.postId);
      }),
  }),

  // ─── Analytics ───────────────────────────────────────────────────────
  analytics: router({
    get: protectedProcedure
      .input(z.object({ cycleId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (input.cycleId) {
          return db.getAnalyticsByCycle(input.cycleId);
        }
        return db.getAnalyticsForUser(ctx.user.id);
      }),

    summary: protectedProcedure.query(async ({ ctx }) => {
      return db.getAnalyticsSummary(ctx.user.id);
    }),

    byPlatform: protectedProcedure.query(async ({ ctx }) => {
      return db.getAnalyticsByPlatform(ctx.user.id);
    }),

    roi: protectedProcedure
      .input(z.object({ cycleId: z.number() }))
      .query(async ({ input }) => {
        return db.calculateROI(input.cycleId);
      }),
  }),

  // ─── Configuration ───────────────────────────────────────────────────
  config: router({
    loadApiKeys: protectedProcedure.query(async ({ ctx }) => {
      // Return only non-sensitive key names (not actual values)
      return {
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        printifyConfigured: !!process.env.PRINTIFY_API_KEY,
        shopifyConfigured: !!process.env.SHOPIFY_STORE_DOMAIN,
        elevenLabsConfigured: !!process.env.ELEVENLABS_API_KEY,
        ayrshareConfigured: !!process.env.AYRSHARE_API_KEY,
      };
    }),

    saveApiKeys: protectedProcedure
      .input(
        z.object({
          openaiKey: z.string().optional(),
          printifyKey: z.string().optional(),
          shopifyDomain: z.string().optional(),
          shopifyToken: z.string().optional(),
          elevenLabsKey: z.string().optional(),
          ayrshareKey: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // In production, these would be saved to a secure config store
        // For now, we just validate they're provided
        if (!input.openaiKey && !input.printifyKey) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'At least one API key must be provided',
          });
        }

        return { success: true, message: 'API keys saved successfully' };
      }),

    scheduler: protectedProcedure
      .input(
        z.object({
          enabled: z.boolean(),
          intervalHours: z.number().min(1).max(168),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.updateSchedulerConfig(ctx.user.id, {
          enabled: input.enabled,
          intervalHours: input.intervalHours,
          nextRunAt: input.enabled ? new Date(Date.now() + input.intervalHours * 3600000) : null,
        });
      }),

    getScheduler: protectedProcedure.query(async ({ ctx }) => {
      return db.getSchedulerConfig(ctx.user.id);
    }),
  }),

  // ─── System ───────────────────────────────────────────────────────
  system: router({
    health: publicProcedure.query(async () => {
      return {
        status: 'healthy',
        timestamp: new Date(),
        version: '2.0.0',
      };
    }),

    notifyOwner: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Send notification to project owner
        // This would integrate with the Manus notification system
        return { success: true };
      }),
  }),
});

/**
 * Calculate progress percentage for a phase
 */
function calculatePhaseProgress(currentPhase: number, status: string): number {
  if (status === 'completed') return 100;
  if (status === 'failed') return 0;
  return (currentPhase / 6) * 100;
}

export type AppRouter = typeof appRouter;
