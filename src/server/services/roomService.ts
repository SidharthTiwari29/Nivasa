import { NotFoundError } from "@/server/errors/AppError";
import { propertyRepository } from "@/server/repositories/propertyRepository";
import { roomRepository } from "@/server/repositories/roomRepository";
import type {
  CreateRoomInput,
  UpdateRoomInput,
} from "@/server/validators/room";

export const roomService = {
  async list(propertyId: string, ownerId: string) {
    const property = await propertyRepository.findByIdForOwner(propertyId, ownerId);
    if (!property) throw new NotFoundError("Property");
    return roomRepository.listForOwner(ownerId, propertyId);
  },

  async get(id: string, ownerId: string) {
    const room = await roomRepository.findByIdForOwner(id, ownerId);
    if (!room) throw new NotFoundError("Room");
    return room;
  },

  async create(ownerId: string, input: CreateRoomInput) {
    const property = await propertyRepository.findByIdForOwner(input.propertyId, ownerId);
    if (!property) throw new NotFoundError("Property");
    return roomRepository.create(ownerId, input);
  },

  async update(id: string, ownerId: string, input: UpdateRoomInput) {
    const result = await roomRepository.updateForOwner(id, ownerId, input);
    if (result.count === 0) throw new NotFoundError("Room");
    return roomRepository.findByIdForOwner(id, ownerId);
  },

  async remove(id: string, ownerId: string) {
    const result = await roomRepository.deleteForOwner(id, ownerId);
    if (result.count === 0) throw new NotFoundError("Room");
  },
};
