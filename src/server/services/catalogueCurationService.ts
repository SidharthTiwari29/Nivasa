import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
import { curationRecommendationRepository } from "@/server/repositories/curationRecommendationRepository";
import { createBoq } from "@/server/services/boqService";
import {
  curateWithinBudget,
  type CurationNeed,
} from "@/server/services/catalogueCuration";

export const catalogueCurationService = {
  async curate(needs: CurationNeed[], targetBudgetMinor: bigint) {
    const categories = needs.map((n) => n.category);
    const optionsByCategory =
      await catalogueCurationRepository.findActiveOptionsByCategories(
        categories,
      );
    return curateWithinBudget(needs, optionsByCategory, targetBudgetMinor);
  },

  // Canonical lifecycle, stage 2: runs the same curation, then PERSISTS it
  // as a real RECOMMENDED row the user can review and later commit or
  // discard - this is the fix for the gap the architecture review found:
  // curateWithinBudget alone produced an ephemeral, throwaway suggestion
  // with no path forward.
  async recommend(
    projectId: string,
    ownerId: string,
    needs: CurationNeed[],
    targetBudgetMinor: bigint,
  ) {
    const project = await curationRecommendationRepository.findProjectForOwner(
      projectId,
      ownerId,
    );
    if (!project) throw new NotFoundError("DesignProject");

    const result = await this.curate(needs, targetBudgetMinor);
    return curationRecommendationRepository.createRecommendation(
      ownerId,
      projectId,
      targetBudgetMinor,
      result,
    );
  },

  // Canonical lifecycle, stage 3: the user explicitly accepts a
  // recommendation, which is what actually creates a real Boq from it -
  // reusing boqService.createBoq unchanged, so a committed curation and a
  // manually-entered BOQ go through the exact same costing/versioning
  // logic, never a parallel, potentially-diverging code path.
  async commit(recommendationId: string, ownerId: string) {
    const recommendation =
      await curationRecommendationRepository.findRecommendationForOwner(
        recommendationId,
        ownerId,
      );
    if (!recommendation) throw new NotFoundError("CurationRecommendation");
    if (recommendation.status !== "RECOMMENDED") {
      throw new ConflictError(
        `This recommendation is already ${recommendation.status.toLowerCase()} and cannot be committed again`,
      );
    }

    // Claim the commit BEFORE creating anything real - this is what
    // guarantees at most one real BOQ is ever created per recommendation,
    // even under concurrent commit attempts. If this fails, a concurrent
    // request already won, and we stop here without ever touching BOQ
    // creation - no orphaned/duplicate BOQ is possible.
    const claimed =
      await curationRecommendationRepository.claimCommit(recommendationId);
    if (!claimed) {
      throw new ConflictError(
        "This recommendation was committed by a concurrent request",
      );
    }

    const selections = recommendation.selections as Array<{
      itemId: string;
      itemName: string;
      unitPriceMinor: string;
      quantity: number;
    }>;

    const boq = await createBoq({
      ownerId,
      projectId: recommendation.projectId,
      lines: selections.map((s) => ({
        catalogueItemId: s.itemId,
        description: s.itemName,
        quantity: BigInt(s.quantity),
        unit: "unit",
        unitPriceMinor: BigInt(s.unitPriceMinor),
      })),
    });

    await curationRecommendationRepository.attachResultingBoq(
      recommendationId,
      boq.id,
    );

    return boq;
  },
};
