import { prisma } from "@/server/db/prisma";
import type {
  CreateRoomInput,
  UpdateRoomInput,
} from "@/server/validators/room";

export const roomRepository = {
  listForOwner(ownerId: string, propertyId: string) {
    return prisma.room.findMany({
      where: { propertyId, property: { ownerId } },
      orderBy: { createdAt: "asc" },
    });
  },

  findByIdForOwner(id: string, ownerId: string) {
    return prisma.room.findFirst({
      where: { id, property: { ownerId } },
    });
  },

  create(ownerId: string, input: CreateRoomInput) {
    return prisma.room.create({
      data: {
        propertyId: input.propertyId,
        type: input.type,
        name: input.name,
        areaSqFt: input.areaSqFt,
        metadata: input.metadata,
      },
      include: { property: true },
    });
  },

  updateForOwner(id: string, ownerId: string, input: UpdateRoomInput) {
    return prisma.room.updateMany({
      where: { id, property: { ownerId } },
      data: input,
    });
  },

  deleteForOwner(id: string, ownerId: string) {
    return prisma.room.deleteMany({
      where: { id, property: { ownerId } },
    });
  },
};
