import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const campaignRouter = createRouter({
  campaigns: createRouter({
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.campaigns).where(eq(schema.campaigns.userId, ctx.user.id)).orderBy(desc(schema.campaigns.createdAt));
    }),
    create: authedQuery
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          cycleId: z.number().optional(),
          platforms: z.array(z.string()).default([]),
          autoPublishProducts: z.boolean().default(false),
          autoGenerateSocial: z.boolean().default(false),
          postFrequency: z.enum(["hourly", "daily", "weekly"]).default("daily"),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        const [result] = await db.insert(schema.campaigns).values({
          userId: ctx.user.id,
          ...input,
          startDate: input.startDate || new Date(),
        }).$returningId();
        return result;
      }),
    update: authedQuery
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["draft", "scheduled", "active", "paused", "completed"]).optional(),
          platforms: z.array(z.string()).optional(),
          autoPublishProducts: z.boolean().optional(),
          autoGenerateSocial: z.boolean().optional(),
          postFrequency: z.enum(["hourly", "daily", "weekly"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        await db.update(schema.campaigns).set(data).where(eq(schema.campaigns.id, id));
        return { success: true };
      }),
    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.campaigns).where(eq(schema.campaigns.id, input.id));
      return { success: true };
    }),
  }),

  templates: createRouter({
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.socialTemplates).where(eq(schema.socialTemplates.userId, ctx.user.id)).orderBy(desc(schema.socialTemplates.createdAt));
    }),
    create: authedQuery
      .input(
        z.object({
          name: z.string().min(1),
          platform: z.enum(["instagram", "tiktok", "twitter", "facebook", "pinterest"]),
          captionTemplate: z.string().optional(),
          hashtagSet: z.array(z.string()).optional(),
          imagePrompt: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        await db.insert(schema.socialTemplates).values({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
    update: authedQuery
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          captionTemplate: z.string().optional(),
          hashtagSet: z.array(z.string()).optional(),
          imagePrompt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        await db.update(schema.socialTemplates).set(data).where(eq(schema.socialTemplates.id, id));
        return { success: true };
      }),
    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.socialTemplates).where(eq(schema.socialTemplates.id, input.id));
      return { success: true };
    }),
  }),

  posts: createRouter({
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.socialPosts).where(eq(schema.socialPosts.accountId, ctx.user.id)).orderBy(desc(schema.socialPosts.scheduledAt));
    }),
    create: authedQuery
      .input(
        z.object({
          cycleId: z.number(),
          platform: z.enum(["instagram", "tiktok", "twitter", "facebook", "pinterest", "youtube", "other"]),
          content: z.string().min(1),
          mediaUrls: z.array(z.string()).optional(),
          scheduledAt: z.date().optional(),
          status: z.enum(["scheduled", "published", "failed", "draft"]).default("draft"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        await db.insert(schema.socialPosts).values({
          accountId: ctx.user.id,
          ...input,
          mediaUrls: input.mediaUrls || [],
        });
        return { success: true };
      }),
    update: authedQuery
      .input(
        z.object({
          id: z.number(),
          content: z.string().optional(),
          status: z.enum(["scheduled", "published", "failed", "draft"]).optional(),
          scheduledAt: z.date().optional(),
          mediaUrls: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, ...data } = input;
        await db.update(schema.socialPosts).set(data).where(eq(schema.socialPosts.id, id));
        return { success: true };
      }),
    delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.socialPosts).where(eq(schema.socialPosts.id, input.id));
      return { success: true };
    }),
  }),
});
