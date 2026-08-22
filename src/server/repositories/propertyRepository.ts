import { prisma } from "@/server/db/prisma";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
} from "@/server/validators/property";

export const propertyRepository = {
  listForOwner(ownerId: string) {
    return prisma.property.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdForOwner(id: string, ownerId: string) {
    return prisma.property.findFirst({
      where: { id, ownerId },
    });
  },

  create(ownerId: string, input: CreatePropertyInput) {
    return prisma.property.create({
      data: { ownerId, name: input.name, address: input.address },
    });
  },

  updateForOwner(id: string, ownerId: string, input: UpdatePropertyInput) {
    return prisma.property.updateMany({
      where: { id, ownerId },
      data: input,
    });
  },

  deleteForOwner(id: string, ownerId: string) {
    return prisma.property.deleteMany({
      where: { id, ownerId },
    });
  },
};
