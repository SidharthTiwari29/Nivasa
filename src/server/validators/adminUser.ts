import { z } from "zod";

export const adminUserIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const updateAdminUserSchema = z.object({
  role: z.enum(["USER", "DESIGNER", "ADMIN", "SUPER_ADMIN"]),
});

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
