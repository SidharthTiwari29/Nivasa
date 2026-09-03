import { NotFoundError } from "@/server/errors/AppError";
import { planUpgradeOfferRepository } from "@/server/repositories/planUpgradeOfferRepository";
import { prisma } from "@/server/db/prisma";
import {
  computeUpgradeOffer,
  isOfferExpired,
  OFFER_WINDOW_MS,
} from "@/server/services/planUpgradeOffer";

export const planUpgradeOfferService = {
  // The real entry point: called every time a customer views the
  // upgrade offer. Returns the SAME offer if their previous visit's
  // 4-hour window hasn't expired yet - this is what prevents a customer
  // from refreshing the page repeatedly to instantly reach the maximum
  // discount tier, which would defeat the entire point of a visit-based,
  // time-boxed incentive.
  async getOrAdvanceOffer(userId: string, targetPackageCode: string) {
    const targetPackage = await prisma.package.findUnique({
      where: { code: targetPackageCode },
    });
    if (!targetPackage) throw new NotFoundError("Package");

    const alreadyPaidMinor =
      await planUpgradeOfferRepository.findHighestActivePackagePrice(userId);

    const existing = await planUpgradeOfferRepository.findExisting(
      userId,
      targetPackageCode,
    );

    const now = new Date();
    let record = existing;

    if (!record) {
      record = await planUpgradeOfferRepository.create(
        userId,
        targetPackageCode,
      );
    } else if (isOfferExpired(record.offerShownAt, now)) {
      record = await planUpgradeOfferRepository.advanceVisit(
        record.id,
        record.visitNumber + 1,
      );
    }
    // else: the existing, still-valid offer is returned completely
    // unchanged - no re-increment, no reset of the window.

    const pricing = computeUpgradeOffer({
      targetPriceMinor: targetPackage.priceMinor,
      alreadyPaidMinor,
      visitNumber: record.visitNumber,
    });

    return {
      visitNumber: record.visitNumber,
      offerShownAt: record.offerShownAt,
      expiresAt: new Date(record.offerShownAt.getTime() + OFFER_WINDOW_MS),
      ...pricing,
    };
  },
};
