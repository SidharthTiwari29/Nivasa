import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import {
  addCataloguePrice,
  bulkImportCatalogue,
  getCatalogueItem,
  listCatalogue,
  upsertCatalogueItem,
} from "./catalogueService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    catalogueItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    cataloguePrice: { create: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

describe("catalogueService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("listCatalogue", () => {
    it("lists only active items, optionally filtered by category", async () => {
      db.catalogueItem.findMany.mockResolvedValue([
        { id: "item-1", sku: "SKU-1" },
      ] as never);

      const result = await listCatalogue("sofa");

      expect(db.catalogueItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true, category: "sofa" },
        }),
      );
      expect(result).toEqual([{ id: "item-1", sku: "SKU-1" }]);
    });
  });

  describe("getCatalogueItem", () => {
    it("returns null for a SKU that does not exist or is inactive", async () => {
      db.catalogueItem.findFirst.mockResolvedValue(null);

      const result = await getCatalogueItem("NONEXISTENT-SKU");

      expect(result).toBeNull();
    });

    it("returns the real item with its latest price and a real category-peer count for a known, active SKU", async () => {
      db.catalogueItem.findFirst.mockResolvedValue({
        id: "item-1",
        sku: "SKU-1",
        category: "sofa",
      } as never);
      db.catalogueItem.count.mockResolvedValue(4);

      const result = await getCatalogueItem("SKU-1");

      expect(db.catalogueItem.count).toHaveBeenCalledWith({
        where: { category: "sofa", active: true },
      });
      expect(result).toEqual({
        id: "item-1",
        sku: "SKU-1",
        category: "sofa",
        alternativesConsidered: 4,
      });
    });
  });

  describe("upsertCatalogueItem", () => {
    it("creates or updates the item by its real SKU", async () => {
      db.catalogueItem.upsert.mockResolvedValue({
        id: "item-1",
        sku: "SKU-1",
      } as never);

      const result = await upsertCatalogueItem({
        sku: "SKU-1",
        name: "Modular Sofa",
        category: "sofa",
        unit: "piece",
      });

      expect(db.catalogueItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { sku: "SKU-1" } }),
      );
      expect(result).toEqual({ id: "item-1", sku: "SKU-1" });
    });
  });

  describe("addCataloguePrice", () => {
    it("rejects adding a price for a SKU that does not exist", async () => {
      db.catalogueItem.findUnique.mockResolvedValue(null);

      await expect(
        addCataloguePrice({ sku: "NONEXISTENT-SKU", amountMinor: 20_000n }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(db.cataloguePrice.create).not.toHaveBeenCalled();
    });

    it("creates a real price for an existing item, defaulting currency to INR", async () => {
      db.catalogueItem.findUnique.mockResolvedValue({
        id: "item-1",
        sku: "SKU-1",
      } as never);
      db.cataloguePrice.create.mockResolvedValue({
        id: "price-1",
        amountMinor: 20_000n,
      } as never);

      const result = await addCataloguePrice({
        sku: "SKU-1",
        amountMinor: 20_000n,
      });

      expect(db.cataloguePrice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            itemId: "item-1",
            amountMinor: 20_000n,
            currency: "INR",
          }),
        }),
      );
      expect(result).toEqual({ id: "price-1", amountMinor: 20_000n });
    });

    it("uses the real, explicitly given currency when provided instead of the INR default", async () => {
      db.catalogueItem.findUnique.mockResolvedValue({ id: "item-1" } as never);
      db.cataloguePrice.create.mockResolvedValue({ id: "price-1" } as never);

      await addCataloguePrice({
        sku: "SKU-1",
        amountMinor: 20_000n,
        currency: "USD",
      });

      expect(db.cataloguePrice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: "USD" }),
        }),
      );
    });

    it("passes through the real MRP, warranty, and availability fields when given", async () => {
      db.catalogueItem.findUnique.mockResolvedValue({ id: "item-1" } as never);
      db.cataloguePrice.create.mockResolvedValue({ id: "price-1" } as never);

      await addCataloguePrice({
        sku: "SKU-1",
        amountMinor: 20_000n,
        mrpMinor: 24_000n,
        warrantyMonths: 12,
        availability: "IN_STOCK",
      });

      expect(db.cataloguePrice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            mrpMinor: 24_000n,
            warrantyMonths: 12,
            availability: "IN_STOCK",
          }),
        }),
      );
    });

    it("defaults availability to UNKNOWN, never silently to IN_STOCK, when not given", async () => {
      db.catalogueItem.findUnique.mockResolvedValue({ id: "item-1" } as never);
      db.cataloguePrice.create.mockResolvedValue({ id: "price-1" } as never);

      await addCataloguePrice({ sku: "SKU-1", amountMinor: 20_000n });

      expect(db.cataloguePrice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ availability: "UNKNOWN" }),
        }),
      );
    });
  });

  describe("bulkImportCatalogue", () => {
    it("imports every real, valid row and reports each as IMPORTED", async () => {
      db.catalogueItem.upsert.mockResolvedValue({ id: "item-1" } as never);
      db.catalogueItem.findUnique.mockResolvedValue({ id: "item-1" } as never);
      db.cataloguePrice.create.mockResolvedValue({ id: "price-1" } as never);

      const results = await bulkImportCatalogue([
        {
          sku: "SKU-1",
          name: "Modular Sofa",
          category: "sofa",
          unit: "piece",
          amountMinor: 20_000n,
        },
        {
          sku: "SKU-2",
          name: "Dining Table",
          category: "dining",
          unit: "piece",
          amountMinor: 35_000n,
        },
      ]);

      expect(results).toEqual([
        { sku: "SKU-1", status: "IMPORTED" },
        { sku: "SKU-2", status: "IMPORTED" },
      ]);
    });

    it("isolates a real per-row failure - one bad row never discards the others", async () => {
      db.catalogueItem.upsert.mockResolvedValue({ id: "item-1" } as never);
      // First row's price-add fails (item lookup returns null); second
      // row succeeds normally.
      db.catalogueItem.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "item-2" } as never);
      db.cataloguePrice.create.mockResolvedValue({ id: "price-2" } as never);

      const results = await bulkImportCatalogue([
        {
          sku: "SKU-BAD",
          name: "Broken Row",
          category: "sofa",
          unit: "piece",
          amountMinor: 20_000n,
        },
        {
          sku: "SKU-GOOD",
          name: "Good Row",
          category: "sofa",
          unit: "piece",
          amountMinor: 25_000n,
        },
      ]);

      expect(results[0].status).toBe("FAILED");
      expect(results[0].reason).toContain("CatalogueItem");
      expect(results[1].status).toBe("IMPORTED");
    });
  });
});
