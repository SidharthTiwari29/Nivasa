import { describe, expect, it } from "vitest";
import { adviseDesignQuality } from "./designQualityAdvisor";

describe("adviseDesignQuality", () => {
  it("returns a perfect score for a functional populated room", () => {
    const result = adviseDesignQuality([
      {
        id: "living",
        areaMinor: 1_000_000n,
        primaryFunction: "relax",
        functionalElementIds: ["sofa"],
        placedElementCount: 3,
      },
    ]);
    expect(result.score).toBe(100);
    expect(result.findings).toEqual([]);
  });

  it("flags missing function and functional coverage", () => {
    const result = adviseDesignQuality([
      {
        id: "bed",
        areaMinor: 1_000_000n,
        functionalElementIds: [],
        placedElementCount: 1,
      },
    ]);
    expect(result.score).toBeLessThan(100);
    expect(result.findings.map((finding) => finding.code)).toContain(
      "NO_PRIMARY_FUNCTION",
    );
    expect(result.findings.map((finding) => finding.code)).toContain(
      "LOW_FUNCTIONAL_COVERAGE",
    );
  });
});
