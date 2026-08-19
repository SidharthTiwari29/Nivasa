import { prisma } from '@/server/db/prisma';

export async function reserveEntitlement(input: {
  userId: string;
  entitlementCode: string;
  quantity: number;
  idempotencyKey: string;
}) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) throw new Error('INVALID_QUANTITY');
  return prisma.$transaction(async (tx) => {
    const existing = await tx.usageRecord.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;

    const grant = await tx.entitlementGrant.findFirst({
      where: { userId: input.userId, entitlementCode: input.entitlementCode, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });
    if (!grant) throw new Error('ENTITLEMENT_NOT_FOUND');

    const updated = await tx.entitlementGrant.updateMany({
      where: {
        id: grant.id,
        remaining: { gte: input.quantity },
        status: 'ACTIVE',
      },
      data: { remaining: { decrement: input.quantity }, reserved: { increment: input.quantity } },
    });
    if (updated.count !== 1) throw new Error('INSUFFICIENT_ENTITLEMENT_BALANCE');

    return tx.usageRecord.create({
      data: {
        userId: input.userId,
        entitlementGrantId: grant.id,
        entitlementCode: input.entitlementCode,
        quantity: input.quantity,
        status: 'RESERVED',
        idempotencyKey: input.idempotencyKey,
      },
    });
  });
}

export async function confirmEntitlement(idempotencyKey: string) {
  return prisma.$transaction(async (tx) => {
    const usage = await tx.usageRecord.findUnique({ where: { idempotencyKey } });
    if (!usage) throw new Error('RESERVATION_NOT_FOUND');
    if (usage.status === 'CONFIRMED') return usage;
    if (usage.status !== 'RESERVED' || !usage.entitlementGrantId) throw new Error('INVALID_RESERVATION_STATE');

    await tx.entitlementGrant.update({
      where: { id: usage.entitlementGrantId },
      data: { reserved: { decrement: usage.quantity }, consumed: { increment: usage.quantity } },
    });
    return tx.usageRecord.update({ where: { id: usage.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
  });
}

export async function releaseEntitlement(idempotencyKey: string) {
  return prisma.$transaction(async (tx) => {
    const usage = await tx.usageRecord.findUnique({ where: { idempotencyKey } });
    if (!usage) throw new Error('RESERVATION_NOT_FOUND');
    if (usage.status === 'RELEASED') return usage;
    if (usage.status !== 'RESERVED' || !usage.entitlementGrantId) throw new Error('INVALID_RESERVATION_STATE');

    await tx.entitlementGrant.update({
      where: { id: usage.entitlementGrantId },
      data: { reserved: { decrement: usage.quantity }, remaining: { increment: usage.quantity } },
    });
    return tx.usageRecord.update({ where: { id: usage.id }, data: { status: 'RELEASED', releasedAt: new Date() } });
  });
}
