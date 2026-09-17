import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Paths } from "../contracts/constants.js";
import { env, missingOAuthEnvironment } from "./lib/env.js";
import { applyNodeSecurityHeaders } from "./lib/security.js";

const stateCookieName = "bd_github_oauth_state";
const githubAuthorizeUrl = "https://github.com/login/oauth/authorize";

type VercelRequest = IncomingMessage;
type VercelResponse = ServerResponse;

function cookieOptions(req: IncomingMessage) {
  const host = req.headers.host || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:")
    ? "Path=/; HttpOnly; SameSite=Lax"
    : "Path=/; HttpOnly; Secure; SameSite=Lax";
}

function oauthCallbackUrl() {
  return new URL(Paths.oauthCallback, env.appUrl).toString();
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  applyNodeSecurityHeaders(res);

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  // Do not redirect to GitHub when the return handler cannot complete a login.
  const missingEnvironment = missingOAuthEnvironment("callback");
  if (missingEnvironment.length > 0) {
    console.error("[GitHub OAuth] start unavailable", { missingEnvironment });
    res.statusCode = 503;
    res.end("GitHub authentication is not configured");
    return;
  }

  let callbackUrl: string;
  try {
    callbackUrl = oauthCallbackUrl();
  } catch {
    console.error("[GitHub OAuth] start unavailable", { invalidEnvironment: "APP_URL" });
    res.statusCode = 503;
    res.end("GitHub authentication is not configured");
    return;
  }

  const state = randomUUID();
  const authorizationUrl = new URL(githubAuthorizeUrl);
  authorizationUrl.searchParams.set("client_id", env.githubClientId);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
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
