import { budgetService } from "@/server/services/budgetService";
import { rankSubstitutions, type SubstitutionCandidate } from "@/server/marketIntelligence/substitution";
import type { WhatIfCommitInput, WhatIfPreviewInput } from "@/server/validators/whatIf";

const impactScore = (value: "BETTER" | "SIMILAR" | "LOWER" | "UNKNOWN") => {
  switch (value) {
    case "BETTER":
      return 1000;
    case "SIMILAR":
      return 500;
    case "LOWER":
      return -1000;
    default:
      return 0;
  }
};

export const whatIfService = {
  preview(input: WhatIfPreviewInput) {
    const candidates: SubstitutionCandidate[] = input.candidates.map((candidate) => ({
      ...candidate,
      priceMinor:
        candidate.priceMinor === null ? null : BigInt(candidate.priceMinor),
    }));

    const ranked = rankSubstitutions(
      input.currentPriceMinor === null ? null : BigInt(input.currentPriceMinor),
      candidates,
    );

    const current = input.currentPriceMinor === null ? null : BigInt(input.currentPriceMinor);
    const proposed = input.proposedPriceMinor === null ? null : BigInt(input.proposedPriceMinor);
    const priceDeltaMinor =
      current === null || proposed === null ? null : proposed - current;
    const savingMinor = priceDeltaMinor === null ? null : -priceDeltaMinor;
    const confidenceBps = Math.max(
      0,
      Math.min(
        10000,
        5000 +
          impactScore(input.designImpact) / 2 +
          impactScore(input.functionImpact) / 2,
      ),
    );

    return {
      scopeChange: input.scopeChange,
      roomId: input.roomId ?? null,
      reason: input.reason,
      priceDeltaMinor,
      savingMinor,
      confidenceBps,
      decision:
        priceDeltaMinor === null
          ? "UNKNOWN"
          : savingMinor !== null && savingMinor > 0n
            ? "SAVE"
            : savingMinor === 0n
              ? "NEUTRAL"
              : "UPGRADE_COST",
      rankedCandidates: ranked,
    };
  },

  async commit(
    propertyId: string,
    ownerId: string,
    input: WhatIfCommitInput,
  ) {
    return budgetService.impact(propertyId, ownerId, {
      baseVersion: input.baseVersion,
      proposedLowDeltaMinor: input.proposedLowDeltaMinor,
      proposedTargetDeltaMinor: input.proposedTargetDeltaMinor,
      proposedHighDeltaMinor: input.proposedHighDeltaMinor,
      reason: input.reason,
      inputs: {
        ...input.inputs,
        scopeChange: input.scopeChange,
        roomId: input.roomId ?? null,
        currentPriceMinor: input.currentPriceMinor,
        proposedPriceMinor: input.proposedPriceMinor,
        designImpact: input.designImpact,
        functionImpact: input.functionImpact,
      },
    });
  },
};
