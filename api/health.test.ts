import { describe, expect, it } from "vitest";
import { app } from "./boot.js";

describe("operations health endpoint", () => {
  it("returns a public healthy response without creating an authenticated session", async () => {
    const response = await app.request("https://ops.better-daze-sf.com/api/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
