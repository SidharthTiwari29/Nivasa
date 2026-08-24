import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import type {
  BudgetImpactInput,
  CreateBudgetInput,
  LockBudgetInput,
} from "@/server/validators/budget";

export const budgetService = {
  get(propertyId: string, ownerId: string) {
    return budgetRepository.findPlan(propertyId, ownerId);
  },

  async create(propertyId: string, ownerId: string, input: CreateBudgetInput) {
    try {
      const result = await budgetRepository.createVersion(
        propertyId,
        ownerId,
        input,
      );
      if (!result) throw new NotFoundError("Property");
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "BUDGET_LOCKED") {
        throw new ConflictError(
          "Budget plan is locked; create a new decision instead of mutating it",
        );
      }
      throw error;
    }
  },

  async lock(propertyId: string, ownerId: string, input: LockBudgetInput) {
    const result = await budgetRepository.lockVersion(
      propertyId,
      ownerId,
      input.version,
    );
    if (!result) throw new NotFoundError("Budget plan");
    if ("missing" in result) throw new NotFoundError("Budget version");
    if ("conflict" in result) {
      throw new ConflictError("Budget plan is already locked");
    }
    return result;
  },

  async impact(propertyId: string, ownerId: string, input: BudgetImpactInput) {
    const result = await budgetRepository.createImpact(
      propertyId,
      ownerId,
      input,
    );
    if (!result) throw new NotFoundError("Budget plan");
    return result;
  },
};
