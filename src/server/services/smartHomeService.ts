import { NotFoundError } from "@/server/errors/AppError";
import { homeIntelligenceService } from "@/server/services/homeIntelligenceService";
import { roomRepository } from "@/server/repositories/roomRepository";
import {
  compileSmartHomePlan,
  mergeSmartHomePlan,
} from "@/server/smartHome/smartHomePlan";
import type {
  SmartHomePatchInput,
  SmartHomePlanInput,
} from "@/server/validators/smartHome";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const assertRoomIdsBelongToProperty = async (
  propertyId: string,
  ownerId: string,
  capabilities: SmartHomePlanInput["capabilities"],
) => {
  const requestedRoomIds = [
    ...new Set(capabilities.flatMap((capability) => capability.roomIds)),
  ];
  if (requestedRoomIds.length === 0) return;

  const rooms = await roomRepository.listForOwner(ownerId, propertyId);
  const ownedRoomIds = new Set(rooms.map((room) => room.id));
  const foreignRoomId = requestedRoomIds.find((roomId) => !ownedRoomIds.has(roomId));
  if (foreignRoomId) throw new NotFoundError("Room");
};

export const smartHomeService = {
  async get(propertyId: string, ownerId: string) {
    const versions = await homeIntelligenceService.listHomeDna(
      propertyId,
      ownerId,
    );
    const latest = versions[0];
    if (!latest) throw new NotFoundError("Home DNA");

    return {
      dnaVersion: latest.version,
      plan: mergeSmartHomePlan(latest.smartHomePreferences, {}),
    };
  },

  async create(propertyId: string, ownerId: string, input: SmartHomePlanInput) {
    await assertRoomIdsBelongToProperty(propertyId, ownerId, input.capabilities);

    const versions = await homeIntelligenceService.listHomeDna(
      propertyId,
      ownerId,
    );
    const latest = versions[0];
    if (!latest) throw new NotFoundError("Home DNA");

    const plan = compileSmartHomePlan(input);
    const version = await homeIntelligenceService.createHomeDna(
      propertyId,
      ownerId,
      {
        household: asRecord(latest.household),
        lifestyle: asRecord(latest.lifestyle),
        designPersonality: asRecord(latest.designPersonality),
        storageNeeds: asRecord(latest.storageNeeds),
        functionalNeeds: asRecord(latest.functionalNeeds),
        futureNeeds: asRecord(latest.futureNeeds),
        smartHomePreferences: plan,
        language: latest.language,
      },
    );

    return { dnaVersion: version.version, plan };
  },

  async patch(propertyId: string, ownerId: string, input: SmartHomePatchInput) {
    if (input.capabilities) {
      await assertRoomIdsBelongToProperty(propertyId, ownerId, input.capabilities);
    }

    const versions = await homeIntelligenceService.listHomeDna(
      propertyId,
      ownerId,
    );
    const latest = versions[0];
    if (!latest) throw new NotFoundError("Home DNA");

    const plan = mergeSmartHomePlan(latest.smartHomePreferences, input);
    const version = await homeIntelligenceService.createHomeDna(
      propertyId,
      ownerId,
      {
        household: asRecord(latest.household),
        lifestyle: asRecord(latest.lifestyle),
        designPersonality: asRecord(latest.designPersonality),
        storageNeeds: asRecord(latest.storageNeeds),
        functionalNeeds: asRecord(latest.functionalNeeds),
        futureNeeds: asRecord(latest.futureNeeds),
        smartHomePreferences: plan,
        language: latest.language,
      },
    );

    return { dnaVersion: version.version, plan };
  },
};
