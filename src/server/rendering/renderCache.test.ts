import { describe, expect, it } from "vitest";
import { computeRenderCacheKey } from "./renderCache";

describe("computeRenderCacheKey", () => {
  it("is deterministic - identical inputs always produce the identical key", () => {
    const input = {
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      qualityTier: "STANDARD" as const,
    };
    expect(computeRenderCacheKey(input)).toBe(computeRenderCacheKey(input));
  });

  it("produces a different key for a different design version", () => {
    const a = computeRenderCacheKey({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      qualityTier: "STANDARD",
    });
    const b = computeRenderCacheKey({
      designVersionId: "dv-2",
      renderType: "PANORAMA",
      qualityTier: "STANDARD",
    });
    expect(a).not.toBe(b);
  });

  it("produces a different key for a different render type", () => {
    const a = computeRenderCacheKey({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      qualityTier: "STANDARD",
    });
    const b = computeRenderCacheKey({
      designVersionId: "dv-1",
      renderType: "WALKTHROUGH",
      qualityTier: "STANDARD",
    });
    expect(a).not.toBe(b);
  });

  it("produces a different key for a different quality tier - HD and STANDARD renders of the same design never collide", () => {
    const standard = computeRenderCacheKey({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      qualityTier: "STANDARD",
    });
    const hd = computeRenderCacheKey({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      qualityTier: "HD",
    });
    expect(standard).not.toBe(hd);
  });

  it("produces a 64-character hex SHA-256 digest", () => {
    const key = computeRenderCacheKey({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      qualityTier: "STANDARD",
    });
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});
