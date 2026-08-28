import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";

const repository = {
  findForOwner: vi.fn(),
  findRoomForOwner: vi.fn(),
  listRoomUnderstandings: vi.fn(),
  listHomeDna: vi.fn(),
};

vi.mock("@/server/repositories/homeIntelligenceRepository", () => ({
  homeIntelligenceRepository: repository,
}));

const { homeIntelligenceService } = await import("./homeIntelligenceService");

describe("homeIntelligenceService collection semantics", () => {
  it("returns an empty room-understanding collection when the room exists", async () => {
    repository.findRoomForOwner.mockResolvedValue({ id: "room-1" });
    repository.listRoomUnderstandings.mockResolvedValue([]);

    await expect(
      homeIntelligenceService.listRoomUnderstandings(
        "property-1",
        "room-1",
        "owner-1",
      ),
    ).resolves.toEqual([]);
  });

  it("throws when the room does not exist or is not owned by the user", async () => {
    repository.findRoomForOwner.mockResolvedValue(null);

    await expect(
      homeIntelligenceService.listRoomUnderstandings(
        "property-1",
        "room-1",
        "owner-1",
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.listRoomUnderstandings).not.toHaveBeenCalled();
  });

  it("returns an empty Home DNA collection when the property exists", async () => {
    repository.findForOwner.mockResolvedValue({ id: "property-1" });
    repository.listHomeDna.mockResolvedValue([]);

    await expect(
      homeIntelligenceService.listHomeDna("property-1", "owner-1"),
    ).resolves.toEqual([]);
  });

  it("throws when the Home DNA property does not exist or is not owned", async () => {
    repository.findForOwner.mockResolvedValue(null);

    await expect(
      homeIntelligenceService.listHomeDna("property-1", "owner-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.listHomeDna).not.toHaveBeenCalled();
  });
});
