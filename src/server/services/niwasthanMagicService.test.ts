import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { designBoqGenerationRepository } from "@/server/repositories/designBoqGenerationRepository";
import { catalogueCurationService } from "@/server/services/catalogueCurationService";
import { featureAccessService } from "@/server/entitlements/featureAccessService";
import { niwasthanMagicService } from "./niwasthanMagicService";

vi.mock("@/server/repositories/designBoqGenerationRepository", () => ({
  designBoqGenerationRepository: { findProjectWithRoomForOwner: vi.fn() },
}));
vi.mock("@/server/services/catalogueCurationService", () => ({
  catalogueCurationService: { curate: vi.fn() },
}));
vi.mock("@/server/entitlements/featureAccessService", () => ({
  featureAccessService: { requireFeature: vi.fn() },
}));

const repo = vi.mocked(designBoqGenerationRepository);
const curation = vi.mocked(catalogueCurationService);
const access = vi.mocked(featureAccessService);

describe("niwasthanMagicService.suggestSmartUpgrades", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    access.requireFeature.mockResolvedValue(undefined);
  });

  it("checks plan access before doing anything else", async () => {
    access.requireFeature.mockRejectedValue(new Error("FORBIDDEN"));

    await expect(
      niwasthanMagicService.suggestSmartUpgrades(
        "project-1",
        "user-1",
        50_000n,
      ),
    ).rejects.toThrow("FORBIDDEN");
    expect(repo.findProjectWithRoomForOwner).not.toHaveBeenCalled();
  });

  it("rejects when the project does not exist or is not owned by the caller", async () => {
    repo.findProjectWithRoomForOwner.mockResolvedValue(null);

    await expect(
      niwasthanMagicService.suggestSmartUpgrades(
        "project-1",
        "user-1",
        50_000n,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a project with no specific room", async () => {
    repo.findProjectWithRoomForOwner.mockResolvedValue({
      id: "project-1",
      room: null,
    } as never);

    await expect(
      niwasthanMagicService.suggestSmartUpgrades(
        "project-1",
        "user-1",
        50_000n,
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("returns an honest empty result for a room type with no defined smart upgrades (OTHER), rather than an error", async () => {
    repo.findProjectWithRoomForOwner.mockResolvedValue({
      id: "project-1",
      room: { type: "OTHER" },
    } as never);

    const result = await niwasthanMagicService.suggestSmartUpgrades(
      "project-1",
      "user-1",
      50_000n,
    );

    expect(result).toEqual({ selections: [], totalMinor: 0n });
    expect(curation.curate).not.toHaveBeenCalled();
  });

  it("curates real smart upgrade suggestions for a living room", async () => {
    repo.findProjectWithRoomForOwner.mockResolvedValue({
      id: "project-1",
      room: { type: "LIVING_ROOM" },
    } as never);
    curation.curate.mockResolvedValue({
      selections: [{ category: "smart-lighting" }],
      totalMinor: 5_000n,
    } as never);

    const result = await niwasthanMagicService.suggestSmartUpgrades(
      "project-1",
      "user-1",
      50_000n,
    );

    expect(curation.curate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ category: "smart-lighting" }),
      ]),
      50_000n,
    );
    expect(result.totalMinor).toBe(5_000n);
  });
});
