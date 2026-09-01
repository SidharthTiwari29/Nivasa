import { beforeEach, describe, expect, it, vi } from "vitest";
import { assetRepository } from "@/server/repositories/assetRepository";
import { checkRenderCache } from "./renderCostControl";

vi.mock("@/server/repositories/assetRepository", () => ({
  assetRepository: { findByChecksum: vi.fn() },
}));

const assets = vi.mocked(assetRepository);

describe("checkRenderCache", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a cache hit with the existing asset id when one is found - no API cost incurred", async () => {
    assets.findByChecksum.mockResolvedValue({ id: "asset-1" } as never);

    const result = await checkRenderCache({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      roomConfirmedHighConfidence: true,
      planIncludesPriorityVisualization: true,
    });

    expect(result).toEqual({ hit: true, assetId: "asset-1" });
  });

  it("returns a cache miss with the correct quality tier and cache key when nothing is found", async () => {
    assets.findByChecksum.mockResolvedValue(null);

    const result = await checkRenderCache({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      roomConfirmedHighConfidence: false,
      planIncludesPriorityVisualization: true,
    });

    expect(result.hit).toBe(false);
    if (!result.hit) {
      expect(result.qualityTier).toBe("STANDARD");
      expect(result.cacheKey).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("checks the cache using the tier-specific key, not a tier-agnostic one - a free STANDARD render never accidentally cache-hits a paid HD render of the same design", async () => {
    assets.findByChecksum.mockResolvedValue(null);

    await checkRenderCache({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      roomConfirmedHighConfidence: true,
      planIncludesPriorityVisualization: false, // forces STANDARD
    });

    const standardKey = assets.findByChecksum.mock.calls[0][0];

    vi.clearAllMocks();
    assets.findByChecksum.mockResolvedValue(null);

    await checkRenderCache({
      designVersionId: "dv-1",
      renderType: "PANORAMA",
      roomConfirmedHighConfidence: true,
      planIncludesPriorityVisualization: true, // forces HD
    });

    const hdKey = assets.findByChecksum.mock.calls[0][0];

    expect(standardKey).not.toBe(hdKey);
  });
});
