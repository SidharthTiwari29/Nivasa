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

  async upsert(
    propertyId: string,
    ownerId: string,
    input: HomeIntelligenceInput,
  ) {
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

  async listRoomUnderstandings(
    propertyId: string,
    roomId: string,
    ownerId: string,
  ) {
    const room = await homeIntelligenceRepository.findRoomForOwner(
      propertyId,
      roomId,
      ownerId,
    );
    if (!room) throw new NotFoundError("Room");

    return homeIntelligenceRepository.listRoomUnderstandings(
      propertyId,
      roomId,
      ownerId,
    );
  },

  async createHomeDna(
    propertyId: string,
    ownerId: string,
    input: HomeDnaInput,
  ) {
    const result = await homeIntelligenceRepository.createHomeDna(
      propertyId,
      ownerId,
      input,
    );
    if (!result) throw new NotFoundError("Property");
    return result;
  },

  async listHomeDna(propertyId: string, ownerId: string) {
    const property = await homeIntelligenceRepository.findForOwner(
      propertyId,
      ownerId,
    );
    if (!property) throw new NotFoundError("Property");

    return homeIntelligenceRepository.listHomeDna(propertyId, ownerId);
  },
};
