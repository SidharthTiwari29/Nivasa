import type { Role } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

const userSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const adminUserRepository = {
  list() {
    return prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  updateRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: userSelect,
    });
  },
};
