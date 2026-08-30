import { ForbiddenError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import {
  anyPlanIncludesFeature,
  type FeatureKey,
} from "@/server/entitlements/featureGating";

export const featureAccessService = {
  async hasFeature(userId: string, feature: FeatureKey): Promise<boolean> {
    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { package: { select: { code: true } } },
    });
    return anyPlanIncludesFeature(
      entitlements.map((e) => e.package.code),
      feature,
    );
  },

  // Throws rather than returning a boolean when used as a route guard, so
  // a missing check-then-enforce gap (checking the boolean but forgetting
  // to act on a false result) can't silently happen at a call site - the
  // same "fail loudly, not silently" discipline as requireAuth/requireAdmin.
  async requireFeature(userId: string, feature: FeatureKey): Promise<void> {
    const allowed = await this.hasFeature(userId, feature);
    if (!allowed) {
      throw new ForbiddenError(
        `Your current plan does not include this feature: ${feature}`,
      );
    }
  },
};
