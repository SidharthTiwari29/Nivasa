import { prisma } from "@/server/db/prisma";

export const brandRepository = {
  findByName(name: string) {
    return prisma.brand.findUnique({ where: { name } });
  },

  findById(id: string) {
    return prisma.brand.findUnique({ where: { id } });
  },

  create(name: string, website?: string) {
    return prisma.brand.create({ data: { name, website } });
  },

  // A genuine curator's written assessment, attributed and dated - the
  // same discipline as catalogue price verification. curatedByUserId is
  // required, never defaulted or inferred, since a brand assessment with
  // no accountable author behind it is exactly the kind of unattributed
  // claim this system's evidence discipline exists to prevent.
  curate(
    brandId: string,
    curatedByUserId: string,
    input: {
      positioning?: string;
      strengths?: string;
      weaknesses?: string;
    },
  ) {
    return prisma.brand.update({
      where: { id: brandId },
      data: {
        curatedPositioning: input.positioning,
        curatedStrengths: input.strengths,
        curatedWeaknesses: input.weaknesses,
        curatedByUserId,
        curatedAt: new Date(),
      },
    });
  },
};
