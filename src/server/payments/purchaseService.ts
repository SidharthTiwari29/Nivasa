import { prisma } from "@/server/db/prisma";
import { ensureCommercialPackages } from "./packages";
import { getPaymentProvider } from "./provider";

export async function createPurchase(userId: string, packageCode: string) {
  await ensureCommercialPackages();
  const pkg = await prisma.package.findFirst({
    where: { code: packageCode, active: true },
  });
  if (!pkg) throw new Error("PACKAGE_NOT_FOUND");
  const purchase = await prisma.purchase.create({
    data: {
      userId,
      packageId: pkg.id,
      amountMinor: pkg.priceMinor,
      currency: pkg.currency,
      provider: "razorpay",
      payment: {
        create: {
          id: `payment_${crypto.randomUUID()}`,
          amountMinor: pkg.priceMinor,
          currency: pkg.currency,
        },
      },
    },
  });
  try {
    const order = await getPaymentProvider().createOrder({
      amountMinor: pkg.priceMinor,
      currency: pkg.currency,
      receipt: purchase.id,
    });
    return prisma.purchase.update({
      where: { id: purchase.id },
      data: { providerOrderId: order.id },
      include: { package: true, payment: true },
    });
  } catch (error) {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

export async function activatePaidPurchase(input: {
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
  rawEventHash: string;
}) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { providerOrderId: input.providerOrderId },
      include: { package: true, payment: true },
    });
    if (!purchase) throw new Error("PURCHASE_NOT_FOUND");
    if (
      purchase.status === "PAID" &&
      purchase.payment?.providerPaymentId === input.providerPaymentId
    )
      return purchase;
    if (purchase.payment?.status === "CAPTURED") return purchase;
    const updated = await tx.purchase.updateMany({
      where: { id: purchase.id, status: { not: "PAID" } },
      data: { status: "PAID" },
    });
    if (updated.count === 0) return purchase;
    await tx.payment.update({
      where: { purchaseId: purchase.id },
      data: {
        status: "CAPTURED",
        providerPaymentId: input.providerPaymentId,
        signature: input.signature,
        rawEventHash: input.rawEventHash,
      },
    });
    const key = `purchase:${purchase.id}`;
    await tx.entitlement.upsert({
      where: {
        userId_idempotencyKey: { userId: purchase.userId, idempotencyKey: key },
      },
      create: {
        userId: purchase.userId,
        purchaseId: purchase.id,
        packageId: purchase.packageId,
        creditsTotal: purchase.package.credits,
        idempotencyKey: key,
      },
      update: {},
    });
    await tx.auditLog.create({
      data: {
        userId: purchase.userId,
        action: "PURCHASE_ACTIVATED",
        entity: "Purchase",
        entityId: purchase.id,
        metadata: { providerPaymentId: input.providerPaymentId },
      },
    });
    return tx.purchase.findUniqueOrThrow({
      where: { id: purchase.id },
      include: { package: true, payment: true, entitlements: true },
    });
  });
}
