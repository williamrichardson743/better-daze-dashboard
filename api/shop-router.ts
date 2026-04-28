import { z } from "zod";
import { eq, and, inArray, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

// ─── PUBLIC SHOP ROUTER ───
export const shopRouter = createRouter({
  // List products for shop
  products: publicQuery.query(async () => {
    const db = getDb();
    const products = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.status, "live"))
      .orderBy(desc(schema.products.createdAt));

    const result = [];
    for (const product of products) {
      const variants = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.productId, product.id))
        .orderBy(schema.productVariants.size);

      const images = await db
        .select()
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, product.id))
        .orderBy(schema.productImages.sortOrder);

      result.push({ ...product, variants, images });
    }
    return result;
  }),

  // Get single product with variants and images
  productById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, input.id))
        .limit(1);
      const product = rows[0];
      if (!product) return null;

      const variants = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.productId, product.id))
        .orderBy(schema.productVariants.size);

      const images = await db
        .select()
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, product.id))
        .orderBy(schema.productImages.sortOrder);

      return { ...product, variants, images };
    }),

  // Get collections
  collections: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.isActive, true))
      .orderBy(schema.collections.sortOrder);
  }),

  // Get products by collection
  productsByCollection: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const collection = await db
        .select()
        .from(schema.collections)
        .where(eq(schema.collections.slug, input.slug))
        .limit(1);
      if (!collection[0]) return { collection: null, products: [] };

      const junctions = await db
        .select()
        .from(schema.productCollections)
        .where(eq(schema.productCollections.collectionId, collection[0].id));

      const productIds = junctions.map((j) => j.productId);
      if (productIds.length === 0) return { collection: collection[0], products: [] };

      const products = await db
        .select()
        .from(schema.products)
        .where(inArray(schema.products.id, productIds));

      const result = [];
      for (const product of products) {
        const images = await db
          .select()
          .from(schema.productImages)
          .where(eq(schema.productImages.productId, product.id));
        result.push({ ...product, images });
      }

      return { collection: collection[0], products: result };
    }),

  // Create customer order (checkout)
  createOrder: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        customerName: z.string().optional(),
        phone: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            variantId: z.number().optional(),
            quantity: z.number().min(1),
          })
        ),
        shippingAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
        }),
        subtotal: z.number(),
        shipping: z.number().default(0),
        tax: z.number().default(0),
        total: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const orderNumber = `BD-${Date.now().toString(36).toUpperCase()}`;

      const [order] = await db.insert(schema.customerOrders).values({
        orderNumber,
        email: input.email,
        customerName: input.customerName || "",
        phone: input.phone || "",
        status: "pending",
        paymentStatus: "pending",
        subtotal: String(input.subtotal),
        shipping: String(input.shipping),
        tax: String(input.tax),
        total: String(input.total),
        shippingAddress: input.shippingAddress as any,
      }).$returningId();

      for (const item of input.items) {
        const product = await db
          .select()
          .from(schema.products)
          .where(eq(schema.products.id, item.productId))
          .limit(1);
        if (!product[0]) continue;

        let variantName = "";
        let sku = product[0].sku || "";
        let price = product[0].price;
        let imageUrl = product[0].designUrl || "";

        if (item.variantId) {
          const variant = await db
            .select()
            .from(schema.productVariants)
            .where(eq(schema.productVariants.id, item.variantId))
            .limit(1);
          if (variant[0]) {
            variantName = [variant[0].size, variant[0].color].filter(Boolean).join(" / ");
            sku = variant[0].sku || sku;
            price = variant[0].price;
            const vImg = await db
              .select()
              .from(schema.productImages)
              .where(
                and(
                  eq(schema.productImages.variantId, variant[0].id),
                  eq(schema.productImages.isPrimary, true)
                )
              )
              .limit(1);
            if (vImg[0]) imageUrl = vImg[0].url;
          }
        }

        const totalPrice = parseFloat(price) * item.quantity;
        await db.insert(schema.orderItems).values({
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: product[0].name,
          variantName: variantName || undefined,
          sku,
          quantity: item.quantity,
          unitPrice: price,
          totalPrice: String(totalPrice),
          imageUrl,
        });
      }

      return { orderId: order.id, orderNumber };
    }),

  // Get order by number (for tracking)
  trackOrder: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const orders = await db
        .select()
        .from(schema.customerOrders)
        .where(eq(schema.customerOrders.orderNumber, input.orderNumber))
        .limit(1);
      if (!orders[0]) return null;

      const items = await db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, orders[0].id));

      return { order: orders[0], items };
    }),

  // Update order payment status
  updatePayment: publicQuery
    .input(
      z.object({
        orderId: z.number(),
        paymentIntentId: z.string(),
        status: z.enum(["paid", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.customerOrders)
        .set({
          stripePaymentIntentId: input.paymentIntentId,
          paymentStatus: input.status,
          status: input.status === "paid" ? "paid" : input.status === "failed" ? "pending" : "cancelled",
        })
        .where(eq(schema.customerOrders.id, input.orderId));
      return { success: true };
    }),

  // Get seller orders (for fulfillment)
  sellerOrders: authedQuery.query(async () => {
    const db = getDb();
    const orders = await db
      .select()
      .from(schema.customerOrders)
      .orderBy(desc(schema.customerOrders.createdAt))
      .limit(50);

    const result = [];
    for (const order of orders) {
      const items = await db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, order.id));
      result.push({ ...order, items });
    }
    return result;
  }),
});
