import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
import { catalogueCurationService } from "./catalogueCurationService";

vi.mock("@/server/repositories/catalogueCurationRepository", () => ({
  catalogueCurationRepository: {
    findActiveOptionsByCategories: vi.fn(),
  },
}));

const repo = vi.mocked(catalogueCurationRepository);

describe("catalogueCurationService.curate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes through to the real curation engine using real fetched options", async () => {
    repo.findActiveOptionsByCategories.mockResolvedValue(
      new Map([
        [
          "sofa",
          [
            {
              itemId: "sofa-a",
              name: "Sofa A",
              brand: "Brand A",
              unitPriceMinor: 20_000n,
              mrpMinor: 24_000n,
              priceEffectiveFrom: new Date("2026-08-25T00:00:00Z"),
            },
          ],
        ],
      ]),
    );

    const result = await catalogueCurationService.curate(
      [{ category: "sofa", quantity: 1 }],
      50_000n,
    );

    expect(repo.findActiveOptionsByCategories).toHaveBeenCalledWith(["sofa"]);
    expect(result.selections[0].itemId).toBe("sofa-a");
    expect(result.withinBudget).toBe(true);
  });
});
