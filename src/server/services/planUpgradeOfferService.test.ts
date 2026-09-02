import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { planUpgradeOfferRepository } from "@/server/repositories/planUpgradeOfferRepository";
import { planUpgradeOfferService } from "./planUpgradeOfferService";

vi.mock("@/server/db/prisma", () => ({
  prisma: { package: { findUnique: vi.fn() } },
}));
vi.mock("@/server/repositories/planUpgradeOfferRepository", () => ({
  planUpgradeOfferRepository: {
    findHighestActivePackagePrice: vi.fn(),
    findExisting: vi.fn(),
    create: vi.fn(),
    advanceVisit: vi.fn(),
  },
}));

const packages = vi.mocked(prisma.package);
const repo = vi.mocked(planUpgradeOfferRepository);

describe("planUpgradeOfferService.getOrAdvanceOffer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an unknown target package code", async () => {
    packages.findUnique.mockResolvedValue(null);

    await expect(
      planUpgradeOfferService.getOrAdvanceOffer("user-1", "UNKNOWN_PACKAGE"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates a fresh visit-1 offer for a customer with no prior offer record", async () => {
    packages.findUnique.mockResolvedValue({
      priceMinor: 999_900n,
    } as never);
    repo.findHighestActivePackagePrice.mockResolvedValue(9_900n);
    repo.findExisting.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      id: "offer-1",
      visitNumber: 1,
      offerShownAt: new Date("2026-09-01T10:00:00Z"),
    } as never);

    const result = await planUpgradeOfferService.getOrAdvanceOffer(
      "user-1",
      "NIWASTHAN_IMMERSIVE",
    );

    expect(repo.create).toHaveBeenCalledWith("user-1", "NIWASTHAN_IMMERSIVE");
    expect(result.visitNumber).toBe(1);
    expect(result.finalPriceMinor).toBe(891_000n); // hand-verified 10% off 990,000
  });

  it("returns the SAME still-valid offer unchanged rather than advancing the visit - the anti-gaming guarantee", async () => {
    packages.findUnique.mockResolvedValue({
      priceMinor: 999_900n,
    } as never);
    repo.findHighestActivePackagePrice.mockResolvedValue(9_900n);
    const recentlyShown = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    repo.findExisting.mockResolvedValue({
      id: "offer-1",
      visitNumber: 1,
      offerShownAt: recentlyShown,
    } as never);

    const result = await planUpgradeOfferService.getOrAdvanceOffer(
      "user-1",
      "NIWASTHAN_IMMERSIVE",
    );

    expect(repo.advanceVisit).not.toHaveBeenCalled();
    expect(result.visitNumber).toBe(1);
  });

  it("advances to the next visit tier once the previous offer has genuinely expired", async () => {
    packages.findUnique.mockResolvedValue({
      priceMinor: 999_900n,
    } as never);
    repo.findHighestActivePackagePrice.mockResolvedValue(9_900n);
    const expiredShownAt = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago
    repo.findExisting.mockResolvedValue({
      id: "offer-1",
      visitNumber: 1,
      offerShownAt: expiredShownAt,
    } as never);
    repo.advanceVisit.mockResolvedValue({
      id: "offer-1",
      visitNumber: 2,
      offerShownAt: new Date(),
    } as never);

    const result = await planUpgradeOfferService.getOrAdvanceOffer(
      "user-1",
      "NIWASTHAN_IMMERSIVE",
    );

    expect(repo.advanceVisit).toHaveBeenCalledWith("offer-1", 2);
    expect(result.visitNumber).toBe(2);
    expect(result.finalPriceMinor).toBe(742_500n); // hand-verified 25% off 990,000
  });

  it("credits the customer's highest active plan price, not a stale or summed value", async () => {
    packages.findUnique.mockResolvedValue({
      priceMinor: 999_900n,
    } as never);
    repo.findHighestActivePackagePrice.mockResolvedValue(99_900n); // Complete tier
    repo.findExisting.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      id: "offer-1",
      visitNumber: 1,
      offerShownAt: new Date(),
    } as never);

    const result = await planUpgradeOfferService.getOrAdvanceOffer(
      "user-1",
      "NIWASTHAN_IMMERSIVE",
    );

    // Upgrade base = 999,900 - 99,900 = 900,000. 10% off = 90,000 -> 810,000.
    expect(result.upgradeBaseMinor).toBe(900_000n);
    expect(result.finalPriceMinor).toBe(810_000n);
  });
});
