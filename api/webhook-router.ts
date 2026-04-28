import { Hono } from "hono";
import Stripe from "stripe";
import { env } from "./lib/env";
import * as dashboardQueries from "./queries/dashboard";
import { createAuditLog } from "./queries/dashboard";

const stripe = env.stripeSecretKey && env.stripeSecretKey !== "sk_test_placeholder"
  ? new Stripe(env.stripeSecretKey, { apiVersion: "2024-12-18.acacia" as any })
  : null;

export const webhookRouter = new Hono();

webhookRouter.post("/stripe", async (c) => {
  if (!stripe) {
    return c.json({ received: true, mode: "demo" });
  }

  const sig = c.req.header("stripe-signature");
  const payload = await c.req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig || "", env.stripeWebhookSecret);
  } catch (err: any) {
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.userId || "0");
      const plan = session.metadata?.plan || "starter";
      if (userId) {
        await dashboardQueries.upsertSubscription({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: session.line_items?.data[0]?.price?.id || "",
          plan: plan as any,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        });
        await dashboardQueries.createAuditLog({
          userId,
          action: "subscription_created",
          resource: "billing",
          details: { plan, customerId },
          timestamp: new Date(),
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      // Try to find user by customer ID from existing subscriptions
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = parseInt(sub.metadata?.userId || "0");
      if (userId) {
        const existing = await dashboardQueries.findSubscriptionByUserId(userId);
        if (existing) {
          await dashboardQueries.upsertSubscription({
            ...existing,
            status: "canceled",
            cancelAtPeriodEnd: false,
          });
        }
      }
      break;
    }
  }

  return c.json({ received: true });
});

webhookRouter.post("/shopify", async (c) => {
  const body = await c.req.json();
  // Handle Shopify order webhooks
  if (body.id && body.line_items) {
    // Process order creation/update
  }
  return c.json({ received: true });
});
