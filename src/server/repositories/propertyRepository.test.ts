import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { propertyRepository } from "./propertyRepository";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    property: { create: vi.fn(), updateMany: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

describe("propertyRepository.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a real property with only the required fields when nothing else is given", async () => {
    db.property.create.mockResolvedValue({ id: "property-1" } as never);

    await propertyRepository.create("owner-1", { name: "My Home" });

    expect(db.property.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        name: "My Home",
        address: undefined,
        city: undefined,
        propertyType: undefined,
        targetBudgetMinor: undefined,
      },
    });
  });

  it("converts a real, stated rupee budget to the correct paise value - hand-verified", async () => {
    db.property.create.mockResolvedValue({ id: "property-1" } as never);

    await propertyRepository.create("owner-1", {
      name: "My Home",
      targetBudget: 500_000,
    });

    // Hand-verified: Rs 5,00,000 = 50,000,000 paise
    expect(db.property.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ targetBudgetMinor: 50_000_000n }),
      }),
    );
  });

  it("passes through city and propertyType exactly as given", async () => {
    db.property.create.mockResolvedValue({ id: "property-1" } as never);

    await propertyRepository.create("owner-1", {
      name: "My Home",
      city: "Bengaluru",
      propertyType: "THREE_BHK",
    });

    expect(db.property.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          city: "Bengaluru",
          propertyType: "THREE_BHK",
        }),
      }),
    );
  });
});

describe("propertyRepository.updateForOwner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("converts a real, updated rupee budget to the correct paise value", async () => {
    db.property.updateMany.mockResolvedValue({ count: 1 } as never);

    await propertyRepository.updateForOwner("property-1", "owner-1", {
      targetBudget: 750_000,
    });

    expect(db.property.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ targetBudgetMinor: 75_000_000n }),
      }),
    );
  });

  it("real, explicit null clears a previously-set budget rather than leaving it unchanged", async () => {
    db.property.updateMany.mockResolvedValue({ count: 1 } as never);

    await propertyRepository.updateForOwner("property-1", "owner-1", {
      targetBudget: null,
    });

    expect(db.property.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ targetBudgetMinor: null }),
      }),
    );
  });

  it("omitting the budget field entirely leaves the stored value untouched", async () => {
    db.property.updateMany.mockResolvedValue({ count: 1 } as never);

    await propertyRepository.updateForOwner("property-1", "owner-1", {
      name: "Renamed Home",
    });

    expect(db.property.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ targetBudgetMinor: undefined }),
      }),
    );
  });
});
