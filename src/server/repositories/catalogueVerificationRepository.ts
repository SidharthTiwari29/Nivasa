import { prisma } from "@/server/db/prisma";

export const catalogueVerificationRepository = {
  findCurrentPrice(catalogueItemId: string) {
    return prisma.cataloguePrice.findFirst({
      where: { itemId: catalogueItemId, effectiveTo: null },
    });
  },

  verify(cataloguePriceId: string, verifiedByUserId: string) {
    return prisma.cataloguePrice.update({
      where: { id: cataloguePriceId },
      data: { verifiedByUserId, verifiedAt: new Date() },
    });
  },
};
