import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  CreateProcurementRequestInput,
  SubmitQuoteInput,
} from "@/server/validators/procurement";

export const procurementRepository = {
  findByIdempotencyKey(propertyId: string, idempotencyKey: string) {
    return prisma.procurementRequest.findUnique({
      where: { propertyId_idempotencyKey: { propertyId, idempotencyKey } },
    });
  },

  async findLockedBudgetPlanForOwner(propertyId: string, ownerId: string) {
    const plans = await prisma.$queryRaw<
      Array<{ id: string; status: string; lockedVersion: number | null }>
    >(Prisma.sql`
      SELECT "id", "status", "lockedVersion" FROM "BudgetPlan"
      WHERE "propertyId" = ${propertyId} AND "ownerId" = ${ownerId}
    `);
    const plan = plans[0];
    if (!plan || plan.status !== "LOCKED") return null;
    return plan;
  },

  create(
    propertyId: string,
    ownerId: string,
    input: CreateProcurementRequestInput,
  ) {
    return prisma.procurementRequest.create({
      data: {
        propertyId,
        ownerId,
        lockedBudgetPlanId: input.budgetPlanId,
        lockedBudgetVersion: input.lockedBudgetVersion,
        idempotencyKey: input.idempotencyKey,
      },
    });
  },

  findForOwner(procurementRequestId: string, ownerId: string) {
    return prisma.procurementRequest.findFirst({
      where: { id: procurementRequestId, ownerId },
      include: { quotes: true, orders: true },
    });
  },

  submitQuote(procurementRequestId: string, input: SubmitQuoteInput) {
    return prisma.quote.create({
      data: { procurementRequestId, ...input },
    });
  },

  findQuoteForOwner(
    procurementRequestId: string,
    quoteId: string,
    ownerId: string,
  ) {
    return prisma.quote.findFirst({
      where: {
        id: quoteId,
        procurementRequestId,
        procurementRequest: { ownerId },
      },
    });
  },

  findNegotiableQuoteForOwner(
    procurementRequestId: string,
    quoteId: string,
    ownerId: string,
  ) {
    return prisma.quote.findFirst({
      where: {
        id: quoteId,
        procurementRequestId,
        status: "SUBMITTED",
        procurementRequest: { ownerId },
      },
    });
  },

  recordNegotiation(
    quoteId: string,
    proposedAmountMinor: bigint,
    decision: "ACCEPTED" | "COUNTERED" | "REJECTED",
    counterAmountMinor: bigint | null,
  ) {
    return prisma.quoteNegotiation.create({
      data: { quoteId, proposedAmountMinor, decision, counterAmountMinor },
    });
  },

  applyAcceptedNegotiation(quoteId: string, newTotalAmountMinor: bigint) {
    return prisma.quote.update({
      where: { id: quoteId },
      data: { totalAmountMinor: newTotalAmountMinor },
    });
  },

  async acceptQuoteAndCreateOrder(
    procurementRequestId: string,
    quoteId: string,
    ownerId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.quote.updateMany({
        where: {
          id: quoteId,
          procurementRequestId,
          status: "SUBMITTED",
          procurementRequest: { ownerId },
        },
        data: { status: "ACCEPTED" },
      });
      if (updated.count === 0) return null;

      const quote = await tx.quote.findUniqueOrThrow({
        where: { id: quoteId },
      });

      await tx.procurementRequest.update({
        where: { id: procurementRequestId },
        data: { status: "ORDERED" },
      });

      return tx.order.create({
        data: {
          procurementRequestId,
          quoteId,
          totalAmountMinor: quote.totalAmountMinor,
          currency: quote.currency,
        },
      });
    });
  },

  findOrderForOwner(orderId: string, ownerId: string) {
    return prisma.order.findFirst({
      where: { id: orderId, procurementRequest: { ownerId } },
    });
  },

  updateOrderStatus(
    orderId: string,
    ownerId: string,
    currentStatus:
      | "PLACED"
      | "CONFIRMED"
      | "DISPATCHED"
      | "DELIVERED"
      | "CANCELLED",
    nextStatus:
      | "PLACED"
      | "CONFIRMED"
      | "DISPATCHED"
      | "DELIVERED"
      | "CANCELLED",
  ) {
    return prisma.order.updateMany({
      where: {
        id: orderId,
        status: currentStatus,
        procurementRequest: { ownerId },
      },
      data: {
        status: nextStatus,
        deliveredAt: nextStatus === "DELIVERED" ? new Date() : undefined,
      },
    });
  },

  scheduleExecution(orderId: string, scheduledDate: Date) {
    return prisma.executionRecord.create({
      data: { orderId, scheduledDate },
    });
  },

  findExecutionForOwner(executionId: string, ownerId: string) {
    return prisma.executionRecord.findFirst({
      where: { id: executionId, order: { procurementRequest: { ownerId } } },
    });
  },

  updateExecutionStatus(
    executionId: string,
    ownerId: string,
    status: string,
    snagNotes?: string,
  ) {
    return prisma.executionRecord.updateMany({
      where: {
        id: executionId,
        order: { procurementRequest: { ownerId } },
      },
      data: {
        status: status as never,
        snagNotes,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    });
  },
};
