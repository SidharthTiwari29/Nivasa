import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { designBattleRepository } from "@/server/repositories/designBattleRepository";
import { designBattleService } from "./designBattleService";

vi.mock("@/server/repositories/designBattleRepository", () => ({
  designBattleRepository: {
    findProjectForOwner: vi.fn(),
    findLatestBoqForProject: vi.fn(),
  },
}));

const repo = vi.mocked(designBattleRepository);

describe("designBattleService.battle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when project A does not exist or is not owned by the caller", async () => {
    repo.findProjectForOwner.mockImplementation(async (id) =>
      id === "project-b" ? ({ id: "project-b", name: "B" } as never) : null,
    );

    await expect(
      designBattleService.battle("project-a", "project-b", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects when project B does not exist or is not owned by the caller", async () => {
    repo.findProjectForOwner.mockImplementation(async (id) =>
      id === "project-a" ? ({ id: "project-a", name: "A" } as never) : null,
    );

    await expect(
      designBattleService.battle("project-a", "project-b", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns a real comparison using each project's actual latest BOQ", async () => {
    repo.findProjectForOwner.mockImplementation(async (id) =>
      id === "project-a"
        ? ({ id: "project-a", name: "Design A" } as never)
        : ({ id: "project-b", name: "Design B" } as never),
    );
    repo.findLatestBoqForProject.mockImplementation(async (id) =>
      id === "project-a"
        ? ({ totalMinor: 68_000_000n, currency: "INR" } as never)
        : ({ totalMinor: 72_000_000n, currency: "INR" } as never),
    );

    const result = await designBattleService.battle(
      "project-a",
      "project-b",
      "user-1",
    );

    expect(result.a.cost).toEqual({
      available: true,
      value: { totalMinor: 68_000_000n, currency: "INR" },
    });
    expect(result.b.cost).toEqual({
      available: true,
      value: { totalMinor: 72_000_000n, currency: "INR" },
    });
  });
});
