import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";

const prisma = {
  property: { findFirst: vi.fn() },
  designProject: { findMany: vi.fn() },
};

vi.mock("@/server/db/prisma", () => ({ prisma }));

const { getShopYourHome } = await import("./shopYourHomeService");

describe("getShopYourHome", () => {
  beforeEach(() => vi.resetAllMocks());

  it("rejects access to a property the caller does not own", async () => {
    prisma.property.findFirst.mockResolvedValue(null);

    await expect(
      getShopYourHome("property-1", "owner-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prisma.designProject.findMany).not.toHaveBeenCalled();
  });

  it("returns the latest BOQ lines and live catalogue price without fabricating unlinked products", async () => {
    prisma.property.findFirst.mockResolvedValue({ id: "property-1" });
    prisma.designProject.findMany.mockResolvedValue([
      {
        id: "project-1",
        name: "Living Room",
        roomId: "room-1",
        boqs: [
          {
            version: 4,
            lines: [
              {
                id: "line-1",
                description: "3-seater sofa",
                quantity: "1",
                unit: "unit",
                unitPriceMinor: 850000n,
                lineTotalMinor: 850000n,
                catalogueItem: {
                  id: "item-1",
                  sku: "SOFA-001",
                  name: "Studio Sofa",
                  brand: "Niwasthan Home",
                  category: "SOFA",
                  prices: [
                    {
                      amountMinor: 799000n,
                      mrpMinor: 899000n,
                      currency: "INR",
                      availability: "IN_STOCK",
                      verifiedAt: new Date("2026-09-01T00:00:00Z"),
                    },
                  ],
                },
              },
              {
                id: "line-2",
                description: "Site labour",
                quantity: "2",
                unit: "day",
                unitPriceMinor: 150000n,
                lineTotalMinor: 300000n,
                catalogueItem: null,
              },
            ],
          },
        ],
      },
    ]);

    const result = await getShopYourHome("property-1", "owner-1");

    expect(result).toEqual([
      expect.objectContaining({
        boqLineId: "line-1",
        projectName: "Living Room",
        catalogue: expect.objectContaining({
          sku: "SOFA-001",
          currentPriceMinor: 799000n,
          currentMrpMinor: 899000n,
          availability: "IN_STOCK",
        }),
      }),
      expect.objectContaining({
        boqLineId: "line-2",
        catalogue: null,
      }),
    ]);
  });
});
