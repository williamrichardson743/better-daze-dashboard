import { describe, it, expect, vi, afterEach } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";

vi.mock("./lib/env.js", () => ({
  env: {
    appUrl: "https://app.example.com",
    githubClientId: "test-client-id",
    githubClientSecret: "test-client-secret",
    ownerUnionId: "github:42",
    ownerGitHubLogin: "testowner",
  },
}));

vi.mock("./queries/users.js", () => ({
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./auth/session.js", () => ({
  signSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
  verifySessionToken: vi.fn(),
}));

function makeReq(opts: {
  url?: string;
  cookie?: string;
  proto?: string;
  method?: string;
}): IncomingMessage {
  return {
    method: opts.method ?? "GET",
    url: opts.url ?? "/api/oauth/callback",
    headers: {
      host: "app.example.com",
      "x-forwarded-proto": opts.proto ?? "https",
      ...(opts.cookie ? { cookie: opts.cookie } : {}),
    },
  } as unknown as IncomingMessage;
}

function makeRes() {
  const headers: Record<string, string | string[]> = {};
  let statusCode = 200;
  let body = "";

  return {
    get statusCode() {
      return statusCode;
    },
    set statusCode(v: number) {
      statusCode = v;
    },
    setHeader(key: string, value: string | string[]) {
      headers[key.toLowerCase()] = value;
    },
    end(data?: string) {
      body = data ?? "";
    },
    headers,
    get body() {
      return body;
    },
  } as unknown as ServerResponse & { body: string; headers: Record<string, string | string[]> };
}

describe("oauth-callback state validation", () => {
  afterEach(() => vi.restoreAllMocks());

  it("rejects with 400 when state cookie is absent", async () => {
    const { default: handler } = await import("./oauth-callback.js");
    const req = makeReq({ url: "/api/oauth/callback?code=abc&state=xyz" });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect((res as unknown as { body: string }).body).toContain("Invalid OAuth state");
  });

  it("rejects with 400 when URL state does not match cookie", async () => {
    const { default: handler } = await import("./oauth-callback.js");
    const req = makeReq({
      url: "/api/oauth/callback?code=abc&state=wrong-state",
      cookie: "bd_github_oauth_state=correct-state",
    });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect((res as unknown as { body: string }).body).toContain("Invalid OAuth state");
  });

  it("accepts and redirects to /app when state matches cookie", async () => {
    const matchingState = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "gha_token" }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 42,
            login: "testowner",
            name: "Test Owner",
            email: "owner@example.com",
            avatar_url: "https://github.com/avatar.png",
          }),
        } as Response),
    );

    const { default: handler } = await import("./oauth-callback.js");
    const req = makeReq({
      url: `/api/oauth/callback?code=auth-code&state=${matchingState}`,
      cookie: `bd_github_oauth_state=${matchingState}`,
    });
    const res = makeRes();
    await handler(req, res);

    expect(res.statusCode).toBe(302);
    expect(
      (res as unknown as { headers: Record<string, string> }).headers["location"],
    ).toBe("/app");
  });
});
