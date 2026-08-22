import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { propertyRepository } from "@/server/repositories/propertyRepository";
import { propertyService } from "./propertyService";

vi.mock("@/server/repositories/propertyRepository", () => ({
  propertyRepository: {
    listForOwner: vi.fn(),
    findByIdForOwner: vi.fn(),
    create: vi.fn(),
    updateForOwner: vi.fn(),
    deleteForOwner: vi.fn(),
  },
}));

const repository = vi.mocked(propertyRepository);

describe("propertyService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects get for an unowned property", async () => {
    repository.findByIdForOwner.mockResolvedValue(null);
    await expect(
      propertyService.get("property-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects update for an unowned property", async () => {
    repository.updateForOwner.mockResolvedValue({ count: 0 });
    await expect(
      propertyService.update("property-1", "user-1", { name: "Updated" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.findByIdForOwner).not.toHaveBeenCalled();
  });

  it("rejects delete for an unowned property", async () => {
    repository.deleteForOwner.mockResolvedValue({ count: 0 });
    await expect(
      propertyService.remove("property-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates a property scoped to the caller", async () => {
    repository.create.mockResolvedValue({ id: "property-1" } as never);
    await propertyService.create("user-1", { name: "Home" });
    expect(repository.create).toHaveBeenCalledWith("user-1", { name: "Home" });
  });

  it("returns the fresh property after an owned update", async () => {
    repository.updateForOwner.mockResolvedValue({ count: 1 });
    repository.findByIdForOwner.mockResolvedValue({ id: "property-1" } as never);

    const result = await propertyService.update("property-1", "user-1", {
      address: "New address",
    });

    expect(result).toEqual({ id: "property-1" });
    expect(repository.findByIdForOwner).toHaveBeenCalledWith(
      "property-1",
      "user-1",
    );
  });
});
