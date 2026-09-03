import { prisma } from "@/server/db/prisma";

export const designBoqGenerationRepository = {
  findProjectWithRoomForOwner(projectId: string, ownerId: string) {
    return prisma.designProject.findFirst({
      where: { id: projectId, ownerId },
      include: { room: { select: { type: true } } },
    });
  },
};
