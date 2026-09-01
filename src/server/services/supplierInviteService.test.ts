import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { supplierInviteRepository } from "@/server/repositories/supplierInviteRepository";
import { notificationService } from "@/server/services/notificationService";
import { supplierInviteService } from "./supplierInviteService";

vi.mock("@/server/repositories/supplierInviteRepository", () => ({
  supplierInviteRepository: {
    findProcurementRequestForOwner: vi.fn(),
    create: vi.fn(),
    findByTokenHash: vi.fn(),
    markUsedAndSubmitQuote: vi.fn(),
  },
}));
vi.mock("@/server/services/notificationService", () => ({
  notificationService: { notify: vi.fn() },
}));

const repo = vi.mocked(supplierInviteRepository);
const notifications = vi.mocked(notificationService);

describe("supplierInviteService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createInvite", () => {
    it("rejects creating an invite for a procurement request the caller does not own", async () => {
      repo.findProcurementRequestForOwner.mockResolvedValue(null);

      await expect(
        supplierInviteService.createInvite("req-1", "user-1", "Acme Supplies"),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("returns a real token exactly once, at creation time", async () => {
      repo.findProcurementRequestForOwner.mockResolvedValue({
        id: "req-1",
      } as never);
      repo.create.mockResolvedValue({ id: "invite-1" } as never);

      const result = await supplierInviteService.createInvite(
        "req-1",
        "user-1",
        "Acme Supplies",
      );

      expect(result.token).toMatch(/^[0-9a-f]{64}$/);
      expect(result.inviteId).toBe("invite-1");
      // The repository is only ever given the HASH, never the raw token.
      const createCall = repo.create.mock.calls[0];
      expect(createCall[2]).not.toBe(result.token);
    });
  });

  describe("getInviteContext", () => {
    it("rejects a token that does not match any invite", async () => {
      repo.findByTokenHash.mockResolvedValue(null);

      await expect(
        supplierInviteService.getInviteContext("nonexistent-token"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("rejects an already-used invite", async () => {
      repo.findByTokenHash.mockResolvedValue({
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 86_400_000),
      } as never);

      await expect(
        supplierInviteService.getInviteContext("some-token"),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("rejects an expired invite even if never used", async () => {
      repo.findByTokenHash.mockResolvedValue({
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      } as never);

      await expect(
        supplierInviteService.getInviteContext("some-token"),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("returns only the minimum context - never the owner's identity or other data", async () => {
      repo.findByTokenHash.mockResolvedValue({
        usedAt: null,
        expiresAt: new Date(Date.now() + 86_400_000),
        supplierName: "Acme Supplies",
        procurementRequest: {
          property: { name: "2BHK Koramangala", address: "123 Main St" },
        },
      } as never);

      const context =
        await supplierInviteService.getInviteContext("valid-token");

      expect(context).toEqual({
        supplierName: "Acme Supplies",
        propertyName: "2BHK Koramangala",
        propertyAddress: "123 Main St",
      });
      // No ownerId, no userId, no budget figures anywhere in the response.
      expect(context).not.toHaveProperty("ownerId");
    });
  });

  describe("submitQuoteViaInvite", () => {
    it("rejects submission for a nonexistent token", async () => {
      repo.findByTokenHash.mockResolvedValue(null);

      await expect(
        supplierInviteService.submitQuoteViaInvite(
          "bad-token",
          100_000n,
          undefined,
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.markUsedAndSubmitQuote).not.toHaveBeenCalled();
    });

    it("rejects submission for an already-used invite before even attempting the write", async () => {
      repo.findByTokenHash.mockResolvedValue({
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 86_400_000),
      } as never);

      await expect(
        supplierInviteService.submitQuoteViaInvite(
          "used-token",
          100_000n,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(repo.markUsedAndSubmitQuote).not.toHaveBeenCalled();
    });

    it("rejects submission for an expired invite", async () => {
      repo.findByTokenHash.mockResolvedValue({
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      } as never);

      await expect(
        supplierInviteService.submitQuoteViaInvite(
          "expired-token",
          100_000n,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("rejects when a concurrent request already consumed the token between the check and the write (race)", async () => {
      repo.findByTokenHash.mockResolvedValue({
        id: "invite-1",
        usedAt: null,
        expiresAt: new Date(Date.now() + 86_400_000),
        supplierName: "Acme Supplies",
        procurementRequestId: "req-1",
        createdByUserId: "user-1",
      } as never);
      repo.markUsedAndSubmitQuote.mockResolvedValue(null);

      await expect(
        supplierInviteService.submitQuoteViaInvite(
          "valid-token",
          100_000n,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(notifications.notify).not.toHaveBeenCalled();
    });

    it("submits the quote and notifies the procurement request owner on success", async () => {
      repo.findByTokenHash.mockResolvedValue({
        id: "invite-1",
        usedAt: null,
        expiresAt: new Date(Date.now() + 86_400_000),
        supplierName: "Acme Supplies",
        procurementRequestId: "req-1",
        createdByUserId: "user-1",
      } as never);
      repo.markUsedAndSubmitQuote.mockResolvedValue({
        id: "quote-1",
      } as never);

      const quote = await supplierInviteService.submitQuoteViaInvite(
        "valid-token",
        100_000n,
        "Delivery in 2 weeks",
      );

      expect(quote).toEqual({ id: "quote-1" });
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", type: "QUOTE_RECEIVED" }),
      );
    });
  });
});
