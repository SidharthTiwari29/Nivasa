import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { procurementRepository } from "@/server/repositories/procurementRepository";
import { notificationService } from "@/server/services/notificationService";
import { evaluateNegotiation } from "@/server/services/negotiationEngine";
import type {
  CreateProcurementRequestInput,
  SubmitQuoteInput,
} from "@/server/validators/procurement";

export const procurementService = {
  async create(
    propertyId: string,
    ownerId: string,
    input: CreateProcurementRequestInput,
  ) {
    const existing = await procurementRepository.findByIdempotencyKey(
      propertyId,
      input.idempotencyKey,
    );
    if (existing) return existing;

    const budgetPlan = await procurementRepository.findLockedBudgetPlanForOwner(
      propertyId,
      ownerId,
    );
    if (!budgetPlan || budgetPlan.lockedVersion !== input.lockedBudgetVersion) {
      throw new ConflictError(
        "Procurement can only be started from the property's currently locked budget version",
      );
    }

    return procurementRepository.create(propertyId, ownerId, input);
  },

  async get(procurementRequestId: string, ownerId: string) {
    const request = await procurementRepository.findForOwner(
      procurementRequestId,
      ownerId,
    );
    if (!request) throw new NotFoundError("ProcurementRequest");
    return request;
  },

  async submitQuote(
    procurementRequestId: string,
    ownerId: string,
    input: SubmitQuoteInput,
  ) {
    const request = await procurementRepository.findForOwner(
      procurementRequestId,
      ownerId,
    );
    if (!request) throw new NotFoundError("ProcurementRequest");
    const quote = await procurementRepository.submitQuote(
      procurementRequestId,
      input,
    );
    await notificationService.notify({
      userId: ownerId,
      type: "QUOTE_RECEIVED",
      title: "New quote received",
      message: `${input.supplierName} submitted a quote for your procurement request`,
      relatedEntityType: "ProcurementRequest",
      relatedEntityId: procurementRequestId,
    });
    return quote;
  },

  // README §26 "QUOTE COMPARISON → ORDER": accepting a quote is the one
  // action in this whole workflow that must be exactly-once - accepting
  // two different quotes for the same request would mean placing two
  // orders for the same procurement need. The repository's conditional
  // update (status must still be SUBMITTED) is what actually enforces
  // this; a null return here means either the quote doesn't exist/isn't
  // owned, or it was already accepted/rejected by a concurrent request.
  async acceptQuote(
    procurementRequestId: string,
    quoteId: string,
    ownerId: string,
  ) {
    const order = await procurementRepository.acceptQuoteAndCreateOrder(
      procurementRequestId,
      quoteId,
      ownerId,
    );
    if (!order) {
      const quote = await procurementRepository.findQuoteForOwner(
        procurementRequestId,
        quoteId,
        ownerId,
      );
      if (!quote) throw new NotFoundError("Quote");
      throw new ConflictError(
        "Quote has already been accepted, rejected, or expired",
      );
    }
    return order;
  },

  async updateOrderStatus(orderId: string, ownerId: string, status: string) {
    const result = await procurementRepository.updateOrderStatus(
      orderId,
      ownerId,
      status,
    );
    if (result.count === 0) throw new NotFoundError("Order");
    const order = await procurementRepository.findOrderForOwner(
      orderId,
      ownerId,
    );
    await notificationService.notify({
      userId: ownerId,
      type: "ORDER_STATUS_CHANGED",
      title: "Order status updated",
      message: `Your order is now ${status.toLowerCase()}`,
      relatedEntityType: "Order",
      relatedEntityId: orderId,
    });
    return order;
  },

  async scheduleExecution(
    orderId: string,
    ownerId: string,
    scheduledDate: Date,
  ) {
    const order = await procurementRepository.findOrderForOwner(
      orderId,
      ownerId,
    );
    if (!order) throw new NotFoundError("Order");
    return procurementRepository.scheduleExecution(orderId, scheduledDate);
  },

  async updateExecutionStatus(
    executionId: string,
    ownerId: string,
    status: string,
    snagNotes?: string,
  ) {
    const result = await procurementRepository.updateExecutionStatus(
      executionId,
      ownerId,
      status,
      snagNotes,
    );
    if (result.count === 0) throw new NotFoundError("ExecutionRecord");
    const execution = await procurementRepository.findExecutionForOwner(
      executionId,
      ownerId,
    );
    // SNAGGED gets its own, more attention-grabbing message than a routine
    // status update - a snag genuinely needs the user's attention (a
    // problem was found on site), whereas most transitions are informational.
    await notificationService.notify({
      userId: ownerId,
      type: "EXECUTION_STATUS_CHANGED",
      title:
        status === "SNAGGED"
          ? "Issue found during execution"
          : "Execution update",
      message:
        status === "SNAGGED"
          ? (snagNotes ??
            "An issue was found during execution and needs your attention")
          : `Execution is now ${status.toLowerCase()}`,
      relatedEntityType: "ExecutionRecord",
      relatedEntityId: executionId,
    });
    return execution;
  },

  // The "bargain" feature: a user proposes a lower price on a submitted
  // quote; evaluateNegotiation decides ACCEPTED/COUNTERED/REJECTED against
  // the quote's own fixed commission/margin floor (set once, at quote
  // submission, never renegotiated). An ACCEPTED result immediately
  // updates the quote's real total, so the negotiated price is what
  // actually gets ordered later - this isn't a cosmetic discount display,
  // it changes the number the business is bound to.
  async proposeNegotiation(
    procurementRequestId: string,
    quoteId: string,
    ownerId: string,
    proposedAmountMinor: bigint,
  ) {
    const quote = await procurementRepository.findNegotiableQuoteForOwner(
      procurementRequestId,
      quoteId,
      ownerId,
    );
    if (!quote) {
      const exists = await procurementRepository.findQuoteForOwner(
        procurementRequestId,
        quoteId,
        ownerId,
      );
      if (!exists) throw new NotFoundError("Quote");
      throw new ConflictError("This quote is no longer open for negotiation");
    }

    const result = evaluateNegotiation(quote, proposedAmountMinor);

    await procurementRepository.recordNegotiation(
      quoteId,
      proposedAmountMinor,
      result.decision,
      result.counterAmountMinor,
    );

    if (result.decision === "ACCEPTED") {
      await procurementRepository.applyAcceptedNegotiation(
        quoteId,
        proposedAmountMinor,
      );
    }

    return result;
  },
};
