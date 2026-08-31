import { onboardingRenderRepository } from "@/server/repositories/onboardingRenderRepository";

export const onboardingRenderService = {
  // Called once, typically at account creation - creates the grant row so
  // it exists to be checked against later. Idempotent, so calling it
  // again for an existing user is a harmless no-op, not an error.
  grantOnSignup(userId: string) {
    return onboardingRenderRepository.ensureGrant(userId);
  },

  async hasUnusedGrant(userId: string): Promise<boolean> {
    const grant = await onboardingRenderRepository.findForUser(userId);
    return grant !== null && grant.usedAt === null;
  },

  // Returns whether the consumption actually succeeded - a false result
  // means a concurrent request already consumed this exact grant, and the
  // caller should NOT treat this render as free (it should fall back to
  // the normal STANDARD/HD decision, not silently grant a second free HD
  // render).
  consumeGrant(userId: string, assetId: string): Promise<boolean> {
    return onboardingRenderRepository.consumeGrant(userId, assetId);
  },
};
