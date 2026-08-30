import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { substitutionRepository } from "@/server/repositories/substitutionRepository";
import { substitutionService } from "./substitutionService";

vi.mock("@/server/repositories/substitutionRepository", () => ({
  substitutionRepository: {
    itemExists: vi.fn(),
    create: vi.fn(),
    listForItem: vi.fn(),
  },
}));

const repository = vi.mocked(substitutionRepository);

const validInput = {
  fromCatalogueItemId: "item-from",
  toCatalogueItemId: "item-to",
  qualityImpact: "SAME" as const,
  maintenanceImpact: "SAME" as const,
  appearanceImpact: "SAME" as const,
  durabilityImpact: "REDUCED" as const,
  explanation: "Cheaper laminate grade, same design language.",
};

describe("substitutionService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("create", () => {
    it("rejects when the fromCatalogueItemId does not exist", async () => {
      repository.itemExists.mockImplementation(async (id) => id === "item-to");

      await expect(
        substitutionService.create("admin-1", validInput),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("rejects when the toCatalogueItemId does not exist", async () => {
      repository.itemExists.mockImplementation(
        async (id) => id === "item-from",
      );

      await expect(
        substitutionService.create("admin-1", validInput),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("creates a substitution once both items are confirmed to exist", async () => {
      repository.itemExists.mockResolvedValue(true);
      repository.create.mockResolvedValue({ id: "sub-1" } as never);

      const result = await substitutionService.create("admin-1", validInput);

      expect(result).toEqual({ id: "sub-1" });
      expect(repository.create).toHaveBeenCalledWith("admin-1", validInput);
    });
  });

  describe("listForItem", () => {
    it("rejects listing for a catalogue item that does not exist", async () => {
      repository.itemExists.mockResolvedValue(false);

      await expect(
        substitutionService.listForItem("missing-item"),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(repository.listForItem).not.toHaveBeenCalled();
    });

    it("computes the live price difference from current catalogue prices", async () => {
      repository.itemExists.mockResolvedValue(true);
      repository.listForItem.mockResolvedValue([
        {
          id: "sub-1",
          toCatalogueItemId: "item-to",
          qualityImpact: "SAME",
          maintenanceImpact: "SAME",
          appearanceImpact: "SAME",
          durabilityImpact: "REDUCED",
          explanation: "Cheaper laminate grade.",
          fromCatalogueItem: { prices: [{ amountMinor: 50_000n }] },
          toCatalogueItem: {
            name: "Budget Laminate",
            prices: [{ amountMinor: 15_000n }],
          },
        },
      ] as never);

      const result = await substitutionService.listForItem("item-from");

      expect(result).toEqual([
        expect.objectContaining({
          toCatalogueItemName: "Budget Laminate",
          fromPriceMinor: 50_000n,
          toPriceMinor: 15_000n,
          savingMinor: 35_000n,
        }),
      ]);
    });

    it("returns null savings when either item has no current price on record", async () => {
      repository.itemExists.mockResolvedValue(true);
      repository.listForItem.mockResolvedValue([
        {
          id: "sub-1",
          toCatalogueItemId: "item-to",
          qualityImpact: "UNKNOWN",
          maintenanceImpact: "UNKNOWN",
          appearanceImpact: "UNKNOWN",
          durabilityImpact: "UNKNOWN",
          explanation: "No current pricing on either item.",
          fromCatalogueItem: { prices: [] },
          toCatalogueItem: { name: "Unpriced Item", prices: [] },
        },
      ] as never);

      const result = await substitutionService.listForItem("item-from");

      expect(result[0].fromPriceMinor).toBeNull();
      expect(result[0].savingMinor).toBeNull();
    });
  });
});
