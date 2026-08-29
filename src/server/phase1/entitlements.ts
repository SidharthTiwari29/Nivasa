export type EntitlementState = "RESERVED" | "ACTIVE" | "CONSUMED" | "RELEASED" | "EXPIRED";

export type EntitlementRecord = {
  id: string;
  userId: string;
  packageId: string;
  creditsTotal: number;
  creditsReserved: number;
  creditsConsumed: number;
  status: EntitlementState;
  expiresAt?: Date;
};

export function availableCredits(entitlement: EntitlementRecord, now = new Date()): number {
  if (entitlement.status === "EXPIRED" || (entitlement.expiresAt && entitlement.expiresAt <= now)) return 0;
  return Math.max(0, entitlement.creditsTotal - entitlement.creditsReserved - entitlement.creditsConsumed);
}

export function canReserve(entitlement: EntitlementRecord, credits: number, now = new Date()): boolean {
  return Number.isInteger(credits) && credits > 0 && entitlement.status === "ACTIVE" && availableCredits(entitlement, now) >= credits;
}

export function reserve(entitlement: EntitlementRecord, credits: number, now = new Date()): EntitlementRecord {
  if (!canReserve(entitlement, credits, now)) throw new Error("INSUFFICIENT_OR_INACTIVE_ENTITLEMENT");
  return { ...entitlement, creditsReserved: entitlement.creditsReserved + credits };
}

export function consume(entitlement: EntitlementRecord, credits: number): EntitlementRecord {
  if (!Number.isInteger(credits) || credits <= 0 || entitlement.creditsReserved < credits) {
    throw new Error("INVALID_ENTITLEMENT_CONSUMPTION");
  }
  const next = {
    ...entitlement,
    creditsReserved: entitlement.creditsReserved - credits,
    creditsConsumed: entitlement.creditsConsumed + credits,
  };
  return { ...next, status: next.creditsConsumed >= next.creditsTotal ? "CONSUMED" : "ACTIVE" };
}

export function release(entitlement: EntitlementRecord, credits: number): EntitlementRecord {
  if (!Number.isInteger(credits) || credits <= 0 || entitlement.creditsReserved < credits) {
    throw new Error("INVALID_ENTITLEMENT_RELEASE");
  }
  return { ...entitlement, creditsReserved: entitlement.creditsReserved - credits };
}
