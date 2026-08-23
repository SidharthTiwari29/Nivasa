import { prisma } from "@/server/db/prisma";
import type {
  HomeDnaInput,
  HomeIntelligenceInput,
  RoomUnderstandingInput,
} from "@/server/validators/homeIntelligence";

export const homeIntelligenceRepository = {
  findForOwner(propertyId: string, ownerId: string) {
    return prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      include: {
        homeIntelligence: true,
        rooms: {
          include: {
            roomUnderstandings: { orderBy: { version: "desc" }, take: 1 },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  async upsertForOwner(
    propertyId: string,
    ownerId: string,
    input: HomeIntelligenceInput,
  ) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: { id: true, homeIntelligence: { select: { version: true } } },
    });
    if (!property) return null;

    const nextVersion = (property.homeIntelligence?.version ?? 0) + 1;
    return prisma.homeIntelligence.upsert({
      where: { propertyId },
      create: {
        propertyId,
        version: nextVersion,
        propertyType: input.propertyType,
        configuration: input.configuration,
        possessionDate: input.possessionDate,
        city: input.city,
        state: input.state,
        country: input.country,
        carpetAreaSqFt: input.carpetAreaSqFt,
        metadata: input.metadata,
        confirmedAt: new Date(),
        confirmedByUserId: ownerId,
      },
      update: {
        version: nextVersion,
        propertyType: input.propertyType,
        configuration: input.configuration,
        possessionDate: input.possessionDate,
        city: input.city,
        state: input.state,
        country: input.country,
        carpetAreaSqFt: input.carpetAreaSqFt,
        metadata: input.metadata,
        confirmedAt: new Date(),
        confirmedByUserId: ownerId,
      },
    });
  },

  async upsertRoomUnderstanding(
    propertyId: string,
    roomId: string,
    ownerId: string,
    input: RoomUnderstandingInput,
  ) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, propertyId, property: { ownerId } },
      select: {
        id: true,
        roomUnderstandings: { select: { version: true }, orderBy: { version: "desc" }, take: 1 },
      },
    });
    if (!room) return null;

    const version = (room.roomUnderstandings[0]?.version ?? 0) + 1;
    const confirmedByUserId = input.status === "CORRECTED" || input.status === "CONFIRMED" ? ownerId : null;

    return prisma.roomUnderstanding.create({
      data: {
        roomId,
        version,
        roomType: input.roomType,
        name: input.name,
        confidenceBps: input.confidenceBps,
        source: input.source,
        geometry: input.geometry,
        dimensions: input.dimensions,
        constraints: input.constraints,
        requirements: input.requirements,
        status: input.status,
        confirmedAt: confirmedByUserId ? new Date() : null,
        confirmedByUserId,
      },
    });
  },

  listRoomUnderstandings(propertyId: string, roomId: string, ownerId: string) {
    return prisma.roomUnderstanding.findMany({
      where: { roomId, room: { propertyId, property: { ownerId } } },
      orderBy: { version: "desc" },
    });
  },

  async createHomeDna(propertyId: string, ownerId: string, input: HomeDnaInput) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: { id: true, homeIntelligence: { select: { version: true } }, homeDnaVersions: { select: { version: true }, orderBy: { version: "desc" }, take: 1 } },
    });
    if (!property) return null;

    const version = (property.homeDnaVersions[0]?.version ?? 0) + 1;
    return prisma.homeDnaVersion.create({
      data: {
        propertyId,
        version,
        homeIntelligenceVersion: property.homeIntelligence?.version ?? 0,
        household: input.household,
        lifestyle: input.lifestyle,
        designPersonality: input.designPersonality,
        storageNeeds: input.storageNeeds,
        functionalNeeds: input.functionalNeeds,
        futureNeeds: input.futureNeeds,
        smartHomePreferences: input.smartHomePreferences,
        language: input.language,
        createdByUserId: ownerId,
      },
    });
  },

  listHomeDna(propertyId: string, ownerId: string) {
    return prisma.homeDnaVersion.findMany({
      where: { propertyId, property: { ownerId } },
      orderBy: { version: "desc" },
    });
  },
};
