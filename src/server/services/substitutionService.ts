import { NotFoundError } from "@/server/errors/AppError";
import { substitutionRepository } from "@/server/repositories/substitutionRepository";
import type { CreateSubstitutionInput } from "@/server/validators/substitution";

export type SubstitutionWithPriceDiff = {
  id: string;
  toCatalogueItemId: string;
  toCatalogueItemName: string;
  qualityImpact: string;
  maintenanceImpact: string;
  appearanceImpact: string;
  durabilityImpact: string;
  explanation: string;
  fromPriceMinor: bigint | null;
  toPriceMinor: bigint | null;
  savingMinor: bigint | null;
};

export const substitutionService = {
  // Both catalogue items must exist before a curated relationship can be
  // recorded between them - same "check existence before write" discipline
  // as budgetService.assertCatalogueItemsExist, for the same reason: a bad
  // id would otherwise only surface as a foreign-key violation deep in the
  // write, not a clean error at the point of request.
  async create(createdByUserId: string, input: CreateSubstitutionInput) {
    const [fromExists, toExists] = await Promise.all([
      substitutionRepository.itemExists(input.fromCatalogueItemId),
      substitutionRepository.itemExists(input.toCatalogueItemId),
    ]);
    if (!fromExists) {
      throw new NotFoundError(`CatalogueItem ${input.fromCatalogueItemId}`);
    }
    if (!toExists) {
      throw new NotFoundError(`CatalogueItem ${input.toCatalogueItemId}`);
    }
    return substitutionRepository.create(createdByUserId, input);
  },

  // README §17: "Nivasa must explain: what changes, what does not change,
  // expected quality difference, maintenance difference, appearance
  // difference, durability difference." The four impact fields are the
  // curated, human-stated answer to that; the price difference here is the
  // one number in this response that's actually computed, not asserted -
  // it's derived live from each item's current CataloguePrice, so it can
  // never drift from what the catalogue actually charges today.
  async listForItem(
    catalogueItemId: string,
  ): Promise<SubstitutionWithPriceDiff[]> {
    const exists = await substitutionRepository.itemExists(catalogueItemId);
    if (!exists) throw new NotFoundError("CatalogueItem");

    const substitutions =
      await substitutionRepository.listForItem(catalogueItemId);

    return substitutions.map((s) => {
      const fromPrice = s.fromCatalogueItem.prices[0]?.amountMinor ?? null;
      const toPrice = s.toCatalogueItem.prices[0]?.amountMinor ?? null;
      return {
        id: s.id,
        toCatalogueItemId: s.toCatalogueItemId,
        toCatalogueItemName: s.toCatalogueItem.name,
        qualityImpact: s.qualityImpact,
        maintenanceImpact: s.maintenanceImpact,
        appearanceImpact: s.appearanceImpact,
        durabilityImpact: s.durabilityImpact,
        explanation: s.explanation,
        fromPriceMinor: fromPrice,
        toPriceMinor: toPrice,
        savingMinor:
          fromPrice !== null && toPrice !== null ? fromPrice - toPrice : null,
      };
    });
  },
};
