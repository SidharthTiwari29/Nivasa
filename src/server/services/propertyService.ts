import { propertyRepository } from "@/server/repositories/propertyRepository";
import { NotFoundError } from "@/server/errors/AppError";
import type { CreatePropertyInput, UpdatePropertyInput } from "@/server/validators/property";

export const propertyService = {
  list(ownerId: string) {
    return propertyRepository.listForOwner(ownerId);
  },

  async get(id: string, ownerId: string) {
    const property = await propertyRepository.findByIdForOwner(id, ownerId);
    if (!property) throw new NotFoundError("Property");
    return property;
  },

  create(ownerId: string, input: CreatePropertyInput) {
    return propertyRepository.create(ownerId, input);
  },

  async update(id: string, ownerId: string, input: UpdatePropertyInput) {
    const result = await propertyRepository.updateForOwner(id, ownerId, input);
    if (result.count === 0) throw new NotFoundError("Property");
    return propertyRepository.findByIdForOwner(id, ownerId);
  },

  async remove(id: string, ownerId: string) {
    const result = await propertyRepository.deleteForOwner(id, ownerId);
    if (result.count === 0) throw new NotFoundError("Property");
  },
};
