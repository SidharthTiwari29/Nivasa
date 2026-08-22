import { Prisma } from "@prisma/client";
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
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
      include: { property: true },
    });
  },

  updateForOwner(id: string, ownerId: string, input: UpdateRoomInput) {
    const { metadata, ...rest } = input;
    return prisma.room.updateMany({
      where: { id, property: { ownerId } },
      data: {
        ...rest,
        ...(metadata !== undefined && {
          metadata:
            metadata === null
              ? Prisma.JsonNull
              : (metadata as Prisma.InputJsonValue),
        }),
      },
    });
  },

  deleteForOwner(id: string, ownerId: string) {
    return prisma.room.deleteMany({
      where: { id, property: { ownerId } },
    });
  },
};
