import { NotFoundError } from "@/server/errors/AppError";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { buildBudgetTimeline } from "@/server/services/budgetTimeline";

export const budgetTimelineService = {
  async getTimeline(propertyId: string, ownerId: string) {
    const data = await budgetRepository.listTimeline(propertyId, ownerId);
    if (!data) throw new NotFoundError("BudgetPlan");
    return buildBudgetTimeline(data.versions, data.impacts);
  },
};
