import { NotFoundError } from "@/server/errors/AppError";
import { homeIntelligenceService } from "@/server/services/homeIntelligenceService";
import { compileSmartHomePlan, mergeSmartHomePlan } from "@/server/smartHome/smartHomePlan";
import type {
  SmartHomePatchInput,
  SmartHomePlanInput,
} from "@/server/validators/smartHome";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const smartHomeService = {
  async get(propertyId: string, ownerId: string) {
    const versions = await homeIntelligenceService.listHomeDna(propertyId, ownerId);
    const latest = versions[0];
    if (!latest) throw new NotFoundError("Home DNA");

    return {
      dnaVersion: latest.version,
      plan: mergeSmartHomePlan(latest.smartHomePreferences, {}),
    };
  },

  async create(
    propertyId: string,
    ownerId: string,
    input: SmartHomePlanInput,
  ) {
    const versions = await homeIntelligenceService.listHomeDna(propertyId, ownerId);
    const latest = versions[0];
    if (!latest) throw new NotFoundError("Home DNA");

    const plan = compileSmartHomePlan(input);
    const version = await homeIntelligenceService.createHomeDna(propertyId, ownerId, {
      household: asRecord(latest.household),
      lifestyle: asRecord(latest.lifestyle),
      designPersonality: asRecord(latest.designPersonality),
      storageNeeds: asRecord(latest.storageNeeds),
      functionalNeeds: asRecord(latest.functionalNeeds),
      futureNeeds: asRecord(latest.futureNeeds),
      smartHomePreferences: plan,
      language: latest.language,
    });

    return { dnaVersion: version.version, plan };
  },

  async patch(
    propertyId: string,
    ownerId: string,
    input: SmartHomePatchInput,
  ) {
    const versions = await homeIntelligenceService.listHomeDna(propertyId, ownerId);
    const latest = versions[0];
    if (!latest) throw new NotFoundError("Home DNA");

    const plan = mergeSmartHomePlan(latest.smartHomePreferences, input);
    const version = await homeIntelligenceService.createHomeDna(propertyId, ownerId, {
      household: asRecord(latest.household),
      lifestyle: asRecord(latest.lifestyle),
      designPersonality: asRecord(latest.designPersonality),
      storageNeeds: asRecord(latest.storageNeeds),
      functionalNeeds: asRecord(latest.functionalNeeds),
      futureNeeds: asRecord(latest.futureNeeds),
      smartHomePreferences: plan,
      language: latest.language,
    });

    return { dnaVersion: version.version, plan };
  },
};
