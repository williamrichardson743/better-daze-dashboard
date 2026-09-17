import "dotenv/config";

function readEnvironmentValue(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export const oauthStartEnvironmentNames = ["APP_URL", "GITHUB_CLIENT_ID"] as const;
export const oauthCallbackEnvironmentNames = [
  ...oauthStartEnvironmentNames,
  "GITHUB_CLIENT_SECRET",
  "SESSION_SECRET",
  "DATABASE_URL",
] as const;

type OAuthEnvironmentStage = "start" | "callback";

export const env = {
  githubClientId: readEnvironmentValue("GITHUB_CLIENT_ID"),
  githubClientSecret: readEnvironmentValue("GITHUB_CLIENT_SECRET"),
  sessionSecret: readEnvironmentValue("SESSION_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: readEnvironmentValue("DATABASE_URL"),
  ownerUnionId: readEnvironmentValue("OWNER_UNION_ID"),
  ownerGitHubLogin: readEnvironmentValue("OWNER_GITHUB_LOGIN").toLowerCase(),
  shopifyStoreUrl: readEnvironmentValue("SHOPIFY_STORE_URL"),
  shopifyAdminToken: readEnvironmentValue("SHOPIFY_ADMIN_TOKEN"),
  printifyApiToken: readEnvironmentValue("PRINTIFY_API_TOKEN"),
  printifyShopId: readEnvironmentValue("PRINTIFY_SHOP_ID") || "27082819",
  appUrl: readEnvironmentValue("APP_URL"),
};

const oauthEnvironmentValues: Record<string, string> = {
  APP_URL: env.appUrl,
  GITHUB_CLIENT_ID: env.githubClientId,
  GITHUB_CLIENT_SECRET: env.githubClientSecret,
  SESSION_SECRET: env.sessionSecret,
  DATABASE_URL: env.databaseUrl,
  OWNER_UNION_ID: env.ownerUnionId,
  OWNER_GITHUB_LOGIN: env.ownerGitHubLogin,
};

/** Returns variable names only; no environment values are exposed. */
export function missingOAuthEnvironment(stage: OAuthEnvironmentStage): string[] {
  const requiredNames =
    stage === "start" ? oauthStartEnvironmentNames : oauthCallbackEnvironmentNames;

  const missingEnvironment: string[] = requiredNames.filter(
    (name) => !oauthEnvironmentValues[name],
  );
  if (stage === "callback" && !env.ownerUnionId && !env.ownerGitHubLogin) {
    missingEnvironment.push("OWNER_UNION_ID or OWNER_GITHUB_LOGIN");
  }
  return missingEnvironment;
}
