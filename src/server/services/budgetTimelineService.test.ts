import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { budgetTimelineService } from "./budgetTimelineService";

vi.mock("@/server/repositories/budgetRepository", () => ({
  budgetRepository: { listTimeline: vi.fn() },
}));

const repo = vi.mocked(budgetRepository);

describe("budgetTimelineService.getTimeline", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a property with no budget plan (or not owned by the caller)", async () => {
    repo.listTimeline.mockResolvedValue(null);

    await expect(
      budgetTimelineService.getTimeline("property-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns a merged, real timeline for an owned property", async () => {
    repo.listTimeline.mockResolvedValue({
      versions: [
        {
          version: 1,
          totalLowMinor: 90_000n,
          totalTargetMinor: 100_000n,
          totalHighMinor: 110_000n,
          createdAt: new Date("2026-01-01T00:00:00Z"),
        },
      ],
      impacts: [],
    } as never);

    const timeline = await budgetTimelineService.getTimeline(
      "property-1",
      "user-1",
    );

    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe("VERSION_CREATED");
  });
});
