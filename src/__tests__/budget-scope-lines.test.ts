import { beforeEach, describe, expect, it, vi } from "vitest";

const addScopeLine = vi.fn();
const removeScopeLine = vi.fn();

vi.mock("@/server/repositories/budgetRepository", () => ({
  budgetRepository: {
    addScopeLine,
    removeScopeLine,
  },
}));

const { budgetService } = await import("@/server/services/budgetService");

const customLine = {
  kind: "CUSTOM" as const,
  category: "lighting",
  description: "Custom pendant light",
  lowMinor: 10000,
  targetMinor: 15000,
  highMinor: 20000,
  truth: "ESTIMATE" as const,
  basis: { method: "user supplied" },
};

describe("Budget scope-line mutations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("rejects adding to a locked budget", async () => {
    addScopeLine.mockRejectedValueOnce(new Error("BUDGET_LOCKED"));

    await expect(
      budgetService.addScopeLine("property-1", "user-1", 1, customLine),
    ).rejects.toThrow("locked");
  });

  it("rejects adding to a missing budget version", async () => {
    addScopeLine.mockResolvedValueOnce(null);

    await expect(
      budgetService.addScopeLine("property-1", "user-1", 99, customLine),
    ).rejects.toThrow("Budget version");
  });

  it("adds a custom scope line and returns recomputed totals", async () => {
    addScopeLine.mockResolvedValueOnce({
      id: "scope-1",
      budgetVersionId: "version-1",
      ...customLine,
      totalLowMinor: 110000n,
      totalTargetMinor: 165000n,
      totalHighMinor: 220000n,
    });

    const result = await budgetService.addScopeLine(
      "property-1",
      "user-1",
      1,
      customLine,
    );

    expect(result.id).toBe("scope-1");
    expect(result.totalTargetMinor).toBe(165000n);
  });

  it("rejects removing from a locked budget", async () => {
    removeScopeLine.mockRejectedValueOnce(new Error("BUDGET_LOCKED"));

    await expect(
      budgetService.removeScopeLine("property-1", "user-1", 1, "scope-1"),
    ).rejects.toThrow("locked");
  });

  it("rejects removing a nonexistent scope line", async () => {
    removeScopeLine.mockResolvedValueOnce(undefined);

    await expect(
      budgetService.removeScopeLine("property-1", "user-1", 1, "scope-missing"),
    ).rejects.toThrow("Budget scope line");
  });

  it("removes a scope line and returns recomputed totals", async () => {
    removeScopeLine.mockResolvedValueOnce({
      id: "scope-1",
      budgetVersionId: "version-1",
      totalLowMinor: 90000n,
      totalTargetMinor: 120000n,
      totalHighMinor: 160000n,
    });

    const result = await budgetService.removeScopeLine(
      "property-1",
      "user-1",
      1,
      "scope-1",
    );

    expect(result.id).toBe("scope-1");
    expect(result.totalTargetMinor).toBe(120000n);
  });
});
