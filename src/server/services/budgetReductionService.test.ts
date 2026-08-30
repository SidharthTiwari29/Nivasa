import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { budgetReductionService } from "./budgetReductionService";

vi.mock("@/server/repositories/budgetRepository", () => ({
  budgetRepository: { findPlan: vi.fn() },
}));

const repo = vi.mocked(budgetRepository);

describe("budgetReductionService.suggestReduction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a property with no budget plan", async () => {
    repo.findPlan.mockResolvedValue(null);

    await expect(
      budgetReductionService.suggestReduction("property-1", "user-1", 1000n),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a plan with no versions yet", async () => {
    repo.findPlan.mockResolvedValue({ plan: {}, versions: [] } as never);

    await expect(
      budgetReductionService.suggestReduction("property-1", "user-1", 1000n),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("plans a reduction against the latest version's real lines", async () => {
    repo.findPlan.mockResolvedValue({
      plan: {},
      versions: [
        {
          version: 2,
          lines: [
            {
              id: "line-1",
              category: "Kitchen",
              description: "Cabinets",
              lowMinor: 30_000n,
              targetMinor: 50_000n,
            },
          ],
        },
      ],
    } as never);

    const plan = await budgetReductionService.suggestReduction(
      "property-1",
      "user-1",
      10_000n,
    );

    expect(plan.targetAchieved).toBe(true);
    expect(plan.suggestions[0].reductionMinor).toBe(10_000n);
  });
});
