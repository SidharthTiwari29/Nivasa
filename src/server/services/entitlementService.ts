import { prisma } from "@/server/db/prisma";

export async function reserveCredits(userId: string, credits: number, idempotencyKey: string) {
  if (!Number.isInteger(credits) || credits <= 0) throw new Error("INVALID_CREDITS");
  const existing = await prisma.entitlement.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } } });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const entitlements = await tx.entitlement.findMany({ where: { userId, status: "ACTIVE" }, orderBy: { createdAt: "asc" } });
    const entitlement = entitlements.find((e) => e.creditsTotal - e.creditsReserved - e.creditsConsumed >= credits);
    if (!entitlement) throw new Error("INSUFFICIENT_CREDITS");
    const updated = await tx.entitlement.updateMany({ where: { id: entitlement.id, status: "ACTIVE", creditsReserved: entitlement.creditsReserved, creditsConsumed: entitlement.creditsConsumed }, data: { creditsReserved: { increment: credits } } });
    if (updated.count !== 1) throw new Error("CONCURRENT_RESERVATION_CONFLICT");
    return tx.entitlement.findUniqueOrThrow({ where: { id: entitlement.id } });
  });
}

export async function confirmCredits(entitlementId: string, credits: number) {
  if (!Number.isInteger(credits) || credits <= 0) throw new Error("INVALID_CREDITS");
  return prisma.$transaction(async (tx) => {
    const e = await tx.entitlement.findUniqueOrThrow({ where: { id: entitlementId } });
    if (e.creditsReserved < credits) throw new Error("INVALID_RESERVATION");
    const remaining = e.creditsTotal - e.creditsConsumed - credits;
    return tx.entitlement.update({ where: { id: entitlementId }, data: { creditsReserved: { decrement: credits }, creditsConsumed: { increment: credits }, status: remaining === 0 ? "CONSUMED" : "ACTIVE" } });
  });
}

export async function releaseCredits(entitlementId: string, credits: number) {
  if (!Number.isInteger(credits) || credits <= 0) throw new Error("INVALID_CREDITS");
  return prisma.$transaction(async (tx) => {
    const e = await tx.entitlement.findUniqueOrThrow({ where: { id: entitlementId } });
    if (e.creditsReserved < credits) throw new Error("INVALID_RESERVATION");
    return tx.entitlement.update({ where: { id: entitlementId }, data: { creditsReserved: { decrement: credits }, status: "ACTIVE" } });
  });
}
