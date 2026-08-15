/**
 * cycleRunner.ts
 * Better Daze — Autonomous POD Pipeline
 *
 * Wires Phase 3 (Printify product creation + Shopify publish) of the 6-phase
 * Trend-to-Cash cycle. Mirrors the working logic in bd_revenue_engine.py but
 * implemented in TypeScript so it runs inside the Hono/tRPC backend.
 *
 * Environment variables consumed (never hardcoded here):
 *   PRINTIFY_API_TOKEN  — Printify personal access token
 *   PRINTIFY_SHOP_ID    — Printify shop ID (default: 27082819)
 *   SHOPIFY_STORE_URL   — Shopify store domain (e.g. shop.better-daze-sf.com)
 *   SHOPIFY_ADMIN_TOKEN — Shopify Admin API access token
 */

import "dotenv/config";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN ?? "";
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID ?? "27082819";
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL ?? "";
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN ?? "";

const PRINTIFY_BASE = "https://api.printify.com/v1";

const PRINTIFY_HEADERS: Record<string, string> = {
  Authorization: `Bearer ${PRINTIFY_API_TOKEN}`,
  "Content-Type": "application/json",
};

// ─── PRODUCT BLUEPRINTS ───────────────────────────────────────────────────────
// Values match the working Python reference (bd_revenue_engine.py).
// blueprint_id, print_provider_id, variant IDs, and price (cents) are the
// Printify catalog identifiers that have been verified live by Manus.

export const BLUEPRINTS = {
  tee: {
    blueprintId: 12,
    printProviderId: 29,
    variantIds: [18100, 18101, 18102, 18103, 18104, 18105],
    priceCents: 3299,
  },
  mug: {
    blueprintId: 68,
    printProviderId: 1,
    variantIds: [33719],
    priceCents: 1999,
  },
  poster: {
    blueprintId: 282,
    printProviderId: 2,
    variantIds: [43135, 43138, 43141, 43144, 43147],
    priceCents: 2499,
  },
  hoodie: {
    blueprintId: 77,
    printProviderId: 39,
    variantIds: [32878, 32879, 32880, 32881, 32882],
    priceCents: 4999,
  },
} as const;

export type ProductType = keyof typeof BLUEPRINTS;

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Phase3Input {
  /** The slogan / title text for this product (e.g. "PRIVACY IS A PRIVILEGE") */
  slogan: string;
  /**
   * Base64-encoded PNG/JPG of the design to place on the product.
   * Either this OR designImageUrl must be provided.
   */
  designImageBase64?: string;
  /** Filename used when uploading to Printify (e.g. "design.png") */
  designFileName?: string;
  /**
   * Public URL of a design image. Printify will fetch it directly.
   * Preferred over base64 when the image is already hosted.
   */
  designImageUrl?: string;
  /** Product type to create. Defaults to "tee". */
  productType?: ProductType;
}

export interface Phase3Result {
  printifyProductId: string;
  shopifyProductId: string | null;
  published: boolean;
  title: string;
  productType: ProductType;
  error?: string;
}

// ─── PHASE 3A: UPLOAD IMAGE TO PRINTIFY ──────────────────────────────────────

/**
 * Upload a design image to Printify's media library.
 * Returns the Printify image ID on success.
 *
 * Accepts either a public URL (preferred, faster) or a raw base64 payload.
 */
