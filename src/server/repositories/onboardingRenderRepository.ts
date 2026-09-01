import { prisma } from "@/server/db/prisma";

export const onboardingRenderRepository = {
  findForUser(userId: string) {
    return prisma.onboardingRenderGrant.findUnique({ where: { userId } });
  },

  // Idempotent: calling this repeatedly for the same user always returns
  // (or creates once) the same grant row - a user cannot accumulate
  // multiple free HD renders by triggering this path more than once.
  async ensureGrant(userId: string) {
    const existing = await prisma.onboardingRenderGrant.findUnique({
      where: { userId },
    });
    if (existing) return existing;
    return prisma.onboardingRenderGrant.create({ data: { userId } });
  },

  // The actual single-use guarantee: a conditional update (usedAt must
  // still be null) rather than a read-then-write, so two concurrent
  // render requests for the same user's grant can never both succeed -
  // the same pattern already used for quote acceptance, budget locking,
  // and supplier invite consumption throughout this codebase.
  async consumeGrant(userId: string, assetId: string) {
    const result = await prisma.onboardingRenderGrant.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date(), assetId },
    });
    return result.count > 0;
  },
};
