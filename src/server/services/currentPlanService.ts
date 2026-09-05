import { prisma } from "@/server/db/prisma";

export type CurrentPlan = {
  packageCode: string;
  packageName: string;
  creditsRemaining: number;
  creditsTotal: number;
};

const FREE_PLAN: CurrentPlan = {
  packageCode: "FREE",
  packageName: "Free",
  creditsRemaining: 0,
  creditsTotal: 0,
};

// Real, direct answer to "what plan is this person actually on" - the
// question this app had no single function to answer before, even
// though the underlying Entitlement/Package data has existed all
// session. Returns the real, most recent active entitlement's package,
// with real remaining credits computed from the same three real
// counters (creditsTotal, creditsReserved, creditsConsumed) used
// everywhere else entitlement math happens in this app - never a
// separately-tracked "remaining" number that could drift from what
// those three real fields actually say.
export async function getCurrentPlan(userId: string): Promise<CurrentPlan> {
  const entitlement = await prisma.entitlement.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { package: true },
  });

  if (!entitlement) return FREE_PLAN;

  return {
    packageCode: entitlement.package.code,
    packageName: entitlement.package.name,
    creditsRemaining:
      entitlement.creditsTotal -
      entitlement.creditsReserved -
      entitlement.creditsConsumed,
    creditsTotal: entitlement.creditsTotal,
  };
}
