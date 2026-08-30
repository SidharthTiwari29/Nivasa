import { NotFoundError } from "@/server/errors/AppError";
import { notificationRepository } from "@/server/repositories/notificationRepository";

export const notificationService = {
  // Deliberately does not throw on failure to create a notification - a
  // notification is a side effect of some other operation (an order
  // shipped, a quote arrived) and must never cause that primary operation
  // to fail just because the notification write had a problem. Callers
  // fire-and-forget this; errors are swallowed here, not propagated.
  async notify(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    try {
      await notificationRepository.create(input);
    } catch {
      // Intentionally swallowed - see comment above.
    }
  },

  list(userId: string, unreadOnly: boolean) {
    return notificationRepository.listForUser(userId, unreadOnly);
  },

  async markRead(notificationId: string, userId: string) {
    const result = await notificationRepository.markRead(
      notificationId,
      userId,
    );
    if (result.count === 0) throw new NotFoundError("Notification");
  },

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  },
};
