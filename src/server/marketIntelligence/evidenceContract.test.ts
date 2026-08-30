import { describe, expect, it } from "vitest";
import {
  evaluateEvidence,
  mergeEvidenceMetadata,
  validateEvidenceObservation,
} from "./evidenceContract";

const observation = {
  sourceKey: "example-source",
  sourceProductId: "sku-1",
  retrievedAt: new Date("2026-08-30T00:00:00.000Z"),
  retrievalMethod: "OFFICIAL_SITE" as const,
  locator: "https://example.com/product/sku-1",
  contentHash: "sha256:abc",
};

describe("evidenceContract", () => {
  it("accepts a complete evidence observation", () => {
    expect(() => validateEvidenceObservation(observation)).not.toThrow();
  });

  it("marks fresh official evidence as high quality", () => {
    expect(
      evaluateEvidence(
        observation,
        { freshnessHours: 24, requireLocator: true, requireContentHash: true },
        new Date("2026-08-30T12:00:00.000Z"),
      ),
    ).toEqual({ quality: "HIGH", fresh: true, reasons: [] });
  });

  it("preserves uncertainty when evidence is stale", () => {
    const result = evaluateEvidence(
      observation,
      { freshnessHours: 24, requireLocator: true, requireContentHash: true },
      new Date("2026-09-01T00:00:00.000Z"),
    );
    expect(result.quality).toBe("UNKNOWN");
    expect(result.fresh).toBe(false);
    expect(result.reasons).toContain("observation is outside the freshness policy");
  });

  it("does not upgrade incomplete evidence to high quality", () => {
    const result = evaluateEvidence(
      { ...observation, contentHash: undefined },
      { freshnessHours: 24, requireLocator: true, requireContentHash: true },
      new Date("2026-08-30T12:00:00.000Z"),
    );
    expect(result.quality).toBe("LOW");
    expect(result.reasons).toContain("contentHash is required");
  });

  it("merges metadata without mutating either input", () => {
    const existing = { confidence: 80, region: "IN" };
    const incoming = { confidence: 90, seller: "example" };
    expect(mergeEvidenceMetadata(existing, incoming)).toEqual({
      confidence: 90,
      region: "IN",
      seller: "example",
    });
    expect(existing).toEqual({ confidence: 80, region: "IN" });
  });
});
