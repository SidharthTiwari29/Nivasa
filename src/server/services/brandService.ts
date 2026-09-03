import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { brandRepository } from "@/server/repositories/brandRepository";

export const brandService = {
  async createBrand(name: string, website: string | undefined) {
    const existing = await brandRepository.findByName(name);
    if (existing) {
      throw new ConflictError(`A brand named "${name}" already exists`);
    }
    return brandRepository.create(name, website);
  },

  async curateBrand(
    brandId: string,
    adminUserId: string,
    input: { positioning?: string; strengths?: string; weaknesses?: string },
  ) {
    const brand = await brandRepository.findById(brandId);
    if (!brand) throw new NotFoundError("Brand");
    return brandRepository.curate(brandId, adminUserId, input);
  },
};
