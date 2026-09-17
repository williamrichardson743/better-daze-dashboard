import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { env, missingOAuthEnvironment } from "../lib/env.js";
import { getSessionCookieOptions } from "../lib/cookies.js";
import { Session, Paths } from "../../contracts/constants.js";
import { Errors } from "../../contracts/errors.js";
import { signSessionToken, verifySessionToken } from "../auth/session.js";
import { findUserByUnionId, upsertUser } from "../queries/users.js";

const stateCookieName = "bd_github_oauth_state";
const stateLifetimeSeconds = 10 * 60;
const githubAuthorizeUrl = "https://github.com/login/oauth/authorize";
const githubTokenUrl = "https://github.com/login/oauth/access_token";
const githubApiUrl = "https://api.github.com";

type GitHubProfile = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
};

function callbackUrl() {
  return new URL(Paths.oauthCallback, env.appUrl).toString();
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

async function exchangeAuthCode(code: string, redirectUri: string) {
  const response = await fetch(githubTokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(
      `GitHub token exchange failed (${response.status}): ${payload.error_description ?? payload.error ?? "unknown error"}`,
    );
  }

  return payload.access_token;
}

async function getGitHubProfile(accessToken: string): Promise<GitHubProfile> {
  const response = await fetch(`${githubApiUrl}/user`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2026-03-10",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub profile request failed (${response.status})`);
  }

  return (await response.json()) as GitHubProfile;
}

function clearStateCookie(c: Context) {
  setCookie(c, stateCookieName, "", {
    ...getSessionCookieOptions(c.req.raw.headers),
    sameSite: "Lax",
    maxAge: 0,
  });
}

export function createGitHubStartHandler() {
  return (c: Context) => {
    const missingEnvironment = missingOAuthEnvironment("callback");
    if (missingEnvironment.length > 0) {
      console.error("[GitHub OAuth] start unavailable", { missingEnvironment });
      return c.json({ error: "GitHub authentication is not configured" }, 503);
    }

    let redirectUri: string;
    try {
      redirectUri = callbackUrl();
    } catch {
      console.error("[GitHub OAuth] start unavailable", { invalidEnvironment: "APP_URL" });
      return c.json({ error: "GitHub authentication is not configured" }, 503);
    }

    const state = crypto.randomUUID();
    setCookie(c, stateCookieName, state, {
      ...getSessionCookieOptions(c.req.raw.headers),
      sameSite: "Lax",
      maxAge: stateLifetimeSeconds,
    });

    const authorizationUrl = new URL(githubAuthorizeUrl);
    authorizationUrl.searchParams.set("client_id", env.githubClientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("scope", "read:user user:email");
    authorizationUrl.searchParams.set("state", state);

    return c.redirect(authorizationUrl.toString(), 302);
  };
}

export function createGitHubCallbackHandler() {
  return async (c: Context) => {
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");
    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, stateCookieName);

    clearStateCookie(c);

    if (error) {
      if (error === "access_denied") return c.redirect("/login", 302);
      return c.json({ error, error_description: errorDescription }, 400);
    }

    if (!code || !state || !expectedState || !statesMatch(state, expectedState)) {
      return c.json({ error: "Invalid OAuth state or missing authorization code" }, 400);
    }

    const missingEnvironment = missingOAuthEnvironment("callback");
    if (missingEnvironment.length > 0) {
      console.error("[GitHub OAuth] callback unavailable", { missingEnvironment });
      return c.json({ error: "GitHub authentication is not configured" }, 503);
    }

    let redirectUri: string;
    try {
      redirectUri = callbackUrl();
    } catch {
      console.error("[GitHub OAuth] callback unavailable", { invalidEnvironment: "APP_URL" });
      return c.json({ error: "GitHub authentication is not configured" }, 503);
    }

    try {
      const accessToken = await exchangeAuthCode(code, redirectUri);
      const profile = await getGitHubProfile(accessToken);
      const unionId = `github:${profile.id}`;
      const authorizedByUnionId = unionId === env.ownerUnionId;
      const authorizedByLogin = profile.login.trim().toLowerCase() === env.ownerGitHubLogin;

      if (!authorizedByUnionId && !authorizedByLogin) {
        return c.json({ error: "This GitHub account is not authorized" }, 403);
      }

      await upsertUser({
        unionId,
        name: profile.name ?? profile.login,
        email: profile.email,
        avatar: profile.avatar_url,
        lastSignInAt: new Date(),
      });

      const sessionToken = await signSessionToken({
        unionId,
        clientId: env.githubClientId,
      });

      setCookie(c, Session.cookieName, sessionToken, {
        ...getSessionCookieOptions(c.req.raw.headers),
        sameSite: "Lax",
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/app", 302);
    } catch {
      // Do not log raw exceptions because database drivers may include connection details.
      console.error("[GitHub OAuth] Callback failed");
      return c.json({ error: "GitHub authentication failed" }, 500);
    }
  };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}
