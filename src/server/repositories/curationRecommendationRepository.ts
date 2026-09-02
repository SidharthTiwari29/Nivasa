import { prisma } from "@/server/db/prisma";
import type { CurationResult } from "@/server/services/catalogueCuration";

function serializeSelections(result: CurationResult) {
  return result.selections.map((s) => ({
    ...s,
    unitPriceMinor: s.unitPriceMinor.toString(),
    mrpMinor: s.mrpMinor?.toString() ?? null,
    lineTotalMinor: s.lineTotalMinor.toString(),
  }));
}

export const curationRecommendationRepository = {
  // Same ownership-scoping shape as boqService.createBoq - a caller must
  // own the project before a recommendation can be recorded against it.
  findProjectForOwner(projectId: string, ownerId: string) {
    return prisma.designProject.findFirst({
      where: { id: projectId, ownerId },
    });
  },

  // Persisted at status RECOMMENDED by the schema default - this is the
  // canonical lifecycle's second stage. It is NOT costed into any real
  // BOQ/budget total yet; it exists purely to be shown to the user for
  // review.
  createRecommendation(
    ownerId: string,
    projectId: string,
    targetBudgetMinor: bigint,
    result: CurationResult,
  ) {
    return prisma.curationRecommendation.create({
      data: {
        ownerId,
        projectId,
        targetBudgetMinor,
        selections: serializeSelections(result),
        totalMinor: result.totalMinor,
      },
    });
  },

  findRecommendationForOwner(recommendationId: string, ownerId: string) {
    return prisma.curationRecommendation.findFirst({
      where: { id: recommendationId, ownerId },
    });
  },

  // Claims the commit BEFORE any BOQ is created - the conditional update
  // (status must still be RECOMMENDED) is what actually prevents a race:
  // only one concurrent caller can ever win this transition, so only one
  // caller ever proceeds to create a real BOQ. resultingBoqId starts
  // null and is filled in by attachResultingBoq once the BOQ actually
  // exists - this ordering is what prevents the alternative failure mode
  // (create the BOQ first, then lose the race) from ever producing an
  // orphaned, duplicate BOQ nobody's recommendation record points to.
  async claimCommit(recommendationId: string): Promise<boolean> {
    const result = await prisma.curationRecommendation.updateMany({
      where: { id: recommendationId, status: "RECOMMENDED" },
      data: { status: "COMMITTED", committedAt: new Date() },
    });
    return result.count > 0;
  },

  attachResultingBoq(recommendationId: string, resultingBoqId: string) {
    return prisma.curationRecommendation.update({
      where: { id: recommendationId },
      data: { resultingBoqId },
    });
  },
};
