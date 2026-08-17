import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "./lib/env.js";
import { findUserByUnionId, upsertUser } from "./queries/users.js";
import { signSessionToken } from "./auth/session.js";
import { Session } from "../contracts/constants.js";
import * as cookie from "cookie";

const stateCookieName = "bd_github_oauth_state";
const githubTokenUrl = "https://github.com/login/oauth/access_token";
const githubApiUrl = "https://api.github.com";

type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
};
type VercelResponse = ServerResponse;

type GitHubProfile = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
};

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function appUrl(req: IncomingMessage) {
  const configured = env.appUrl && !env.appUrl.includes("localhost") ? env.appUrl : "";
  if (configured) return configured.replace(/\/$/, "");
  const proto = Array.isArray(req.headers["x-forwarded-proto"])
    ? req.headers["x-forwarded-proto"][0]
    : req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${req.headers.host || "localhost:3000"}`;
}

function clearStateCookie(req: IncomingMessage, res: VercelResponse) {
  const host = req.headers.host || "";
  const secure = host.startsWith("localhost:") || host.startsWith("127.0.0.1:") ? "" : " Secure;";
  res.setHeader(
    "Set-Cookie",
    `${stateCookieName}=; Max-Age=0; Path=/; HttpOnly;${secure} SameSite=Lax`,
  );
}

function redirect(res: VercelResponse, location: string) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
}

function statesMatch(actual: string, expected: string) {
  const actualBytes = new TextEncoder().encode(actual);
  const expectedBytes = new TextEncoder().encode(expected);
  if (actualBytes.length !== expectedBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < actualBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

async function exchangeCode(code: string, redirectUri: string) {
  const response = await fetch(githubTokenUrl, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const payload = (await response.json()) as { access_token?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(`GitHub token exchange failed (${response.status})`);
  }
  return payload.access_token;
}

async function getProfile(accessToken: string) {
  const response = await fetch(`${githubApiUrl}/user`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2026-03-10",
    },
  });
  if (!response.ok) throw new Error(`GitHub profile request failed (${response.status})`);
  return (await response.json()) as GitHubProfile;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  clearStateCookie(req, res);
  const query = req.query || {};
  const error = valueOf(query.error);
  const code = valueOf(query.code);
  const state = valueOf(query.state);
  const cookies = cookie.parse(String(req.headers.cookie || ""));
  const expectedState = cookies[stateCookieName];

  if (error === "access_denied") {
    redirect(res, "/login");
    return;
  }
  if (error) {
    res.statusCode = 400;
    res.end("GitHub authentication was not completed");
    return;
  }
  if (!code || !state || !expectedState || !statesMatch(state, expectedState)) {
    res.statusCode = 400;
    res.end("Invalid OAuth state or missing authorization code");
    return;
  }
  if (!env.githubClientSecret) {
    res.statusCode = 503;
    res.end("GITHUB_CLIENT_SECRET is not configured");
    return;
  }

  try {
    const profile = await getProfile(await exchangeCode(code, `${appUrl(req)}/api/oauth/callback`));
    const unionId = `github:${profile.id}`;
    if (env.ownerUnionId && unionId !== env.ownerUnionId) {
      res.statusCode = 403;
      res.end("This GitHub account is not authorized");
      return;
    }

    await upsertUser({
      unionId,
      name: profile.name ?? profile.login,
      email: profile.email,
      avatar: profile.avatar_url,
      lastSignInAt: new Date(),
    });

    const token = await signSessionToken({ unionId, clientId: env.githubClientId });
    const host = req.headers.host || "";
    const secure = host.startsWith("localhost:") || host.startsWith("127.0.0.1:") ? "" : " Secure;";
    res.setHeader(
      "Set-Cookie",
      `${Session.cookieName}=${encodeURIComponent(token)}; Max-Age=${Session.maxAgeMs / 1000}; Path=/; HttpOnly;${secure} SameSite=Lax`,
    );
    redirect(res, "/app");
  } catch (callbackError) {
    console.error("[GitHub OAuth] callback failed", callbackError);
    res.statusCode = 500;
    res.end("GitHub authentication failed");
  }
}
