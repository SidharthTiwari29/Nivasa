import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { notificationRepository } from "@/server/repositories/notificationRepository";
import { notificationService } from "./notificationService";

vi.mock("@/server/repositories/notificationRepository", () => ({
  notificationRepository: {
    create: vi.fn(),
    listForUser: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  },
}));

const repository = vi.mocked(notificationRepository);

describe("notificationService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("notify", () => {
    it("swallows repository errors rather than throwing, since a notification is a side effect", async () => {
      repository.create.mockRejectedValue(new Error("db unavailable"));

      await expect(
        notificationService.notify({
          userId: "user-1",
          type: "GENERAL",
          title: "Test",
          message: "Test message",
        }),
      ).resolves.toBeUndefined();
    });

    it("creates a notification when the repository succeeds", async () => {
      repository.create.mockResolvedValue({ id: "notif-1" } as never);

      await notificationService.notify({
        userId: "user-1",
        type: "GENERAL",
        title: "Test",
        message: "Test message",
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1" }),
      );
    });
  });

  describe("markRead", () => {
    it("rejects marking a notification the caller does not own as read", async () => {
      repository.markRead.mockResolvedValue({ count: 0 });

      await expect(
        notificationService.markRead("notif-1", "user-1"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("marks an owned notification as read", async () => {
      repository.markRead.mockResolvedValue({ count: 1 });

      await expect(
        notificationService.markRead("notif-1", "user-1"),
      ).resolves.toBeUndefined();
    });
  });
});
