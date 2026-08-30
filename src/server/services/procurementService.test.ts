import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { procurementRepository } from "@/server/repositories/procurementRepository";
import { notificationService } from "@/server/services/notificationService";
import { procurementService } from "./procurementService";

vi.mock("@/server/services/notificationService", () => ({
  notificationService: {
    notify: vi.fn(),
  },
}));

vi.mock("@/server/repositories/procurementRepository", () => ({
  procurementRepository: {
    findByIdempotencyKey: vi.fn(),
    findLockedBudgetPlanForOwner: vi.fn(),
    create: vi.fn(),
    findForOwner: vi.fn(),
    submitQuote: vi.fn(),
    findQuoteForOwner: vi.fn(),
    findNegotiableQuoteForOwner: vi.fn(),
    recordNegotiation: vi.fn(),
    applyAcceptedNegotiation: vi.fn(),
    acceptQuoteAndCreateOrder: vi.fn(),
    findOrderForOwner: vi.fn(),
    updateOrderStatus: vi.fn(),
    scheduleExecution: vi.fn(),
    findExecutionForOwner: vi.fn(),
    updateExecutionStatus: vi.fn(),
  },
}));

const repo = vi.mocked(procurementRepository);
const notifications = vi.mocked(notificationService);

describe("procurementService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("create", () => {
    it("returns the existing request on a duplicate idempotency key without checking the budget", async () => {
      repo.findByIdempotencyKey.mockResolvedValue({ id: "req-1" } as never);

      const result = await procurementService.create("property-1", "user-1", {
        budgetPlanId: "00000000-0000-0000-0000-000000000001",
        lockedBudgetVersion: 1,
        idempotencyKey: "key-1",
      });

      expect(result).toEqual({ id: "req-1" });
      expect(repo.findLockedBudgetPlanForOwner).not.toHaveBeenCalled();
    });

    it("rejects procurement against a budget that is not locked", async () => {
      repo.findByIdempotencyKey.mockResolvedValue(null);
      repo.findLockedBudgetPlanForOwner.mockResolvedValue(null);

      await expect(
        procurementService.create("property-1", "user-1", {
          budgetPlanId: "00000000-0000-0000-0000-000000000001",
          lockedBudgetVersion: 1,
          idempotencyKey: "key-1",
        }),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("rejects procurement when the locked version does not match the requested version", async () => {
      repo.findByIdempotencyKey.mockResolvedValue(null);
      repo.findLockedBudgetPlanForOwner.mockResolvedValue({
        id: "plan-1",
        status: "LOCKED",
        lockedVersion: 2,
      } as never);

      await expect(
        procurementService.create("property-1", "user-1", {
          budgetPlanId: "00000000-0000-0000-0000-000000000001",
          lockedBudgetVersion: 1,
          idempotencyKey: "key-1",
        }),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("creates a request once the budget is confirmed locked at the requested version", async () => {
      repo.findByIdempotencyKey.mockResolvedValue(null);
      repo.findLockedBudgetPlanForOwner.mockResolvedValue({
        id: "plan-1",
        status: "LOCKED",
        lockedVersion: 1,
      } as never);
      repo.create.mockResolvedValue({ id: "req-1" } as never);

      const result = await procurementService.create("property-1", "user-1", {
        budgetPlanId: "00000000-0000-0000-0000-000000000001",
        lockedBudgetVersion: 1,
        idempotencyKey: "key-1",
      });

      expect(result).toEqual({ id: "req-1" });
    });
  });

  describe("acceptQuote", () => {
    it("rejects accepting a quote that does not exist", async () => {
      repo.acceptQuoteAndCreateOrder.mockResolvedValue(null);
      repo.findQuoteForOwner.mockResolvedValue(null);

      await expect(
        procurementService.acceptQuote("req-1", "quote-1", "user-1"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("rejects accepting a quote that was already accepted (double-accept race)", async () => {
      // This is the specific guarantee this whole feature exists to
      // provide: two concurrent accept requests for the same quote must
      // not both succeed and create two orders.
      repo.acceptQuoteAndCreateOrder.mockResolvedValue(null);
      repo.findQuoteForOwner.mockResolvedValue({
        id: "quote-1",
        status: "ACCEPTED",
      } as never);

      await expect(
        procurementService.acceptQuote("req-1", "quote-1", "user-1"),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("accepts a valid, still-pending quote and returns the created order", async () => {
      repo.acceptQuoteAndCreateOrder.mockResolvedValue({
        id: "order-1",
      } as never);

      const result = await procurementService.acceptQuote(
        "req-1",
        "quote-1",
        "user-1",
      );

      expect(result).toEqual({ id: "order-1" });
    });
  });

  describe("updateOrderStatus", () => {
    it("rejects updating an order the caller does not own", async () => {
      repo.updateOrderStatus.mockResolvedValue({ count: 0 });

      await expect(
        procurementService.updateOrderStatus("order-1", "user-1", "DELIVERED"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("updates an owned order's status", async () => {
      repo.updateOrderStatus.mockResolvedValue({ count: 1 });
      repo.findOrderForOwner.mockResolvedValue({
        id: "order-1",
        status: "DELIVERED",
      } as never);

      const result = await procurementService.updateOrderStatus(
        "order-1",
        "user-1",
        "DELIVERED",
      );

      expect(result).toEqual({ id: "order-1", status: "DELIVERED" });
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          type: "ORDER_STATUS_CHANGED",
        }),
      );
    });
  });

  describe("scheduleExecution", () => {
    it("rejects scheduling execution for an order the caller does not own", async () => {
      repo.findOrderForOwner.mockResolvedValue(null);

      await expect(
        procurementService.scheduleExecution("order-1", "user-1", new Date()),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.scheduleExecution).not.toHaveBeenCalled();
    });
  });

  describe("updateExecutionStatus", () => {
    it("rejects updating an execution record the caller does not own", async () => {
      repo.updateExecutionStatus.mockResolvedValue({ count: 0 });

      await expect(
        procurementService.updateExecutionStatus(
          "exec-1",
          "user-1",
          "COMPLETED",
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("proposeNegotiation", () => {
    const referenceQuote = {
      id: "quote-1",
      totalAmountMinor: 1_000_000n,
      nivasaCommissionBps: 1000,
      minMarginBps: 500,
    };

    it("rejects negotiating a quote that does not exist", async () => {
      repo.findNegotiableQuoteForOwner.mockResolvedValue(null);
      repo.findQuoteForOwner.mockResolvedValue(null);

      await expect(
        procurementService.proposeNegotiation(
          "req-1",
          "quote-1",
          "user-1",
          900_000n,
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.recordNegotiation).not.toHaveBeenCalled();
    });

    it("rejects negotiating a quote that is no longer open (already accepted/rejected)", async () => {
      repo.findNegotiableQuoteForOwner.mockResolvedValue(null);
      repo.findQuoteForOwner.mockResolvedValue({
        id: "quote-1",
        status: "ACCEPTED",
      } as never);

      await expect(
        procurementService.proposeNegotiation(
          "req-1",
          "quote-1",
          "user-1",
          900_000n,
        ),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(repo.recordNegotiation).not.toHaveBeenCalled();
    });

    it("accepts a proposal at the margin floor and updates the quote's real total", async () => {
      repo.findNegotiableQuoteForOwner.mockResolvedValue(
        referenceQuote as never,
      );

      const result = await procurementService.proposeNegotiation(
        "req-1",
        "quote-1",
        "user-1",
        950_000n,
      );

      expect(result.decision).toBe("ACCEPTED");
      expect(repo.applyAcceptedNegotiation).toHaveBeenCalledWith(
        "quote-1",
        950_000n,
      );
      expect(repo.recordNegotiation).toHaveBeenCalledWith(
        "quote-1",
        950_000n,
        "ACCEPTED",
        null,
      );
    });

    it("counters a below-floor proposal without touching the quote's real total", async () => {
      repo.findNegotiableQuoteForOwner.mockResolvedValue(
        referenceQuote as never,
      );

      const result = await procurementService.proposeNegotiation(
        "req-1",
        "quote-1",
        "user-1",
        900_000n,
      );

      expect(result.decision).toBe("COUNTERED");
      expect(result.counterAmountMinor).toBe(950_000n);
      expect(repo.applyAcceptedNegotiation).not.toHaveBeenCalled();
    });
  });
});
