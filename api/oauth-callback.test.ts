import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signSessionToken: vi.fn().mockResolvedValue("test-session-token"),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./auth/session.js", () => ({
  signSessionToken: mocks.signSessionToken,
}));

vi.mock("./queries/users.js", () => ({
  upsertUser: mocks.upsertUser,
}));

type MockResponse = {
  statusCode: number;
  headers: Map<string, string | string[]>;
  body?: string;
  setHeader: (name: string, value: string | string[]) => void;
  getHeader: (name: string) => string | string[] | undefined;
  end: (body?: string) => void;
};

function createResponse(): MockResponse {
  const headers = new Map<string, string | string[]>();
  return {
    statusCode: 200,
    headers,
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value);
    },
    getHeader(name) {
      return headers.get(name.toLowerCase());
    },
    end(body) {
      this.body = body;
    },
  };
}

function createRequest(url: string, cookie?: string) {
  return {
    method: "GET",
    url,
    headers: {
      host: "ops.example.test",
      "x-forwarded-proto": "https",
      ...(cookie ? { cookie } : {}),
    },
  };
}

describe("Vercel OAuth callback route", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.APP_URL = "https://ops.example.test";
    process.env.GITHUB_CLIENT_ID = "test-client-id";
    process.env.GITHUB_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "test-session-secret";
    process.env.DATABASE_URL = "mysql://user:password@localhost:3306/dashboard";
    process.env.OWNER_UNION_ID = "github:999";
    process.env.OWNER_GITHUB_LOGIN = "authorized-owner";
    mocks.signSessionToken.mockClear();
    mocks.upsertUser.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
    vi.unstubAllGlobals();
  });

  it("uses the raw callback URL, clears OAuth state, and retains the new session cookie", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "test-access-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 999,
          login: "authorized-owner",
          name: "Authorized Owner",
          email: "owner@example.test",
          avatar_url: "https://example.test/avatar.png",
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { default: handler } = await import("./oauth-callback.js");
    const response = createResponse();

    await handler(
      createRequest(
        "/api/oauth/callback?code=test-code&state=fresh-state",
        "bd_github_oauth_state=fresh-state",
      ) as never,
      response as never,
    );

    expect(response.statusCode).toBe(302);
    expect(response.getHeader("location")).toBe("/app");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(mocks.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({ unionId: "github:999" }),
    );

    const setCookie = response.getHeader("set-cookie");
    expect(setCookie).toEqual(
      expect.arrayContaining([
        expect.stringContaining("bd_github_oauth_state=; Max-Age=0"),
        expect.stringContaining("better_daze_sid=test-session-token"),
      ]),
    );
  });

  it("redirects a cancelled GitHub callback to login and expires the OAuth state", async () => {
    const { default: handler } = await import("./oauth-callback.js");
    const response = createResponse();

    await handler(
      createRequest("/api/oauth/callback?error=access_denied", "bd_github_oauth_state=fresh-state") as never,
      response as never,
    );

    expect(response.statusCode).toBe(302);
    expect(response.getHeader("location")).toBe("/login");
    expect(response.getHeader("set-cookie")).toEqual(
      expect.arrayContaining([expect.stringContaining("bd_github_oauth_state=; Max-Age=0")]),
    );
  });

  it("fails safely before an exchange when a required OAuth variable is missing", async () => {
    delete process.env.GITHUB_CLIENT_SECRET;
    vi.resetModules();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { default: handler } = await import("./oauth-callback.js");
    const response = createResponse();

    await handler(
      createRequest(
        "/api/oauth/callback?code=test-code&state=fresh-state",
        "bd_github_oauth_state=fresh-state",
      ) as never,
      response as never,
    );

    expect(response.statusCode).toBe(503);
    expect(response.body).toBe("GitHub authentication is not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs only the database error code when the user upsert fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "test-access-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 999,
          login: "authorized-owner",
          name: "Authorized Owner",
          email: "owner@example.test",
          avatar_url: "https://example.test/avatar.png",
        }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const rawErrorDetail = "sensitive connection context";
    mocks.upsertUser.mockRejectedValueOnce(
      Object.assign(new Error("query wrapper"), {
        name: "DrizzleQueryError",
        cause: Object.assign(new Error(rawErrorDetail), { code: "ER_BAD_FIELD_ERROR" }),
      }),
    );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { default: handler } = await import("./oauth-callback.js");
    const response = createResponse();

    await handler(
      createRequest(
        "/api/oauth/callback?code=test-code&state=fresh-state",
        "bd_github_oauth_state=fresh-state",
      ) as never,
      response as never,
    );

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe("GitHub authentication failed");
    expect(consoleError).toHaveBeenCalledWith(
      "[GitHub OAuth] callback failed",
      expect.objectContaining({
        stage: "user upsert",
        databaseErrorName: "DrizzleQueryError",
        databaseCauseName: "Error",
        databaseErrorCode: "ER_BAD_FIELD_ERROR",
      }),
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(rawErrorDetail);
  });
});
