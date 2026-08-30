import { randomBytes } from "crypto";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { referralRepository } from "@/server/repositories/referralRepository";
import { notificationService } from "@/server/services/notificationService";

// Referral earns 20 bonus credits per completed referral - a real,
// specific number rather than a vague "some credits", so the incentive is
// concrete and testable. This is a deliberate default subject to the same
// "adjust this one number to retune the whole program" principle as the
// plan-feature mapping.
const REFERRAL_BONUS_CREDITS = 20;

function generateReferralCode(): string {
  // 6 uppercase alphanumeric characters - short enough for a real invite
  // link/word-of-mouth code, long enough (36^6 ≈ 2.1 billion combinations)
  // that collision retry is a rare edge case, not a routine occurrence.
  return randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
}

export const referralService = {
  // Idempotent by design: a user's referral code is created once and
  // reused forever - calling this repeatedly for the same user always
  // returns their existing code rather than minting a new one each time.
  async getOrCreateMyCode(userId: string) {
    const existing = await referralRepository.findCodeByOwner(userId);
    if (existing) return existing;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await referralRepository.createCode(
          userId,
          generateReferralCode(),
        );
      } catch {
        // Collision on the unique `code` constraint - retry with a fresh
        // random code rather than surfacing a raw database error for
        // what's actually an extremely rare, self-recoverable event.
      }
    }
    throw new ConflictError(
      "Could not generate a unique referral code after multiple attempts",
    );
  },

  // Called once, at sign-up, if the new user arrived via a referral link.
  // Deliberately rejects self-referral (a user cannot refer themselves)
  // and a code that doesn't exist, rather than silently ignoring either
  // case.
  async applyReferralCode(referredUserId: string, code: string) {
    const referralCode = await referralRepository.findCodeByValue(code);
    if (!referralCode) throw new NotFoundError("Referral code");
    if (referralCode.ownerUserId === referredUserId) {
      throw new ConflictError("You cannot use your own referral code");
    }
    return referralRepository.createReferral(referralCode.id, referredUserId);
  },

  // README-aligned to the "credits are currently inert" gap this was built
  // to close: this is meant to be called from the order-delivery
  // transition (procurementService.updateOrderStatus when status becomes
  // DELIVERED), so a referral only pays out on real, completed revenue -
  // never on sign-up alone.
  async rewardReferralIfPending(referredUserId: string, orderId: string) {
    const pending =
      await referralRepository.findPendingReferralForUser(referredUserId);
    if (!pending) return null;

    const referralCode = await referralRepository.findCodeById(
      pending.referralCodeId,
    );
    const ownerEntitlement =
      await referralRepository.findActiveEntitlementForOwner(
        referralCode?.ownerUserId ?? "",
      );
    if (!ownerEntitlement) {
      // No active entitlement to credit - the referral stays PENDING and
      // can be rewarded later (e.g. via a scheduled reconciliation job)
      // once the referrer has an entitlement to receive credits into.
      return null;
    }

    const result = await referralRepository.rewardReferral(
      pending.id,
      orderId,
      REFERRAL_BONUS_CREDITS,
      ownerEntitlement.userId,
      ownerEntitlement.id,
    );

    if (result) {
      await notificationService.notify({
        userId: ownerEntitlement.userId,
        type: "GENERAL",
        title: "Referral reward earned",
        message: `You earned ${REFERRAL_BONUS_CREDITS} bonus credits from a successful referral!`,
        relatedEntityType: "Referral",
        relatedEntityId: pending.id,
      });
    }

    return result;
  },
};
