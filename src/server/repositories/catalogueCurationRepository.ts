import { prisma } from "@/server/db/prisma";

export const catalogueCurationRepository = {
  // Same "effectiveTo: null means still in effect" convention already
  // used in substitutionRepository - only currently-active items with a
  // real, current price are eligible for curation, never a stale or
  // expired price silently used in a recommendation.
  async findActiveOptionsByCategories(categories: string[]) {
    const items = await prisma.catalogueItem.findMany({
      where: { category: { in: categories }, active: true },
      include: {
        prices: { where: { effectiveTo: null }, take: 1 },
      },
    });

    const byCategory = new Map<
      string,
      Array<{
        itemId: string;
        name: string;
        brand: string | null;
        unitPriceMinor: bigint;
        mrpMinor: bigint | null;
        priceEffectiveFrom: Date;
        warrantyMonths: number | null;
      }>
    >();

    for (const item of items) {
      const price = item.prices[0];
      if (!price) continue; // no real current price - not eligible, never fabricated
      const list = byCategory.get(item.category) ?? [];
      list.push({
        itemId: item.id,
        name: item.name,
        brand: item.brand,
        unitPriceMinor: price.amountMinor,
        mrpMinor: price.mrpMinor,
        priceEffectiveFrom: price.effectiveFrom,
        warrantyMonths: price.warrantyMonths,
      });
      byCategory.set(item.category, list);
    }

    return byCategory;
  },
};
