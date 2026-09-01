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
