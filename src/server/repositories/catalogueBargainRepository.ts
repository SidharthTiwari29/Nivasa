import { prisma } from "@/server/db/prisma";

export const catalogueBargainRepository = {
  // Ownership-scoped through BoqLine -> Boq -> DesignProject.ownerId, the
  // same chain-of-relations pattern already used for the Niwasthan Finds
  // scanner - a caller cannot propose a bargain on a line item that
  // isn't theirs.
  findLineForOwner(boqLineId: string, ownerId: string) {
    return prisma.boqLine.findFirst({
      where: { id: boqLineId, boq: { project: { ownerId } } },
      include: {
        catalogueItem: {
          include: { prices: { where: { effectiveTo: null }, take: 1 } },
        },
      },
    });
  },

  // Applying an accepted bargain for real: updates the line's real
  // unitPriceMinor and recomputes lineTotalMinor from it, preserving
  // every other real cost component (labour, material, tax, wastage,
  // discount) exactly as they were - a bargain changes the unit price of
  // the product itself, never silently touches the labour/tax/wastage
  // figures it has nothing to do with.
  updateLinePrice(
    boqLineId: string,
    newUnitPriceMinor: bigint,
    newLineTotalMinor: bigint,
  ) {
    return prisma.boqLine.update({
      where: { id: boqLineId },
      data: {
        unitPriceMinor: newUnitPriceMinor,
        lineTotalMinor: newLineTotalMinor,
      },
    });
  },
};
