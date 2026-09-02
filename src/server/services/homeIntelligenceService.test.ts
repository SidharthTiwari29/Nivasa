import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";

const repository = {
  findForOwner: vi.fn(),
  findRoomForOwner: vi.fn(),
  listRoomUnderstandings: vi.fn(),
  listHomeDna: vi.fn(),
  confirmLatestRoomUnderstanding: vi.fn(),
};

vi.mock("@/server/repositories/homeIntelligenceRepository", () => ({
  homeIntelligenceRepository: repository,
}));

const { homeIntelligenceService } = await import("./homeIntelligenceService");

describe("homeIntelligenceService collection semantics", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

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

describe("homeIntelligenceService.confirmRoomUnderstanding", () => {
  beforeEach(() => vi.resetAllMocks());

  it("rejects when the room or its understanding does not exist for this owner", async () => {
    repository.confirmLatestRoomUnderstanding.mockResolvedValue(null);

    await expect(
      homeIntelligenceService.confirmRoomUnderstanding(
        "property-1",
        "room-1",
        "user-1",
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects when the latest version is already confirmed - a distinct outcome from not found", async () => {
    repository.confirmLatestRoomUnderstanding.mockResolvedValue(undefined);

    await expect(
      homeIntelligenceService.confirmRoomUnderstanding(
        "property-1",
        "room-1",
        "user-1",
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("confirms the latest version and returns it, attributing the confirming user", async () => {
    repository.confirmLatestRoomUnderstanding.mockResolvedValue({
      id: "ru-1",
      status: "CONFIRMED",
      confirmedByUserId: "user-1",
    } as never);

    const result = await homeIntelligenceService.confirmRoomUnderstanding(
      "property-1",
      "room-1",
      "user-1",
    );

    expect(result).toEqual({
      id: "ru-1",
      status: "CONFIRMED",
      confirmedByUserId: "user-1",
    });
    expect(repository.confirmLatestRoomUnderstanding).toHaveBeenCalledWith(
      "property-1",
      "room-1",
      "user-1",
      "user-1",
    );
  });
});
