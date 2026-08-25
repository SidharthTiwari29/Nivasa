import { describe, expect, it } from "vitest";
import {
  buildInteriorCanonicalKey,
  isEvidenceSufficient,
} from "./interiorEntity";

describe("interior entity identity", () => {
  it("creates the same canonical key for normalized equivalent names", () => {
    expect(
      buildInteriorCanonicalKey("PRODUCT", "Brand A", "Soft Close Hinge", "110°"),
    ).toBe(
      buildInteriorCanonicalKey("PRODUCT", "brand a", "soft-close hinge", "110"),
    );
  });

  it("requires evidence above the confidence threshold", () => {
    expect(
      isEvidenceSufficient([
        {
          id: "weak",
          sourceKey: "source-a",
          sourceUrl: "https://example.com/a",
          observedAt: new Date("2026-08-25T00:00:00Z"),
          confidenceBps: 6500,
        },
      ]),
    ).toBe(false);

    expect(
      isEvidenceSufficient([
        {
          id: "strong",
          sourceKey: "source-a",
          sourceUrl: "https://example.com/a",
          observedAt: new Date("2026-08-25T00:00:00Z"),
          confidenceBps: 8500,
        },
      ]),
    ).toBe(true);
  });
});
