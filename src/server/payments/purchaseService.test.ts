import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { activatePaidPurchase } from "./purchaseService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    package: { findFirst: vi.fn() },
    purchase: { create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("./packages", () => ({
  ensureCommercialPackages: vi.fn(),
}));

vi.mock("./provider", () => ({
  getPaymentProvider: vi.fn(),
}));

const transaction = vi.mocked(prisma.$transaction);

describe("activatePaidPurchase", () => {
  beforeEach(() => vi.clearAllMocks());

  it("activates a captured purchase atomically and grants its entitlement", async () => {
    const purchase = {
      id: "purchase-1",
      userId: "user-1",
      packageId: "package-1",
      status: "PENDING",
      package: { credits: 100 },
      payment: { status: "PENDING", providerPaymentId: null },
    };
    const tx = {
      purchase: {
        findUnique: vi.fn().mockResolvedValue(purchase),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          ...purchase,
          status: "PAID",
        }),
      },
      payment: { update: vi.fn().mockResolvedValue({}) },
      entitlement: { upsert: vi.fn().mockResolvedValue({}) },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
    };
    transaction.mockImplementation(async (callback) => callback(tx as never));

    await expect(
      activatePaidPurchase({
        providerOrderId: "order-1",
        providerPaymentId: "payment-1",
        signature: "sig-1",
        rawEventHash: "hash-1",
      }),
    ).resolves.toMatchObject({ id: "purchase-1", status: "PAID" });

    expect(tx.purchase.updateMany).toHaveBeenCalledWith({
      where: { id: "purchase-1", status: { not: "PAID" } },
      data: { status: "PAID" },
    });
    expect(tx.payment.update).toHaveBeenCalledWith({
      where: { purchaseId: "purchase-1" },
      data: {
        status: "CAPTURED",
        providerPaymentId: "payment-1",
        signature: "sig-1",
        rawEventHash: "hash-1",
      },
    });
    expect(tx.entitlement.upsert).toHaveBeenCalledTimes(1);
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
  });

  it("does not duplicate an already-captured payment", async () => {
    const purchase = {
      id: "purchase-1",
      status: "PAID",
      payment: { status: "CAPTURED", providerPaymentId: "payment-1" },
    };
    const tx = {
      purchase: { findUnique: vi.fn().mockResolvedValue(purchase) },
      payment: { update: vi.fn() },
      entitlement: { upsert: vi.fn() },
      auditLog: { create: vi.fn() },
    };
    transaction.mockImplementation(async (callback) => callback(tx as never));

    await expect(
      activatePaidPurchase({
        providerOrderId: "order-1",
        providerPaymentId: "payment-1",
        rawEventHash: "hash-1",
      }),
    ).resolves.toEqual(purchase);

    expect(tx.payment.update).not.toHaveBeenCalled();
    expect(tx.entitlement.upsert).not.toHaveBeenCalled();
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });
});
