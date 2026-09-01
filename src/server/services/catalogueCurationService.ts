import { catalogueCurationRepository } from "@/server/repositories/catalogueCurationRepository";
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
};
