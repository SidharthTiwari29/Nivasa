import { z } from "zod";

export const notificationIdParamSchema = z.object({
  notificationId: z.string().cuid(),
});

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
