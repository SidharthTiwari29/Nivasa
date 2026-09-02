import { prisma } from "@/server/db/prisma";

export const planUpgradeOfferRepository = {
  // The real "already paid" amount: the highest-priced active package
  // this user currently holds. Using the highest (not the most recent or
  // summed) is the honest choice - a customer holding NIWASTHAN_COMPLETE
  // has already paid for capability an upgrade to NIWASTHAN_IMMERSIVE
  // must credit against, and summing multiple historical purchases could
  // overstate genuine credit if they upgraded through several tiers
  // already (each tier's entitlement doesn't stack in value the way
  // separate distinct purchases would).
  async findHighestActivePackagePrice(userId: string): Promise<bigint> {
    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: { package: { select: { priceMinor: true } } },
    });
    if (entitlements.length === 0) return 0n;
    return entitlements.reduce(
      (max, e) => (e.package.priceMinor > max ? e.package.priceMinor : max),
      0n,
    );
  },

  findExisting(userId: string, targetPackageCode: string) {
    return prisma.planUpgradeOffer.findUnique({
      where: { userId_targetPackageCode: { userId, targetPackageCode } },
    });
  },

  create(userId: string, targetPackageCode: string) {
    return prisma.planUpgradeOffer.create({
      data: { userId, targetPackageCode, visitNumber: 1 },
    });
  },

  advanceVisit(id: string, newVisitNumber: number) {
    return prisma.planUpgradeOffer.update({
      where: { id },
      data: { visitNumber: newVisitNumber, offerShownAt: new Date() },
    });
  },
};
