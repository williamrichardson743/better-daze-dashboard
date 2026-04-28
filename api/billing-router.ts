import { z } from "zod";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { env } from "./lib/env";
import * as dashboardQueries from "./queries/dashboard";

const stripe = env.stripeSecretKey && env.stripeSecretKey !== "sk_test_placeholder"
  ? new Stripe(env.stripeSecretKey, { apiVersion: "2024-12-18.acacia" as any })
  : null;

const priceMap: Record<string, string> = {
  starter: env.stripePriceStarter,
  growth: env.stripePriceGrowth,
  enterprise: env.stripePriceEnterprise,
};

export const billingRouter = createRouter({
  getSubscription: authedQuery.query(async ({ ctx }) => {
    const sub = await dashboardQueries.findSubscriptionByUserId(ctx.user.id);
    return sub || null;
  }),

  createCheckoutSession: authedQuery
    .input(z.object({ plan: z.enum(["starter", "growth", "enterprise"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        // Demo mode: simulate subscription
        await dashboardQueries.upsertSubscription({
          userId: ctx.user.id,
          plan: input.plan,
          status: "active",
          stripeCustomerId: `demo_cus_${ctx.user.id}`,
          stripeSubscriptionId: `demo_sub_${ctx.user.id}`,
          stripePriceId: `demo_price_${input.plan}`,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        });
        return { url: `${env.appUrl}/app/billing?success=true` };
      }

      const priceId = priceMap[input.plan];
      if (!priceId || priceId === "price_placeholder") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan or Stripe not configured" });
      }

      let customerId = "";
      const existing = await dashboardQueries.findSubscriptionByUserId(ctx.user.id);
      if (existing?.stripeCustomerId) {
        customerId = existing.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: { userId: String(ctx.user.id) },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${env.appUrl}/app/billing?success=true`,
        cancel_url: `${env.appUrl}/app/billing?canceled=true`,
        metadata: { userId: String(ctx.user.id), plan: input.plan },
      });

      return { url: session.url };
    }),

  createPortalSession: authedQuery.mutation(async ({ ctx }) => {
    const sub = await dashboardQueries.findSubscriptionByUserId(ctx.user.id);
    if (!sub?.stripeCustomerId || !stripe) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No active subscription found" });
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${env.appUrl}/app/billing`,
    });
    return { url: portal.url };
  }),

  cancelSubscription: authedQuery.mutation(async ({ ctx }) => {
    const sub = await dashboardQueries.findSubscriptionByUserId(ctx.user.id);
    if (!sub?.stripeSubscriptionId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No active subscription" });
    }

    if (stripe && sub.stripeSubscriptionId && !sub.stripeSubscriptionId.startsWith("demo_")) {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    }

    await dashboardQueries.upsertSubscription({
      ...sub,
      status: "canceled",
      cancelAtPeriodEnd: true,
    });

    return { success: true };
  }),
});
