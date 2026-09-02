import { prisma } from "@/server/db/prisma";

export const referralRepository = {
  findCodeByOwner(ownerUserId: string) {
    return prisma.referralCode.findUnique({ where: { ownerUserId } });
  },

  findCodeByValue(code: string) {
    return prisma.referralCode.findUnique({ where: { code } });
  },

  findCodeById(id: string) {
    return prisma.referralCode.findUnique({ where: { id } });
  },

  createCode(ownerUserId: string, code: string) {
    return prisma.referralCode.create({ data: { ownerUserId, code } });
  },

  // A user can be referred at most once - enforced by the schema's unique
  // constraint on referredUserId, not just application logic, so even a
  // buggy caller can't create two referral records for the same person by
  // signing up twice with different codes.
  createReferral(referralCodeId: string, referredUserId: string) {
    return prisma.referral.create({
      data: { referralCodeId, referredUserId },
    });
  },

  findPendingReferralForUser(referredUserId: string) {
    return prisma.referral.findFirst({
      where: { referredUserId, status: "PENDING" },
    });
  },

  // Regardless of status - the plan-purchase referral discount is a
  // genuinely different trigger and timing from the bonus-credit reward
  // (which only fires on real order delivery). A referral relationship
  // existing at all is what this discount cares about; whether the
  // later delivery-based bonus has separately been paid out is
  // irrelevant to it.
  findAnyReferralForUser(referredUserId: string) {
    return prisma.referral.findUnique({
      where: { referredUserId },
      include: { referralCode: { select: { ownerUserId: true } } },
    });
  },

  // "Goes with the interior with us" means a genuine paid-plan purchase,
  // not merely creating a free account - checked against a real,
  // currently-active entitlement to a package with priceMinor > 0,
  // never inferred from account age or activity alone.
  async hasActivePaidPlan(userId: string): Promise<boolean> {
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        package: { priceMinor: { gt: 0 } },
      },
    });
    return entitlement !== null;
  },

  // A referral code can have multiple different people use it over time
  // (one code, many referred users) - this returns every referred user
  // id under a given code so the caller can check each one's real
  // conversion status individually, rather than assuming a code with
  // any referral at all automatically qualifies its owner.
  async findReferredUserIdsForCode(referralCodeId: string): Promise<string[]> {
    const referrals = await prisma.referral.findMany({
      where: { referralCodeId },
      select: { referredUserId: true },
    });
    return referrals.map((r) => r.referredUserId);
  },

  findSignupSignal(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { signupIpAddress: true, signupUserAgent: true },
    });
  },

  // The reward is applied via a conditional update (status must still be
  // PENDING) inside the same transaction that grants the bonus credits -
  // the same "conditional update, not read-then-write" pattern already
  // established for quote acceptance and budget locking, so a referral
  // can never be rewarded twice even under concurrent order-completion
  // events.
  async rewardReferral(
    referralId: string,
    orderId: string,
    bonusCredits: number,
    ownerUserId: string,
    ownerEntitlementId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.referral.updateMany({
        where: { id: referralId, status: "PENDING" },
        data: {
          status: "REWARDED",
          triggeringOrderId: orderId,
          bonusCredits,
          rewardedAt: new Date(),
        },
      });
      if (updated.count === 0) return null;

      await tx.entitlement.update({
        where: { id: ownerEntitlementId },
        data: { creditsTotal: { increment: bonusCredits } },
      });

      return tx.referral.findUniqueOrThrow({ where: { id: referralId } });
    });
  },

  // The referral code owner needs an ACTIVE entitlement to receive bonus
  // credits into - if they have none (e.g. never purchased anything),
  // there's no balance to add credits to, and rewarding is deferred rather
  // than fabricating a zero-cost entitlement out of nowhere.
  findActiveEntitlementForOwner(ownerUserId: string) {
    return prisma.entitlement.findFirst({
      where: { userId: ownerUserId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });
  },
};