export async function uploadImageToPrintify(opts: {
  imageUrl?: string;
  imageBase64?: string;
  fileName?: string;
}): Promise<string> {
  if (!PRINTIFY_API_TOKEN) {
    throw new Error("PRINTIFY_API_TOKEN is not set");
  }

  let body: Record<string, string>;

  if (opts.imageUrl) {
    // Printify can fetch the image directly from a public URL — no base64 needed.
    body = { url: opts.imageUrl, file_name: opts.fileName ?? "design.png" };
  } else if (opts.imageBase64) {
    body = {
      contents: opts.imageBase64,
      file_name: opts.fileName ?? "design.png",
    };
  } else {
    throw new Error("uploadImageToPrintify: provide either imageUrl or imageBase64");
  }

  const res = await fetch(`${PRINTIFY_BASE}/uploads/images.json`, {
    method: "POST",
    headers: PRINTIFY_HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printify image upload failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

// ─── PHASE 3B: CREATE PRODUCT ON PRINTIFY ────────────────────────────────────

/**
 * Create a POD product on Printify using an already-uploaded image ID.
 * Returns the new Printify product ID.
 */
export async function createPrintifyProduct(opts: {
  slogan: string;
  printifyImageId: string;
  productType?: ProductType;
}): Promise<string> {
  const type: ProductType = opts.productType ?? "tee";
  const bp = BLUEPRINTS[type];

  const title = `${opts.slogan} — Official Narrative Div ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const description =
    `Official Narrative Div Standard Issue. '${opts.slogan}' — ` +
    `Institutional compliance series. Limited batch. Premium ${type}.`;

  const payload = {
    title,
    description,
    blueprint_id: bp.blueprintId,
    print_provider_id: bp.printProviderId,
    variants: bp.variantIds.map((id) => ({
      id,
      price: bp.priceCents,
      is_enabled: true,
    })),
    print_areas: [
      {
        variant_ids: bp.variantIds,
        placeholders: [
          {
            position: "front",
            images: [
              {
                id: opts.printifyImageId,
                x: 0.5,
                y: 0.5,
                scale: 1,
                angle: 0,
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json`,
    {
      method: "POST",
      headers: PRINTIFY_HEADERS,
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printify product creation failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

// ─── PHASE 3C: PUBLISH PRINTIFY PRODUCT TO SHOPIFY ───────────────────────────

/**
 * Trigger Printify's publish endpoint. This pushes the product to the connected
 * Shopify store (shop.better-daze-sf.com) as a live listing.
 *
 * Returns the Shopify product ID extracted from the Printify response, or null
 * if the response body does not include it (the publish still succeeded).
 */
export async function publishToShopify(printifyProductId: string): Promise<{
  shopifyProductId: string | null;
  published: boolean;
}> {
  if (!PRINTIFY_API_TOKEN) {
    throw new Error("PRINTIFY_API_TOKEN is not set");
  }

  const publishPayload = {
    title: true,
    description: true,
    images: true,
    variants: true,
    tags: true,
    keyFeatures: true,
    shipping_template: true,
  };

  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${printifyProductId}/publish.json`,
    {
      method: "POST",
      headers: PRINTIFY_HEADERS,
      body: JSON.stringify(publishPayload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Printify publish-to-Shopify failed (${res.status}): ${text.slice(0, 300)}`
    );
  }

  // Printify returns 200 with { "external": { "id": "...", "handle": "..." } }
  // when the product lands in Shopify. Parse defensively.
  let shopifyProductId: string | null = null;
  try {
    const data = (await res.json()) as {
      external?: { id?: string; handle?: string };
    };
    shopifyProductId = data?.external?.id ?? null;
  } catch {
    // Body may be empty on a 200 — publish still succeeded.
  }

  return { shopifyProductId, published: true };
}

// ─── SHOPIFY DIRECT: verify a published product ──────────────────────────────

/**
 * Optional helper — fetches a Shopify product via the Admin REST API to verify
 * it went live. Not called by runPhase3 itself (that goes through Printify's
 * publish endpoint). Requires SHOPIFY_STORE_URL and SHOPIFY_ADMIN_TOKEN.
 */
export async function getShopifyProduct(shopifyProductId: string): Promise<{
  id: string;
  title: string;
  status: string;
  handle: string;
} | null> {
  if (!SHOPIFY_STORE_URL || !SHOPIFY_ADMIN_TOKEN) {
    return null;
  }

  const host = SHOPIFY_STORE_URL.replace(/^https?:\/\//, "");
  const url = `https://${host}/admin/api/2024-01/products/${shopifyProductId}.json`;

  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    product?: { id: string; title: string; status: string; handle: string };
  };
  return data.product ?? null;
}

// ─── PHASE 3: MAIN ENTRY POINT ────────────────────────────────────────────────

/**
 * runPhase3
 *
 * Called by operations-router.ts when a pipeline run reaches the "printify"
 * phase. Replaces the previous TODO placeholder.
 *
 * Steps:
 *  1. Upload the design image to Printify
 *  2. Create a product on Printify with the correct blueprint/variants
 *  3. Publish that product to the connected Shopify store
 *
 * All credentials are read from environment variables — nothing is hardcoded.
 */
export async function runPhase3(input: Phase3Input): Promise<Phase3Result> {
  const type: ProductType = input.productType ?? "tee";

  const title =
    `${input.slogan} — Official Narrative Div ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  try {
    // Step 1: Upload the design image
    const printifyImageId = await uploadImageToPrintify({
      imageUrl: input.designImageUrl,
      imageBase64: input.designImageBase64,
      fileName: input.designFileName ?? "design.png",
    });

    // Step 2: Create the product on Printify
    const printifyProductId = await createPrintifyProduct({
      slogan: input.slogan,
      printifyImageId,
      productType: type,
    });

    // Step 3: Publish to Shopify via Printify's publish endpoint
    const { shopifyProductId, published } = await publishToShopify(printifyProductId);

    return {
      printifyProductId,
      shopifyProductId,
      published,
      title,
      productType: type,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      printifyProductId: "",
      shopifyProductId: null,
      published: false,
      title,
      productType: type,
      error: message,
    };
  }
}
