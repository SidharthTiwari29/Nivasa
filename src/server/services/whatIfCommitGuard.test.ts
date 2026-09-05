import { describe, expect, it, vi } from "vitest";
import { budgetService } from "@/server/services/budgetService";
import { whatIfService } from "@/server/services/whatIfService";

describe("whatIfService.commit", () => {
  it("rejects a target delta that disagrees with known prices", async () => {
    const impact = vi.spyOn(budgetService, "impact");

    await expect(
      whatIfService.commit("property-1", "owner-1", {
        action: "commit",
        baseVersion: 2,
        currentPriceMinor: 200000,
        proposedPriceMinor: 175000,
        proposedLowDeltaMinor: -20000,
        proposedTargetDeltaMinor: -10000,
        proposedHighDeltaMinor: -5000,
        roomId: null,
        scopeChange: "REPLACE",
        reason: "Use an equivalent lower-cost finish",
        designImpact: "SIMILAR",
        functionImpact: "SIMILAR",
        inputs: { source: "user" },
      }),
    ).rejects.toThrow(
      "Proposed target delta does not match the current and proposed prices",
    );

    expect(impact).not.toHaveBeenCalled();
    impact.mockRestore();
  });

  it("persists a valid commit with the calculated target delta", async () => {
    const impact = vi
      .spyOn(budgetService, "impact")
      .mockResolvedValue({ id: "impact-1" } as never);

    await whatIfService.commit("property-1", "owner-1", {
      action: "commit",
      baseVersion: 2,
      currentPriceMinor: 200000,
      proposedPriceMinor: 175000,
      proposedLowDeltaMinor: -30000,
      proposedTargetDeltaMinor: -25000,
      proposedHighDeltaMinor: -15000,
      roomId: null,
      scopeChange: "REPLACE",
      reason: "Use an equivalent lower-cost finish",
      designImpact: "SIMILAR",
      functionImpact: "SIMILAR",
      inputs: { source: "user" },
    });

    expect(impact).toHaveBeenCalledWith(
      "property-1",
      "owner-1",
      expect.objectContaining({
        baseVersion: 2,
        proposedTargetDeltaMinor: -25000,
        reason: "Use an equivalent lower-cost finish",
      }),
    );
    impact.mockRestore();
  });
});
