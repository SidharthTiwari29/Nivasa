import { prisma } from "@/server/db/prisma";

export const designBattleRepository = {
  // Ownership-scoped the same way createBoq/boqService already do -
  // reusing the exact query shape rather than inventing a new one.
  findProjectForOwner(projectId: string, ownerId: string) {
    return prisma.designProject.findFirst({
      where: { id: projectId, ownerId },
      select: { id: true, name: true },
    });
  },

  findLatestBoqForProject(projectId: string) {
    return prisma.boq.findFirst({
      where: { projectId },
      orderBy: { version: "desc" },
      select: { totalMinor: true, currency: true },
    });
  },
};
