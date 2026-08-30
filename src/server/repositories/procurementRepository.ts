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

  // Procurement can only begin from a LOCKED budget (README §26:
  // "APPROVED BUDGET" is the entry point). The real budget system
  // (BudgetPlan/BudgetVersion) is queried via raw SQL, matching the
  // convention already established in budgetRepository.ts - there is no
  // typed Prisma model for it, so this reads the same tables that system
  // itself writes to, rather than assuming a schema that doesn't exist.
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

  // A negotiation can only be proposed on a still-SUBMITTED quote - if the
  // quote was already accepted/rejected while the user was composing a
  // proposal, this returns null and the service surfaces a clear error
  // instead of silently negotiating on a decision that's already final.
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

  // An ACCEPTED negotiation updates the quote's own total to the agreed
  // amount - this is the number that flows into the Order when the quote
  // is later accepted through the normal acceptQuoteAndCreateOrder path,
  // so the negotiated price, not the original asking price, is what
  // actually gets ordered and paid.
  applyAcceptedNegotiation(quoteId: string, newTotalAmountMinor: bigint) {
    return prisma.quote.update({
      where: { id: quoteId },
      data: { totalAmountMinor: newTotalAmountMinor },
    });
  },

  // Accepting a quote and creating its order happen in one transaction:
  // only one quote per request may ever be ACCEPTED (enforced here by
  // requiring the quote to still be SUBMITTED, guarding against a
  // double-accept race the same way budget locking does), and the
  // resulting Order is created atomically with that acceptance so there is
  // never a moment where a quote is ACCEPTED with no corresponding order.
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

  updateOrderStatus(orderId: string, ownerId: string, status: string) {
    return prisma.order.updateMany({
      where: { id: orderId, procurementRequest: { ownerId } },
      data: {
        status: status as never,
        deliveredAt: status === "DELIVERED" ? new Date() : undefined,
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
      where: { id: executionId, order: { procurementRequest: { ownerId } } },
      data: {
        status: status as never,
        snagNotes,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    });
  },
};
