import { NotFoundError } from "@/server/errors/AppError";
import { homeIntelligenceRepository } from "@/server/repositories/homeIntelligenceRepository";
import type {
  HomeDnaInput,
  HomeIntelligenceInput,
  RoomUnderstandingInput,
} from "@/server/validators/homeIntelligence";

export const homeIntelligenceService = {
  async get(propertyId: string, ownerId: string) {
    const property = await homeIntelligenceRepository.findForOwner(
      propertyId,
      ownerId,
    );
    if (!property) throw new NotFoundError("Property");
    return property;
  },

  async upsert(propertyId: string, ownerId: string, input: HomeIntelligenceInput) {
    const result = await homeIntelligenceRepository.upsertForOwner(
      propertyId,
      ownerId,
      input,
    );
    if (!result) throw new NotFoundError("Property");
    return result;
  },

  async upsertRoomUnderstanding(
    propertyId: string,
    roomId: string,
    ownerId: string,
    input: RoomUnderstandingInput,
  ) {
    const result = await homeIntelligenceRepository.upsertRoomUnderstanding(
      propertyId,
      roomId,
      ownerId,
      input,
    );
    if (!result) throw new NotFoundError("Room");
    return result;
  },

  async listRoomUnderstandings(propertyId: string, roomId: string, ownerId: string) {
    const result = await homeIntelligenceRepository.listRoomUnderstandings(
      propertyId,
      roomId,
      ownerId,
    );
    if (!result.length) throw new NotFoundError("Room understanding");
    return result;
  },

  async createHomeDna(propertyId: string, ownerId: string, input: HomeDnaInput) {
    const result = await homeIntelligenceRepository.createHomeDna(
      propertyId,
      ownerId,
      input,
    );
    if (!result) throw new NotFoundError("Property");
    return result;
  },

  async listHomeDna(propertyId: string, ownerId: string) {
    const result = await homeIntelligenceRepository.listHomeDna(propertyId, ownerId);
    if (!result.length) throw new NotFoundError("Home DNA");
    return result;
  },
};
