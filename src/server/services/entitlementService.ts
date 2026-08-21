import { prisma } from "@/server/db/prisma";

export async function reserveCredits(userId: string, credits: number, idempotencyKey: string) {
  if (!Number.isInteger(credits) || credits <= 0) throw new Error("INVALID_CREDITS");
  const existing = await prisma.entitlement.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } } });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const entitlement = await tx.entitlement.findFirst({ where: { userId, status: "ACTIVE", creditsReserved: { lt: credits }, creditsConsumed: { lt: creditsTotalField() } }, orderBy: { createdAt: "asc" } });
    if (!entitlement) throw new Error("INSUFFICIENT_CREDITS");
    const available = entitlement.creditsTotal - entitlement.creditsReserved - entitlement.creditsConsumed;
    if (available < credits) throw new Error("INSUFFICIENT_CREDITS");
    const updated = await tx.entitlement.updateMany({ where: { id: entitlement.id, status: "ACTIVE", creditsReserved: entitlement.creditsReserved, creditsConsumed: entitlement.creditsConsumed }, data: { creditsReserved: { increment: credits } } });
    if (updated.count !== 1) throw new Error("CONCURRENT_RESERVATION_CONFLICT");
    return tx.entitlement.update({ where: { id: entitlement.id }, data: {} });
  });
}

function creditsTotalField(): number { return Number.MAX_SAFE_INTEGER; }

export async function confirmCredits(entitlementId: string, credits: number) {
  if (!Number.isInteger(credits) || credits <= 0) throw new Error("INVALID_CREDITS");
  return prisma.$transaction(async (tx) => {
    const e = await tx.entitlement.findUniqueOrThrow({ where: { id: entitlementId } });
    if (e.creditsReserved < credits) throw new Error("INVALID_RESERVATION");
    return tx.entitlement.update({ where: { id: entitlementId }, data: { creditsReserved: { decrement: credits }, creditsConsumed: { increment: credits }, status: "CONSUMED" } });
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
