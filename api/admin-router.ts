import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, adminQuery } from "./middleware.js";
import * as dashboardQueries from "./queries/dashboard.js";

export const adminRouter = createRouter({
  // User Management
  users: createRouter({
    list: adminQuery.query(async () => {
      return dashboardQueries.findAllUsers();
    }),

    getById: adminQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const user = await dashboardQueries.findUserById(input.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return user;
    }),

    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          role: z.enum(["user", "admin", "viewer"]).optional(),
          status: z.enum(["active", "inactive"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await dashboardQueries.updateUser(id, data);
        return dashboardQueries.findUserById(id);
      }),

    delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await dashboardQueries.deleteUser(input.id);
      return { success: true };
    }),
  }),

  // Preferences
  preferences: createRouter({
    get: authedQuery.query(async ({ ctx }) => {
      const settings = await dashboardQueries.findAdminSettingsByUserId(ctx.user.id);
      return settings || null;
    }),

    update: authedQuery
      .input(
        z.object({
          theme: z.enum(["light", "dark", "auto"]).optional(),
          emailNotifications: z.boolean().optional(),
          inAppNotifications: z.boolean().optional(),
          notificationFrequency: z.enum(["instant", "daily", "weekly"]).optional(),
          itemsPerPage: z.number().min(5).max(100).optional(),
          defaultView: z.enum(["grid", "list"]).optional(),
          autoPublish: z.boolean().optional(),
          cycleFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
          companyName: z.string().optional(),
          logoUrl: z.string().optional(),
          primaryColor: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await dashboardQueries.findAdminSettingsByUserId(ctx.user.id);
        const data = {
          userId: ctx.user.id,
          ...input,
          updatedAt: new Date(),
        };
        if (!existing) {
          await dashboardQueries.upsertAdminSettings({
            userId: ctx.user.id,
            theme: input.theme || "auto",
            emailNotifications: input.emailNotifications ?? true,
            inAppNotifications: input.inAppNotifications ?? true,
            notificationFrequency: input.notificationFrequency || "daily",
            itemsPerPage: input.itemsPerPage || 20,
            defaultView: input.defaultView || "grid",
            autoPublish: input.autoPublish ?? false,
            cycleFrequency: input.cycleFrequency || "weekly",
            companyName: input.companyName || "Better Daze",
            logoUrl: input.logoUrl,
            primaryColor: input.primaryColor || "#6366f1",
          } as any);
        } else {
          await dashboardQueries.upsertAdminSettings({ ...existing, ...data } as any);
        }
        return dashboardQueries.findAdminSettingsByUserId(ctx.user.id);
      }),
  }),

  // Security
  security: createRouter({
    getSessions: authedQuery.query(async ({ ctx }) => {
      return dashboardQueries.findSessionsByUserId(ctx.user.id);
    }),

    logoutSession: authedQuery.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await dashboardQueries.deleteSession(input.id);
      return { success: true };
    }),

    generateApiKey: authedQuery
      .input(z.object({ name: z.string().min(1), expiresAt: z.date().optional() }))
      .mutation(async ({ ctx, input }) => {
        const id = crypto.randomUUID().replace(/-/g, "");
        const key = `bd_${crypto.randomUUID().replace(/-/g, "")}`;
        await dashboardQueries.createApiKey({
          id,
          userId: ctx.user.id,
          name: input.name,
          keyHash: key,
          createdAt: new Date(),
          expiresAt: input.expiresAt || null,
        } as any);
        return { id, key, name: input.name };
      }),

    revokeApiKey: authedQuery.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await dashboardQueries.deleteApiKey(input.id);
      return { success: true };
    }),

    getApiKeys: authedQuery.query(async ({ ctx }) => {
      return dashboardQueries.findApiKeysByUserId(ctx.user.id);
    }),

    getLoginHistory: authedQuery.query(async ({ ctx }) => {
      return dashboardQueries.findLoginHistoryByUserId(ctx.user.id, 50);
    }),
  }),

  // Roles
  roles: createRouter({
    list: adminQuery.query(async () => {
      const roles = await dashboardQueries.findAllRoles();
      const result = [];
      for (const role of roles) {
        const permissions = await dashboardQueries.findPermissionsByRoleId(role.id);
        result.push({ ...role, permissions });
      }
      return result;
    }),

    create: adminQuery
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dashboardQueries.createRole({ ...input, isCustom: true });
        return { success: true };
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await dashboardQueries.updateRole(id, data);
        return { success: true };
      }),

    delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await dashboardQueries.deleteRole(input.id);
      return { success: true };
    }),

    updatePermissions: adminQuery
      .input(
        z.object({
          roleId: z.number(),
          permissions: z.array(
            z.object({
              resource: z.enum(["products", "orders", "cycles", "users", "settings", "analytics", "social"]),
              action: z.enum(["create", "read", "update", "delete"]),
              granted: z.boolean(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        for (const perm of input.permissions) {
          await dashboardQueries.upsertPermission({
            roleId: input.roleId,
            resource: perm.resource,
            action: perm.action,
            granted: perm.granted,
          });
        }
        return { success: true };
      }),
  }),

  // Audit Logs
  auditLogs: createRouter({
    list: adminQuery.query(async () => {
      return dashboardQueries.findAllAuditLogs(100);
    }),
  }),
});
