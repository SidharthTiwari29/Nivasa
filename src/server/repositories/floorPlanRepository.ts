import { prisma } from "@/server/db/prisma";
import type { CreateFloorPlanInput } from "@/server/validators/floorPlan";

export const floorPlanRepository = {
  listForOwner(ownerId: string, propertyId: string) {
    return prisma.floorPlan.findMany({
      where: { propertyId, property: { ownerId } },
      include: { asset: true },
      orderBy: { version: "desc" },
    });
  },

  findByIdForOwner(id: string, ownerId: string) {
    return prisma.floorPlan.findFirst({
      where: { id, property: { ownerId } },
      include: { asset: true, property: true },
    });
  },

  findPropertyForOwner(propertyId: string, ownerId: string) {
    return prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: { id: true },
    });
  },

  findLatestVersion(propertyId: string) {
    return prisma.floorPlan.findFirst({
      where: { propertyId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
  },

  create(input: CreateFloorPlanInput, version: number) {
    return prisma.floorPlan.create({
      data: {
        propertyId: input.propertyId,
        assetId: input.assetId,
        version,
      },
      include: { asset: true, property: true },
    });
  },
};
