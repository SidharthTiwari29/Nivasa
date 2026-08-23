import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  HomeDnaInput,
  HomeIntelligenceInput,
  RoomUnderstandingInput,
} from "@/server/validators/homeIntelligence";

const json = (value: Record<string, unknown> | undefined) =>
  value as Prisma.InputJsonValue | undefined;

async function serializable<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2034" ||
        attempt === 2
      ) {
        throw error;
      }
    }
  }

  throw new Error("Serializable transaction failed after retries");
}

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
    return serializable(async (tx) => {
      const property = await tx.property.findFirst({
        where: { id: propertyId, ownerId },
        select: { id: true, homeIntelligence: { select: { version: true } } },
      });
      if (!property) return null;

      const nextVersion = (property.homeIntelligence?.version ?? 0) + 1;
      return tx.homeIntelligence.upsert({
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
          metadata: json(input.metadata),
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
          metadata: json(input.metadata),
          confirmedAt: new Date(),
          confirmedByUserId: ownerId,
        },
      });
    });
  },

  async upsertRoomUnderstanding(
    propertyId: string,
    roomId: string,
    ownerId: string,
    input: RoomUnderstandingInput,
  ) {
    return serializable(async (tx) => {
      const room = await tx.room.findFirst({
        where: { id: roomId, propertyId, property: { ownerId } },
        select: {
          id: true,
          roomUnderstandings: {
            select: { version: true },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });
      if (!room) return null;

      const version = (room.roomUnderstandings[0]?.version ?? 0) + 1;
      const confirmedByUserId =
        input.status === "CORRECTED" || input.status === "CONFIRMED"
          ? ownerId
          : null;

      return tx.roomUnderstanding.create({
        data: {
          roomId,
          version,
          roomType: input.roomType,
          name: input.name,
          confidenceBps: input.confidenceBps,
          source: input.source,
          geometry: json(input.geometry),
          dimensions: json(input.dimensions),
          constraints: json(input.constraints),
          requirements: json(input.requirements),
          status: input.status,
          confirmedAt: confirmedByUserId ? new Date() : null,
          confirmedByUserId,
        },
      });
    });
  },

  listRoomUnderstandings(propertyId: string, roomId: string, ownerId: string) {
    return prisma.roomUnderstanding.findMany({
      where: { roomId, room: { propertyId, property: { ownerId } } },
      orderBy: { version: "desc" },
    });
  },

  async createHomeDna(propertyId: string, ownerId: string, input: HomeDnaInput) {
    return serializable(async (tx) => {
      const property = await tx.property.findFirst({
        where: { id: propertyId, ownerId },
        select: {
          id: true,
          homeIntelligence: { select: { version: true } },
          homeDnaVersions: {
            select: { version: true },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });
      if (!property?.homeIntelligence) return null;

      const version = (property.homeDnaVersions[0]?.version ?? 0) + 1;
      return tx.homeDnaVersion.create({
        data: {
          propertyId,
          version,
          homeIntelligenceVersion: property.homeIntelligence.version,
          household: json(input.household) as Prisma.InputJsonValue,
          lifestyle: json(input.lifestyle) as Prisma.InputJsonValue,
          designPersonality: json(input.designPersonality) as Prisma.InputJsonValue,
          storageNeeds: json(input.storageNeeds) as Prisma.InputJsonValue,
          functionalNeeds: json(input.functionalNeeds) as Prisma.InputJsonValue,
          futureNeeds: json(input.futureNeeds) as Prisma.InputJsonValue,
          smartHomePreferences: json(input.smartHomePreferences) as Prisma.InputJsonValue,
          language: input.language,
          createdByUserId: ownerId,
        },
      });
    });
  },

  listHomeDna(propertyId: string, ownerId: string) {
    return prisma.homeDnaVersion.findMany({
      where: { propertyId, property: { ownerId } },
      orderBy: { version: "desc" },
    });
  },
};
