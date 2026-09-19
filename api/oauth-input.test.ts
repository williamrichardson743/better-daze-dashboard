import { describe, expect, it } from "vitest";
import { readOAuthCallbackInput, statesMatch } from "./oauth-input.js";

function makeRequest(url: string, query?: Record<string, string | string[] | undefined>) {
  return {
    url,
    query,
    headers: { host: "ops.better-daze-sf.com", "x-forwarded-proto": "https" },
  } as unknown as Parameters<typeof readOAuthCallbackInput>[0];
}

describe("readOAuthCallbackInput", () => {
  it("reads code and state from the raw callback URL when req.query is absent", () => {
    expect(readOAuthCallbackInput(makeRequest("/api/oauth/callback?code=code-123&state=state-123"))).toEqual({
      error: undefined,
      code: "code-123",
      state: "state-123",
    });
  });

  it("uses wrapper query values when Vercel provides them", () => {
    expect(
      readOAuthCallbackInput(
        makeRequest("/api/oauth/callback?code=url-code&state=url-state", {
          code: ["wrapped-code"],
          state: "wrapped-state",
        }),
      ),
    ).toMatchObject({ code: "wrapped-code", state: "wrapped-state" });
  });

  it("reads a GitHub cancellation signal without requiring OAuth credentials", () => {
    expect(readOAuthCallbackInput(makeRequest("/api/oauth/callback?error=access_denied"))).toMatchObject({
      error: "access_denied",
      code: undefined,
      state: undefined,
    });
  });
});

describe("statesMatch", () => {
  it("accepts only identical opaque state values", () => {
    expect(statesMatch("same-state", "same-state")).toBe(true);
    expect(statesMatch("same-state", "other-state")).toBe(false);
    expect(statesMatch("short", "longer")).toBe(false);
  });
});
