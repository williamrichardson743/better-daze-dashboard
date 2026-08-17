import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? process.env.APP_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "github:257014198",
  ownerGitHubLogin: (process.env.OWNER_GITHUB_LOGIN ?? "williamrichardson743").trim().toLowerCase(),
  shopifyStoreUrl: process.env.SHOPIFY_STORE_URL ?? "",
  shopifyAdminToken: process.env.SHOPIFY_ADMIN_TOKEN ?? "",
  printifyApiToken: process.env.PRINTIFY_API_TOKEN ?? "",
  printifyShopId: process.env.PRINTIFY_SHOP_ID ?? "27082819",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
};
