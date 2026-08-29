import { rankSubstitutions } from "@/server/catalogue/intelligence/substitutionService";
import { NotFoundError, ValidationError } from "@/server/errors/AppError";
import {
  marketIntelligenceRepository,
  toProductVariant,
} from "@/server/repositories/marketIntelligenceRepository";

function describeAttributeChanges(
  selected: Record<string, string>,
  candidate: Record<string, string>,
) {
  const keys = new Set([...Object.keys(selected), ...Object.keys(candidate)]);
  return [...keys]
    .sort()
    .filter((key) => selected[key] !== candidate[key])
    .map((key) => ({
      attribute: key,
      from: selected[key] ?? null,
      to: candidate[key] ?? null,
    }));
}

export const substitutionIntelligenceService = {
  async findForVariant(input: {
    variantId: string;
    observationId: string;
    geography?: string;
  }) {
    const selectedRow = await marketIntelligenceRepository.findVariant(
      input.variantId,
    );
    if (!selectedRow) throw new NotFoundError("Product variant");

    const selectedObservation =
      await marketIntelligenceRepository.findObservationForOwnerlessDecision(
        input.observationId,
      );
    if (!selectedObservation) throw new NotFoundError("Market observation");
    if (selectedObservation.variantId !== input.variantId) {
      throw new ValidationError({
        observationId: "Observation does not belong to the selected variant",
      });
    }

    const rows = await marketIntelligenceRepository.listVariantSubstitutions({
      canonicalProductId: selectedRow.canonicalProductId,
      excludeVariantId: input.variantId,
      geography: input.geography ?? selectedObservation.geography,
    });

    const variantIds = rows
      .map((row) => row.variantId)
      .filter((id): id is string => Boolean(id));
    const variants =
      await marketIntelligenceRepository.findVariants(variantIds);
    const variantById = new Map(
      variants.map((variant) => [variant.id, toProductVariant(variant)]),
    );

    // Historical observations remain preserved; recommendations use only the
    // freshest observation available for each candidate variant.
    const latestByVariant = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!row.variantId) continue;
      const existing = latestByVariant.get(row.variantId);
      if (
        !existing ||
        row.evidence.observedAt.getTime() >
          existing.evidence.observedAt.getTime()
      ) {
        latestByVariant.set(row.variantId, row);
      }
    }

    const candidates = [...latestByVariant.entries()]
      .map(([variantId, observation]) => {
        const variant = variantById.get(variantId);
        return variant ? { variant, observation } : null;
      })
      .filter(
        (
          candidate,
        ): candidate is {
          variant: ReturnType<typeof toProductVariant>;
          observation: (typeof rows)[number];
        } => candidate !== null,
      )
      .filter(
        ({ observation }) =>
          observation.currency === selectedObservation.currency,
      );

    const selectedVariant = toProductVariant(selectedRow);
    const ranked = rankSubstitutions(
      selectedVariant,
      selectedObservation,
      candidates,
    );

    return {
      selected: {
        variant: selectedVariant,
        observation: selectedObservation,
      },
      substitutions: ranked.map((option) => ({
        variant: option.variant,
        observation: option.observation,
        reasons: option.reasons,
        score: option.score,
        priceDeltaMinor:
          option.observation.amountMinor - selectedObservation.amountMinor,
        savingMinor:
          selectedObservation.amountMinor > option.observation.amountMinor
            ? selectedObservation.amountMinor - option.observation.amountMinor
            : 0n,
        attributeChanges: describeAttributeChanges(
          selectedVariant.attributes,
          option.variant.attributes,
        ),
        tradeoffStatus: "NOT_ESTABLISHED",
      })),
    };
  },
};
