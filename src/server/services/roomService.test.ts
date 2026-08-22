import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { propertyRepository } from "@/server/repositories/propertyRepository";
import { roomRepository } from "@/server/repositories/roomRepository";
import { roomService } from "./roomService";

vi.mock("@/server/repositories/propertyRepository", () => ({
  propertyRepository: {
    findByIdForOwner: vi.fn(),
  },
}));

vi.mock("@/server/repositories/roomRepository", () => ({
  roomRepository: {
    listForOwner: vi.fn(),
    findByIdForOwner: vi.fn(),
    create: vi.fn(),
    updateForOwner: vi.fn(),
    deleteForOwner: vi.fn(),
  },
}));

const properties = vi.mocked(propertyRepository);
const repository = vi.mocked(roomRepository);

describe("roomService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects list for an unowned property", async () => {
    properties.findByIdForOwner.mockResolvedValue(null);
    await expect(
      roomService.list("property-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects create when the property is not owned", async () => {
    properties.findByIdForOwner.mockResolvedValue(null);
    await expect(
      roomService.create("user-1", {
        propertyId: "property-1",
        type: "BEDROOM",
        name: "Bedroom",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects get for an unowned room", async () => {
    repository.findByIdForOwner.mockResolvedValue(null);
    await expect(
      roomService.get("room-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects update for an unowned room", async () => {
    repository.updateForOwner.mockResolvedValue({ count: 0 });
    await expect(
      roomService.update("room-1", "user-1", { name: "Updated" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.findByIdForOwner).not.toHaveBeenCalled();
  });

  it("rejects delete for an unowned room", async () => {
    repository.deleteForOwner.mockResolvedValue({ count: 0 });
    await expect(
      roomService.remove("room-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates a room after verifying property ownership", async () => {
    properties.findByIdForOwner.mockResolvedValue({ id: "property-1" } as never);
    repository.create.mockResolvedValue({ id: "room-1" } as never);

    const input = {
      propertyId: "property-1",
      type: "BEDROOM" as const,
      name: "Bedroom",
    };
    await roomService.create("user-1", input);

    expect(properties.findByIdForOwner).toHaveBeenCalledWith(
      "property-1",
      "user-1",
    );
    expect(repository.create).toHaveBeenCalledWith("user-1", input);
  });
});
