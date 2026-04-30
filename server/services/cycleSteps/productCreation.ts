/**
 * Step 3 — Product Creation (Printify)
 * Creates a print-on-demand product with the generated design.
 * Falls back to mock data when PRINTIFY_API_KEY is absent.
 */

import axios from 'axios';

export interface ProductResult {
  printifyProductId: string;
  productUrl: string;
  cost: number;
  price: number;
}

const PRINTIFY_BASE = 'https://api.printify.com/v1';
const RETAIL_PRICE = 25.00;
const COST_PRICE = 10.00;

// Bella+Canvas 3001 blueprint ID on Printify
const BLUEPRINT_ID = 6;
// Default print provider (Monster Digital)
const PRINT_PROVIDER_ID = 29;

async function createPrintifyProduct(
  keyword: string,
  designUrl: string,
  apiKey: string,
  shopId: string
): Promise<ProductResult> {
  // 1. Upload the image to Printify
  const uploadRes = await axios.post(
    `${PRINTIFY_BASE}/uploads/images.json`,
    { file_name: `${keyword.replace(/\s+/g, '-')}.png`, url: designUrl },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  const imageId: string = uploadRes.data.id;

  // 2. Create the product
  const productPayload = {
    title: `${keyword} — Limited Edition Tee`,
    description: `Trending design inspired by "${keyword}". Premium Bella+Canvas 3001 unisex t-shirt.`,
    blueprint_id: BLUEPRINT_ID,
    print_provider_id: PRINT_PROVIDER_ID,
    variants: [
      { id: 17887, price: Math.round(RETAIL_PRICE * 100), is_enabled: true }, // S
      { id: 17888, price: Math.round(RETAIL_PRICE * 100), is_enabled: true }, // M
      { id: 17889, price: Math.round(RETAIL_PRICE * 100), is_enabled: true }, // L
      { id: 17890, price: Math.round(RETAIL_PRICE * 100), is_enabled: true }, // XL
    ],
    print_areas: [
      {
        variant_ids: [17887, 17888, 17889, 17890],
        placeholders: [
          {
            position: 'front',
            images: [{ id: imageId, x: 0.5, y: 0.5, scale: 1, angle: 0 }],
          },
        ],
      },
    ],
  };

  const createRes = await axios.post(
    `${PRINTIFY_BASE}/shops/${shopId}/products.json`,
    productPayload,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  const productId: string = createRes.data.id;
  const productUrl = `https://printify.com/app/editor/${productId}`;

  // 3. Publish to connected Shopify store
  await axios.post(
    `${PRINTIFY_BASE}/shops/${shopId}/products/${productId}/publish.json`,
    {
      title: true,
      description: true,
      images: true,
      variants: true,
      tags: true,
      keyFeatures: true,
      shipping_template: true,
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  return {
    printifyProductId: productId,
    productUrl,
    cost: COST_PRICE,
    price: RETAIL_PRICE,
  };
}

export async function createProduct(
  keyword: string,
  designUrl: string
): Promise<ProductResult> {
  console.log(`🖨️  [Step 3] Creating Printify product for: "${keyword}"...`);

  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    console.warn('   ⚠️  PRINTIFY_API_KEY or PRINTIFY_SHOP_ID not set — using mock product');
    return {
      printifyProductId: `mock-printify-${Date.now()}`,
      productUrl: `https://printify.com/app/editor/mock-${Date.now()}`,
      cost: COST_PRICE,
      price: RETAIL_PRICE,
    };
  }

  try {
    const result = await createPrintifyProduct(keyword, designUrl, apiKey, shopId);
    console.log(`   ✅ Printify product created: ${result.printifyProductId}`);
    return result;
  } catch (err: any) {
    console.error(`   ❌ Printify product creation failed: ${err.message}`);
    return {
      printifyProductId: `fallback-printify-${Date.now()}`,
      productUrl: `https://printify.com/app/editor/fallback-${Date.now()}`,
      cost: COST_PRICE,
      price: RETAIL_PRICE,
    };
  }
}
