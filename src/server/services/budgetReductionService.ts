import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { planBudgetReduction } from "@/server/services/budgetReduction";

export const budgetReductionService = {
  async suggestReduction(
    propertyId: string,
    ownerId: string,
    targetReductionMinor: bigint,
  ) {
    const plan = await budgetRepository.findPlan(propertyId, ownerId);
    if (!plan) throw new NotFoundError("BudgetPlan");

    const latest = plan.versions[0];
    if (!latest) {
      throw new ConflictError(
        "No budget version exists yet to suggest a reduction against",
      );
    }

    return planBudgetReduction(
      (latest.lines as Array<{
        id: string;
        category: string;
        description: string | null;
        lowMinor: bigint;
        targetMinor: bigint;
      }>) ?? [],
      targetReductionMinor,
    );
  },
};
