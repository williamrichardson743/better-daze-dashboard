import { relations } from "drizzle-orm";
import {
  users,
  cycles,
  products,
  orders,
  socialAccounts,
  socialPosts,
  transmissionLogs,
  adminSettings,
  apiKeys,
  sessions,
  loginHistory,
  roles,
  permissions,
  auditLogs,
  agents,
  agentTasks,
  apiCredentials,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  cycles: many(cycles),
  socialAccounts: many(socialAccounts),
  adminSettings: many(adminSettings),
  apiKeys: many(apiKeys),
  sessions: many(sessions),
  loginHistory: many(loginHistory),
  auditLogs: many(auditLogs),
}));

export const cyclesRelations = relations(cycles, ({ one, many }) => ({
  user: one(users, {
    fields: [cycles.userId],
    references: [users.id],
  }),
  products: many(products),
  socialPosts: many(socialPosts),
  transmissionLogs: many(transmissionLogs),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  cycle: one(cycles, {
    fields: [products.cycleId],
    references: [cycles.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [socialAccounts.userId],
    references: [users.id],
  }),
  posts: many(socialPosts),
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  cycle: one(cycles, {
    fields: [socialPosts.cycleId],
    references: [cycles.id],
  }),
  account: one(socialAccounts, {
    fields: [socialPosts.accountId],
    references: [socialAccounts.id],
  }),
}));

export const transmissionLogsRelations = relations(transmissionLogs, ({ one }) => ({
  cycle: one(cycles, {
    fields: [transmissionLogs.cycleId],
    references: [cycles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  role: one(roles, {
    fields: [permissions.roleId],
    references: [roles.id],
  }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  tasks: many(agentTasks),
}));

export const agentTasksRelations = relations(agentTasks, ({ one }) => ({
  assignedAgent: one(agents, {
    fields: [agentTasks.assignedAgentId],
    references: [agents.id],
  }),
}));

export const apiCredentialsRelations = relations(apiCredentials, ({ one }) => ({
  user: one(users, {
    fields: [apiCredentials.userId],
    references: [users.id],
  }),
}));
