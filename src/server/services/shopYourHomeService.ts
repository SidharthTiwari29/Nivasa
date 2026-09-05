import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/errors/AppError";

export type ShopYourHomeItem = {
  boqLineId: string;
  projectId: string;
  projectName: string;
  roomId: string | null;
  description: string;
  quantity: string;
  unit: string;
  selectedUnitPriceMinor: bigint;
  selectedLineTotalMinor: bigint;
  catalogue: {
    id: string;
    sku: string;
    name: string;
    brand: string | null;
    category: string;
    currentPriceMinor: bigint | null;
    currentMrpMinor: bigint | null;
    currency: string | null;
    availability: string | null;
    verifiedAt: Date | null;
  } | null;
};

/**
 * Converts the user's latest BOQ into a purchase-oriented list without
 * inventing products. Only catalogue links that actually exist are exposed
 * with their current catalogue price; unlinked lines remain visible as
 * "source/contractor required" items so the shop list never pretends every
 * construction cost is a retail SKU.
 */
export async function getShopYourHome(
  propertyId: string,
  ownerId: string,
): Promise<ShopYourHomeItem[]> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId },
    select: { id: true },
  });
  if (!property) throw new NotFoundError("Property");

  const projects = await prisma.designProject.findMany({
    where: { propertyId, ownerId },
    orderBy: { updatedAt: "desc" },
    include: {
      boqs: {
        orderBy: { version: "desc" },
        take: 1,
        include: {
          lines: {
            orderBy: { description: "asc" },
            include: {
              catalogueItem: {
                include: {
                  prices: {
                    where: { effectiveTo: null },
                    orderBy: { effectiveFrom: "desc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return projects.flatMap((project) =>
    project.boqs.flatMap((boq) =>
      boq.lines.map((line) => {
        const item = line.catalogueItem;
        const price = item?.prices[0] ?? null;
        return {
          boqLineId: line.id,
          projectId: project.id,
          projectName: project.name,
          roomId: project.roomId,
          description: line.description,
          quantity: line.quantity.toString(),
          unit: line.unit,
          selectedUnitPriceMinor: line.unitPriceMinor,
          selectedLineTotalMinor: line.lineTotalMinor,
          catalogue: item
            ? {
                id: item.id,
                sku: item.sku,
                name: item.name,
                brand: item.brand,
                category: item.category,
                currentPriceMinor: price?.amountMinor ?? null,
                currentMrpMinor: price?.mrpMinor ?? null,
                currency: price?.currency ?? null,
                availability: price?.availability ?? null,
                verifiedAt: price?.verifiedAt ?? null,
              }
            : null,
        };
      }),
    ),
  );
}
