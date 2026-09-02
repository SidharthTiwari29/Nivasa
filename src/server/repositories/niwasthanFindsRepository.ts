import { prisma } from "@/server/db/prisma";

export const niwasthanFindsRepository = {
  // Ownership-scoped through BoqLine -> Boq -> DesignProject.ownerId, the
  // same chain-of-relations pattern already used elsewhere for BOQ data -
  // a caller cannot scan for savings on a line item that isn't theirs.
  findSelectedItemForOwner(boqLineId: string, ownerId: string) {
    return prisma.boqLine.findFirst({
      where: { id: boqLineId, boq: { project: { ownerId } } },
      include: {
        catalogueItem: { select: { category: true } },
        boq: { select: { project: { select: { ownerId: true } } } },
      },
    });
  },
};
