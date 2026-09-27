import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Guards the money-losing failure mode: a second click on Publish must not
 * create a second Printify product. The durable integrationRuns row keyed by
 * idempotency key is what prevents it.
 */

const mocks = vi.hoisted(() => ({
  runPhase3: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("./integrations/cycleRunner.js", () => ({
  runPhase3: mocks.runPhase3,
}));

vi.mock("./queries/connection.js", () => ({
  getDb: () => ({
    select: mocks.select,
    update: mocks.update,
    insert: mocks.insert,
  }),
}));

/** Minimal chainable stand-ins for the drizzle builders the router uses. */
function selectReturning(rows: unknown[]) {
  return {
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve(rows),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(rows).then(resolve),
      }),
    }),
  };
}

const updateChain = { set: () => ({ where: () => Promise.resolve(undefined) }) };

describe("operations.pipeline.start idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockReturnValue(updateChain);
  });

  it("returns the stored provider ids without calling Printify when the run already succeeded", async () => {
    const { operationsRouter } = await import("./operations-router.js");

    // 1st select: the existing integrationRuns row. 2nd: its provider mappings.
    mocks.select
      .mockReturnValueOnce(
        selectReturning([{ id: 7, status: "succeeded", attemptCount: 1 }])
      )
      .mockReturnValueOnce(
        selectReturning([
          { provider: "printify", providerResourceId: "pf_123", runId: 7 },
          { provider: "shopify", providerResourceId: "sh_456", runId: 7 },
        ])
      );

    const caller = operationsRouter.createCaller({
      user: { id: 1, role: "admin" },
    } as never);

    const result = await caller.pipeline.start({
      id: 42,
      slogan: "Better Daze Ahead",
      designImageUrl: "https://example.test/design.png",
      productType: "tee",
    });

    expect(mocks.runPhase3).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: true,
      replayed: true,
      printifyProductId: "pf_123",
      shopifyProductId: "sh_456",
    });
  });

  it("refuses to start a second time while a run is still in flight", async () => {
    const { operationsRouter } = await import("./operations-router.js");

    mocks.select.mockReturnValueOnce(
      selectReturning([{ id: 8, status: "running", attemptCount: 1 }])
    );

    const caller = operationsRouter.createCaller({
      user: { id: 1, role: "admin" },
    } as never);

    const result = await caller.pipeline.start({
      id: 43,
      slogan: "Second Click",
      designImageUrl: "https://example.test/design.png",
    });

    expect(mocks.runPhase3).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already running/i);
  });
});
