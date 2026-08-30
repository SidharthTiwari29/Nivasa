import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { referralRepository } from "@/server/repositories/referralRepository";
import { notificationService } from "@/server/services/notificationService";
import { referralService } from "./referralService";

vi.mock("@/server/repositories/referralRepository", () => ({
  referralRepository: {
    findCodeByOwner: vi.fn(),
    findCodeByValue: vi.fn(),
    findCodeById: vi.fn(),
    createCode: vi.fn(),
    createReferral: vi.fn(),
    findPendingReferralForUser: vi.fn(),
    rewardReferral: vi.fn(),
    findActiveEntitlementForOwner: vi.fn(),
  },
}));
vi.mock("@/server/services/notificationService", () => ({
  notificationService: { notify: vi.fn() },
}));

const repo = vi.mocked(referralRepository);
const notifications = vi.mocked(notificationService);

describe("referralService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getOrCreateMyCode", () => {
    it("returns the existing code without creating a new one", async () => {
      repo.findCodeByOwner.mockResolvedValue({ code: "ABC123" } as never);

      const result = await referralService.getOrCreateMyCode("user-1");

      expect(result).toEqual({ code: "ABC123" });
      expect(repo.createCode).not.toHaveBeenCalled();
    });

    it("creates a new code when none exists", async () => {
      repo.findCodeByOwner.mockResolvedValue(null);
      repo.createCode.mockResolvedValue({ code: "XYZ999" } as never);

      const result = await referralService.getOrCreateMyCode("user-1");

      expect(result).toEqual({ code: "XYZ999" });
    });
  });

  describe("applyReferralCode", () => {
    it("rejects a code that does not exist", async () => {
      repo.findCodeByValue.mockResolvedValue(null);

      await expect(
        referralService.applyReferralCode("user-2", "NOPE"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("rejects self-referral", async () => {
      repo.findCodeByValue.mockResolvedValue({
        id: "code-1",
        ownerUserId: "user-1",
      } as never);

      await expect(
        referralService.applyReferralCode("user-1", "ABC123"),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(repo.createReferral).not.toHaveBeenCalled();
    });

    it("creates a referral for a valid, non-self code", async () => {
      repo.findCodeByValue.mockResolvedValue({
        id: "code-1",
        ownerUserId: "user-1",
      } as never);
      repo.createReferral.mockResolvedValue({ id: "referral-1" } as never);

      const result = await referralService.applyReferralCode(
        "user-2",
        "ABC123",
      );

      expect(result).toEqual({ id: "referral-1" });
      expect(repo.createReferral).toHaveBeenCalledWith("code-1", "user-2");
    });
  });

  describe("rewardReferralIfPending", () => {
    it("does nothing when there is no pending referral for this user", async () => {
      repo.findPendingReferralForUser.mockResolvedValue(null);

      const result = await referralService.rewardReferralIfPending(
        "user-2",
        "order-1",
      );

      expect(result).toBeNull();
      expect(repo.rewardReferral).not.toHaveBeenCalled();
    });

    it("does not reward when the referrer has no active entitlement to credit", async () => {
      repo.findPendingReferralForUser.mockResolvedValue({
        id: "referral-1",
        referralCodeId: "code-1",
      } as never);
      repo.findCodeById.mockResolvedValue({
        id: "code-1",
        ownerUserId: "user-1",
      } as never);
      repo.findActiveEntitlementForOwner.mockResolvedValue(null);

      const result = await referralService.rewardReferralIfPending(
        "user-2",
        "order-1",
      );

      expect(result).toBeNull();
      expect(repo.rewardReferral).not.toHaveBeenCalled();
    });

    it("rewards the referrer with bonus credits and notifies them", async () => {
      repo.findPendingReferralForUser.mockResolvedValue({
        id: "referral-1",
        referralCodeId: "code-1",
      } as never);
      repo.findCodeById.mockResolvedValue({
        id: "code-1",
        ownerUserId: "user-1",
      } as never);
      repo.findActiveEntitlementForOwner.mockResolvedValue({
        id: "entitlement-1",
        userId: "user-1",
      } as never);
      repo.rewardReferral.mockResolvedValue({ id: "referral-1" } as never);

      const result = await referralService.rewardReferralIfPending(
        "user-2",
        "order-1",
      );

      expect(result).toEqual({ id: "referral-1" });
      expect(repo.rewardReferral).toHaveBeenCalledWith(
        "referral-1",
        "order-1",
        20,
        "user-1",
        "entitlement-1",
      );
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1" }),
      );
    });

    it("does not send a notification when the repository reports the referral was already rewarded (race)", async () => {
      repo.findPendingReferralForUser.mockResolvedValue({
        id: "referral-1",
        referralCodeId: "code-1",
      } as never);
      repo.findCodeById.mockResolvedValue({
        id: "code-1",
        ownerUserId: "user-1",
      } as never);
      repo.findActiveEntitlementForOwner.mockResolvedValue({
        id: "entitlement-1",
        userId: "user-1",
      } as never);
      repo.rewardReferral.mockResolvedValue(null);

      await referralService.rewardReferralIfPending("user-2", "order-1");

      expect(notifications.notify).not.toHaveBeenCalled();
    });
  });
});
