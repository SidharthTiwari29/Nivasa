import { prisma } from "@/server/db/prisma";
import type { CreateSubstitutionInput } from "@/server/validators/substitution";

export const substitutionRepository = {
  itemExists(catalogueItemId: string) {
    return prisma.catalogueItem
      .findFirst({
        where: { id: catalogueItemId, active: true },
        select: { id: true },
      })
      .then((item) => item !== null);
  },

  create(createdByUserId: string, input: CreateSubstitutionInput) {
    return prisma.catalogueSubstitution.create({
      data: { ...input, createdByUserId },
    });
  },

  // Returns every curated substitution suggested FROM this item, along
  // with each item's current price (effectiveTo: null means "still in
  // effect") - the price comparison itself is always computed live from
  // whatever is currently authoritative, never cached on the substitution
  // record, so it can't silently go stale relative to real catalogue
  // pricing.
  listForItem(catalogueItemId: string) {
    return prisma.catalogueSubstitution.findMany({
      where: { fromCatalogueItemId: catalogueItemId },
      include: {
        fromCatalogueItem: {
          include: {
            prices: { where: { effectiveTo: null }, take: 1 },
          },
        },
        toCatalogueItem: {
          include: {
            prices: { where: { effectiveTo: null }, take: 1 },
          },
        },
      },
    });
  },
};
