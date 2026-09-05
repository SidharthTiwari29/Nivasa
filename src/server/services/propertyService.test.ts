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
    expect(repository.create).toHaveBeenCalledWith("user-1", {
      name: "Home",
    });
  });

  it("returns the fresh property after an owned update", async () => {
    repository.updateForOwner.mockResolvedValue({ count: 1 });
    repository.findByIdForOwner.mockResolvedValue({
      id: "property-1",
    } as never);

    const result = await propertyService.update("property-1", "user-1", {
      address: "New address",
    });

    // targetBudgetMinor is always present on the real, returned shape -
    // null here since the mocked repository row doesn't have one set.
    expect(result).toEqual({ id: "property-1", targetBudgetMinor: null });
    expect(repository.findByIdForOwner).toHaveBeenCalledWith(
      "property-1",
      "user-1",
    );
  });

  it("converts a real BigInt targetBudgetMinor to a plain number - the real fix for a genuine production crash (JSON.stringify and Next.js's render pipeline both fail hard on a raw BigInt)", async () => {
    repository.findByIdForOwner.mockResolvedValue({
      id: "property-1",
      targetBudgetMinor: 50_000_000n,
    } as never);

    const result = await propertyService.get("property-1", "user-1");

    expect(result.targetBudgetMinor).toBe(50_000_000);
    expect(typeof result.targetBudgetMinor).toBe("number");
  });

  it("converts a real BigInt targetBudgetMinor to a plain number for every property in a real list", async () => {
    repository.listForOwner.mockResolvedValue([
      { id: "property-1", targetBudgetMinor: 50_000_000n },
      { id: "property-2", targetBudgetMinor: null },
    ] as never);

    const result = await propertyService.list("user-1");

    expect(result[0].targetBudgetMinor).toBe(50_000_000);
    expect(result[1].targetBudgetMinor).toBeNull();
  });

  it("real, explicit null stays null rather than becoming NaN", async () => {
    repository.findByIdForOwner.mockResolvedValue({
      id: "property-1",
      targetBudgetMinor: null,
    } as never);

    const result = await propertyService.get("property-1", "user-1");

    expect(result.targetBudgetMinor).toBeNull();
  });
});
