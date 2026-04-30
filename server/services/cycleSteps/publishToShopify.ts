/**
 * Step 4 — Publish to Shopify
 * Creates a product listing on the Shopify storefront via the Admin API.
 * Falls back to mock data when credentials are absent.
 */

import axios from 'axios';

export interface ShopifyPublishResult {
  shopifyProductId: string;
  shopifyUrl: string;
}

const SHOPIFY_API_VERSION = '2024-01';

function shopifyClient(domain: string, token: string) {
  return axios.create({
    baseURL: `https://${domain}/admin/api/${SHOPIFY_API_VERSION}`,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });
}

async function createShopifyProduct(
  keyword: string,
  designUrl: string,
  printifyProductId: string,
  domain: string,
  token: string
): Promise<ShopifyPublishResult> {
  const client = shopifyClient(domain, token);

  const payload = {
    product: {
      title: `${keyword} — Limited Edition Tee`,
      body_html: `
        <p>Trending design inspired by <strong>"${keyword}"</strong>.</p>
        <p>Premium Bella+Canvas 3001 unisex t-shirt. Soft, comfortable, and built to last.</p>
        <ul>
          <li>100% combed and ring-spun cotton</li>
          <li>Retail fit</li>
          <li>Sizes: S, M, L, XL</li>
          <li>Printed and shipped within 3-5 business days</li>
        </ul>
      `,
      vendor: 'Better Daze',
      product_type: 'T-Shirt',
      tags: [keyword, 'trending', 'print-on-demand', 'limited-edition', 'unisex'],
      status: 'active',
      variants: [
        { option1: 'S', price: '25.00', sku: `${printifyProductId}-S` },
        { option1: 'M', price: '25.00', sku: `${printifyProductId}-M` },
        { option1: 'L', price: '25.00', sku: `${printifyProductId}-L` },
        { option1: 'XL', price: '25.00', sku: `${printifyProductId}-XL` },
      ],
      options: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
      images: [{ src: designUrl, alt: `${keyword} t-shirt design` }],
    },
  };

  const response = await client.post('/products.json', payload);
  const product = response.data.product;

  return {
    shopifyProductId: String(product.id),
    shopifyUrl: `https://${domain}/products/${product.handle}`,
  };
}

export async function publishToShopify(
  keyword: string,
  designUrl: string,
  printifyProductId: string
): Promise<ShopifyPublishResult> {
  console.log(`🛍️  [Step 4] Publishing to Shopify for: "${keyword}"...`);

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

  if (!domain || !token) {
    console.warn('   ⚠️  SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_TOKEN not set — using mock');
    const mockId = `mock-shopify-${Date.now()}`;
    return {
      shopifyProductId: mockId,
      shopifyUrl: `https://example.myshopify.com/products/mock-${Date.now()}`,
    };
  }

  try {
    const result = await createShopifyProduct(
      keyword,
      designUrl,
      printifyProductId,
      domain,
      token
    );
    console.log(`   ✅ Shopify product created: ${result.shopifyProductId}`);
    console.log(`   🔗 URL: ${result.shopifyUrl}`);
    return result;
  } catch (err: any) {
    console.error(`   ❌ Shopify publish failed: ${err.message}`);
    return {
      shopifyProductId: `fallback-shopify-${Date.now()}`,
      shopifyUrl: `https://example.myshopify.com/products/fallback-${Date.now()}`,
    };
  }
}
