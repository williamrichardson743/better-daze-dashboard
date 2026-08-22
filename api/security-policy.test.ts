import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { app } from "./boot.js";
import { Session } from "../contracts/constants.js";

const project = process.cwd();
const readProjectFile = (relativePath: string) => readFileSync(resolve(project, relativePath), "utf8");

describe("operations security policy", () => {
  it("applies restrictive browser headers and no-store to the public health probe", async () => {
    const response = await app.request("https://ops.better-daze-sf.com/api/health");

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("permissions-policy")).toContain("camera=()");
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
  });

  it("limits owner sessions to one day in both the cookie and signed token", () => {
    expect(Session.maxAgeMs).toBe(24 * 60 * 60 * 1000);
    expect(readProjectFile("api/auth/session.ts")).toContain('.setExpirationTime("24h")');
  });

  it("hardens the direct Vercel OAuth handlers that bypass the Hono bootstrap", () => {
    expect(readProjectFile("api/github-start.ts")).toContain("applyNodeSecurityHeaders(res)");
    expect(readProjectFile("api/oauth-callback.ts")).toContain("applyNodeSecurityHeaders(res)");
    expect(readProjectFile("vercel.json")).toContain('"X-Frame-Options"');
  });
});
