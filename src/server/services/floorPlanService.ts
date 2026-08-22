import { ForbiddenError, NotFoundError } from "@/server/errors/AppError";
import { floorPlanRepository } from "@/server/repositories/floorPlanRepository";
import type { CreateFloorPlanInput } from "@/server/validators/floorPlan";

export const floorPlanService = {
  async list(propertyId: string, ownerId: string) {
    const property = await floorPlanRepository.findPropertyForOwner(
      propertyId,
      ownerId,
    );
    if (!property) throw new NotFoundError("Property");
    return floorPlanRepository.listForOwner(ownerId, propertyId);
  },

  async get(id: string, ownerId: string) {
    const floorPlan = await floorPlanRepository.findByIdForOwner(id, ownerId);
    if (!floorPlan) throw new NotFoundError("FloorPlan");
    return floorPlan;
  },

  async create(ownerId: string, input: CreateFloorPlanInput) {
    const property = await floorPlanRepository.findPropertyForOwner(
      input.propertyId,
      ownerId,
    );
    if (!property) throw new NotFoundError("Property");

    const asset = await floorPlanRepository.findAssetForOwner(
      input.assetId,
      ownerId,
    );
    if (!asset) throw new ForbiddenError();

    const latest = await floorPlanRepository.findLatestVersion(input.propertyId);
    return floorPlanRepository.create(input, (latest?.version ?? 0) + 1);
  },
};
