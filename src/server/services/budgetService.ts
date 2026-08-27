import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import type {
  AddBudgetScopeLineInput,
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

  async addScopeLine(
    propertyId: string,
    ownerId: string,
    version: number,
    input: AddBudgetScopeLineInput,
  ) {
    try {
      const result = await budgetRepository.addScopeLine(
        propertyId,
        ownerId,
        version,
        input,
      );
      if (result === null) throw new NotFoundError("Budget version");
      if (result === undefined) {
        if (input.kind === "CATALOGUE") {
          throw new NotFoundError("Catalogue item");
        }
        throw new NotFoundError("Budget version");
      }
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "BUDGET_LOCKED") {
        throw new ConflictError(
          "Budget plan is locked; scope-line edits are not permitted",
        );
      }
      throw error;
    }
  },

  async removeScopeLine(
    propertyId: string,
    ownerId: string,
    version: number,
    scopeLineId: string,
  ) {
    try {
      const result = await budgetRepository.removeScopeLine(
        propertyId,
        ownerId,
        version,
        scopeLineId,
      );
      if (result === null) throw new NotFoundError("Budget version");
      if (result === undefined) throw new NotFoundError("Budget scope line");
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "BUDGET_LOCKED") {
        throw new ConflictError(
          "Budget plan is locked; scope-line edits are not permitted",
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