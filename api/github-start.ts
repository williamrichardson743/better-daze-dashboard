import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
const stateCookieName = "bd_github_oauth_state";
const publicGithubClientId = "Ov23lir7wuMbVr5DR3Ms";
const callbackPath = "/api/oauth/callback";
const githubAuthorizeUrl = "https://github.com/login/oauth/authorize";

type VercelRequest = IncomingMessage & { query?: Record<string, string | string[] | undefined> };
type VercelResponse = ServerResponse;

function appUrl(req: IncomingMessage) {
  const configured = process.env.APP_URL && !process.env.APP_URL.includes("localhost") ? process.env.APP_URL : "";
  if (configured) return configured.replace(/\/$/, "");
  const proto = Array.isArray(req.headers["x-forwarded-proto"])
    ? req.headers["x-forwarded-proto"][0]
    : req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${req.headers.host || "localhost:3000"}`;
}

function cookieOptions(req: IncomingMessage) {
  const host = req.headers.host || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:")
    ? "Path=/; HttpOnly; SameSite=Lax"
    : "Path=/; HttpOnly; Secure; SameSite=Lax";
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  const state = randomUUID();
  const baseUrl = appUrl(req);
  const authorizationUrl = new URL(githubAuthorizeUrl);
  authorizationUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID || publicGithubClientId);
  authorizationUrl.searchParams.set("redirect_uri", `${baseUrl}${callbackPath}`);
  authorizationUrl.searchParams.set("scope", "read:user user:email");
  authorizationUrl.searchParams.set("state", state);

  res.statusCode = 302;
  res.setHeader("Location", authorizationUrl.toString());
  res.setHeader(
    "Set-Cookie",
    `${stateCookieName}=${encodeURIComponent(state)}; Max-Age=600; ${cookieOptions(req)}`,
  );
  res.end();
}
