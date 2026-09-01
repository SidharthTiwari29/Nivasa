import { prisma } from "@/server/db/prisma";

export const notificationRepository = {
  create(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    return prisma.notification.create({ data: input as never });
  },

  listForUser(userId: string, unreadOnly: boolean) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },

  // updateMany with userId in the WHERE clause, not a separate ownership
  // check - the same pattern used everywhere else in this codebase, so
  // marking someone else's notification read by guessing its id is
  // structurally impossible, not just policy-forbidden.
  markRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};
