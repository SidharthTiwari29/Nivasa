import { findDeals } from "@/server/catalogue/intelligence/dealService";
import { NotFoundError, ValidationError } from "@/server/errors/AppError";
import { marketIntelligenceRepository } from "@/server/repositories/marketIntelligenceRepository";

export const dealIntelligenceService = {
  async findForObservation(input: {
    observationId: string;
    geography?: string;
    minimumSavingBps?: number;
  }) {
    const baseline =
      await marketIntelligenceRepository.findObservationForOwnerlessDecision(
        input.observationId,
      );
    if (!baseline) throw new NotFoundError("Market observation");
    if (!baseline.variantId) {
      throw new ValidationError({
        observationId:
          "A variant/SKU is required for an exact-SKU deal comparison",
      });
    }

    const observations =
      await marketIntelligenceRepository.listExactVariantObservations({
        variantId: baseline.variantId,
        excludeObservationId: baseline.observationId,
        geography: input.geography ?? baseline.geography,
      });

    const sameCurrency = observations.filter(
      (observation) => observation.currency === baseline.currency,
    );
    const deals = findDeals(
      baseline.amountMinor,
      sameCurrency,
      input.minimumSavingBps ?? 500,
    );

    return {
      baseline,
      deals: deals.map((deal) => ({
        observation: deal.observation,
        savingMinor: deal.savingMinor,
        savingBps: deal.savingBps,
        classification:
          deal.observation.truth === "VERIFIED" &&
          Boolean(deal.observation.evidence.verifiedAt)
            ? "VERIFIED_DEAL"
            : "POTENTIAL_SAVING",
      })),
    };
  },
};
