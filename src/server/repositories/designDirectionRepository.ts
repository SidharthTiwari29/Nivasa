import { prisma } from "@/server/db/prisma";

export const designDirectionRepository = {
  findProjectForOwner(projectId: string, ownerId: string) {
    return prisma.designProject.findFirst({
      where: { id: projectId, ownerId },
    });
  },

  findForOwner(directionId: string, ownerId: string) {
    return prisma.designDirection.findFirst({
      where: { id: directionId, project: { ownerId } },
    });
  },

  listForProject(projectId: string) {
    return prisma.designDirection.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
  },

  countForProject(projectId: string) {
    return prisma.designDirection.count({ where: { projectId } });
  },

  // A project's FIRST direction starts ACTIVE (there is nothing else to
  // compare it against yet); every direction after that starts as
  // ALTERNATIVE - the customer must explicitly activate one for it to
  // become the direction that feeds BOQ/budget/procurement.
  create(projectId: string, name: string, isFirstDirection: boolean) {
    return prisma.designDirection.create({
      data: {
        projectId,
        name,
        status: isFirstDirection ? "ACTIVE" : "ALTERNATIVE",
        activatedAt: isFirstDirection ? new Date() : null,
      },
    });
  },

  // The real, atomic core of the one-active-at-a-time invariant:
  // deactivating whatever is currently ACTIVE and activating the target
  // happen inside a single transaction, so no concurrent request can
  // ever observe (or produce) a state with two ACTIVE directions, or
  // zero, for the same project.
  async activate(projectId: string, directionId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.designDirection.updateMany({
        where: { projectId, status: "ACTIVE" },
        data: { status: "ALTERNATIVE" },
      });
      const updated = await tx.designDirection.updateMany({
        where: { id: directionId, projectId },
        data: { status: "ACTIVE", activatedAt: new Date() },
      });
      if (updated.count === 0) return null;
      return tx.designDirection.findUniqueOrThrow({
        where: { id: directionId },
      });
    });
  },

  reject(directionId: string, reason: string | undefined) {
    return prisma.designDirection.update({
      where: { id: directionId },
      data: { status: "REJECTED", rejectionReason: reason },
    });
  },
};
