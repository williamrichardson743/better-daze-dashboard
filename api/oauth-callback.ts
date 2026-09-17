import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import * as cookie from "cookie";
import { Session, Paths } from "../contracts/constants.js";
import { signSessionToken } from "./auth/session.js";
import { env, missingOAuthEnvironment } from "./lib/env.js";
import { applyNodeSecurityHeaders } from "./lib/security.js";
import { readOAuthCallbackInput, statesMatch } from "./oauth-input.js";
import { upsertUser } from "./queries/users.js";

const stateCookieName = "bd_github_oauth_state";
const githubTokenUrl = "https://github.com/login/oauth/access_token";
const githubApiUrl = "https://api.github.com";

/** Allows GitHub exchange and the database write to finish on cold starts. */
export const config = {
  maxDuration: 60,
};

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

function oauthCallbackUrl() {
  return new URL(Paths.oauthCallback, env.appUrl).toString();
}

function isLocalRequest(req: IncomingMessage) {
  const host = req.headers.host || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

function appendSetCookie(res: VercelResponse, value: string) {
  const existing = res.getHeader("Set-Cookie");
  const cookies = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
  res.setHeader("Set-Cookie", [...cookies, value]);
}

function clearStateCookie(req: IncomingMessage, res: VercelResponse) {
  appendSetCookie(
    res,
    cookie.serialize(stateCookieName, "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: !isLocalRequest(req),
      maxAge: 0,
    }),
  );
}

function setSessionCookie(req: IncomingMessage, res: VercelResponse, token: string) {
  appendSetCookie(
    res,
    cookie.serialize(Session.cookieName, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: !isLocalRequest(req),
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

function redirect(res: VercelResponse, location: string) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
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
  applyNodeSecurityHeaders(res);

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  const requestId = randomUUID();
  const { error, code, state } = readOAuthCallbackInput(req);
  const cookies = cookie.parse(String(req.headers.cookie || ""));
  const expectedState = cookies[stateCookieName];

  // Presence-only telemetry avoids emitting OAuth codes, tokens, cookies, or secrets.
  console.info("[GitHub OAuth] callback input", {
    requestId,
    hasError: Boolean(error),
    hasCode: Boolean(code),
    hasState: Boolean(state),
    hasExpectedState: Boolean(expectedState),
  });

  clearStateCookie(req, res);

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

  const missingEnvironment = missingOAuthEnvironment("callback");
  if (missingEnvironment.length > 0) {
    console.error("[GitHub OAuth] callback unavailable", { requestId, missingEnvironment });
    res.statusCode = 503;
    res.end("GitHub authentication is not configured");
    return;
  }

  let stage = "callback URL validation";
  try {
    const redirectUri = oauthCallbackUrl();
    stage = "token exchange";
    const accessToken = await exchangeCode(code, redirectUri);
    stage = "profile lookup";
    const profile = await getProfile(accessToken);
    const unionId = `github:${profile.id}`;
    const authorizedByUnionId = unionId === env.ownerUnionId;
    const authorizedByLogin = profile.login.trim().toLowerCase() === env.ownerGitHubLogin;
    if (!authorizedByUnionId && !authorizedByLogin) {
      res.statusCode = 403;
      res.end("This GitHub account is not authorized");
      return;
    }

    stage = "user upsert";
    await upsertUser({
      unionId,
      name: profile.name ?? profile.login,
      email: profile.email,
      avatar: profile.avatar_url,
      lastSignInAt: new Date(),
    });

    stage = "session creation";
    const token = await signSessionToken({ unionId, clientId: env.githubClientId });
    setSessionCookie(req, res, token);
    redirect(res, "/app");
  } catch {
    // Deliberately omit the raw exception: database drivers can include connection details.
    console.error("[GitHub OAuth] callback failed", { requestId, stage });
    res.statusCode = 500;
    res.end("GitHub authentication failed");
  }
}
