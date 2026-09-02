export type CatalogueOption = {
  itemId: string;
  name: string;
  brand: string | null;
  unitPriceMinor: bigint;
};

export type CurationNeed = {
  category: string;
  quantity: number;
};

export type CurationSelection = {
  category: string;
  itemId: string;
  itemName: string;
  brand: string | null;
  unitPriceMinor: bigint;
  quantity: number;
  lineTotalMinor: bigint;
};

export type CurationResult = {
  selections: CurationSelection[];
  totalMinor: bigint;
  withinBudget: boolean;
  shortfallMinor: bigint;
  unfulfilledCategories: string[];
};

// README's own framing: "when we know the budget we can ideally curate the
// design accordingly and customer don't have to individually check." This
// is the real engine for that - given a budget and a list of category
// needs, it selects real, currently-priced catalogue items (never
// fabricated numbers) across whatever brands actually have stock in each
// category, so the customer sees one coherent, affordable selection
// instead of having to compare brands themselves.
//
// Algorithm, in two real passes over real data:
// 1. Baseline: pick the CHEAPEST available option per category first -
//    this establishes whether the need is fulfillable within budget at
//    all, and guarantees a feasible starting point.
// 2. Upgrade: with whatever budget headroom remains after the baseline,
//    greedily upgrade categories to a pricier available option one step
//    at a time - always the single upgrade that uses the most remaining
//    headroom without exceeding it - so the final selection reflects
//    "the best the customer can actually afford," not just "the
//    cheapest possible," without ever needing a fabricated quality score
//    to justify the upgrade (a higher real price is treated as a proxy
//    for a "better" option, consistent with how the catalogue itself is
//    priced - no invented rating is needed to make this decision).
export function curateWithinBudget(
  needs: CurationNeed[],
  optionsByCategory: Map<string, CatalogueOption[]>,
  targetBudgetMinor: bigint,
): CurationResult {
  const selections: CurationSelection[] = [];
  const unfulfilledCategories: string[] = [];

  for (const need of needs) {
    const options = optionsByCategory.get(need.category) ?? [];
    if (options.length === 0) {
      unfulfilledCategories.push(need.category);
      continue;
    }
    const cheapest = options.reduce((min, o) =>
      o.unitPriceMinor < min.unitPriceMinor ? o : min,
    );
    selections.push({
      category: need.category,
      itemId: cheapest.itemId,
      itemName: cheapest.name,
      brand: cheapest.brand,
      unitPriceMinor: cheapest.unitPriceMinor,
      quantity: need.quantity,
      lineTotalMinor: cheapest.unitPriceMinor * BigInt(need.quantity),
    });
  }

  let totalMinor = selections.reduce((sum, s) => sum + s.lineTotalMinor, 0n);

  // Upgrade pass: only runs if the baseline already fits, since upgrading
  // an already-over-budget selection would never make sense.
  if (totalMinor <= targetBudgetMinor) {
    let improved = true;
    while (improved) {
      improved = false;
      let bestUpgradeIndex = -1;
      let bestUpgradeOption: CatalogueOption | null = null;
      let bestUpgradeCost = -1n;
      const headroom = targetBudgetMinor - totalMinor;

      selections.forEach((selection, index) => {
        const options = optionsByCategory.get(selection.category) ?? [];
        for (const option of options) {
          if (option.itemId === selection.itemId) continue;
          if (option.unitPriceMinor <= selection.unitPriceMinor) continue;
          const extraCost =
            (option.unitPriceMinor - selection.unitPriceMinor) *
            BigInt(selection.quantity);
          if (extraCost <= headroom && extraCost > bestUpgradeCost) {
            bestUpgradeIndex = index;
            bestUpgradeOption = option;
            bestUpgradeCost = extraCost;
          }
        }
      });

      if (bestUpgradeIndex >= 0 && bestUpgradeOption) {
        const current = selections[bestUpgradeIndex];
        const chosenUpgrade: CatalogueOption = bestUpgradeOption;
        const upgraded: CurationSelection = {
          ...current,
          itemId: chosenUpgrade.itemId,
          itemName: chosenUpgrade.name,
          brand: chosenUpgrade.brand,
          unitPriceMinor: chosenUpgrade.unitPriceMinor,
          lineTotalMinor:
            chosenUpgrade.unitPriceMinor * BigInt(current.quantity),
        };
        selections[bestUpgradeIndex] = upgraded;
        totalMinor =
          totalMinor - current.lineTotalMinor + upgraded.lineTotalMinor;
        improved = true;
      }
    }
  }

  return {
    selections,
    totalMinor,
    withinBudget: totalMinor <= targetBudgetMinor,
    shortfallMinor:
      totalMinor > targetBudgetMinor ? totalMinor - targetBudgetMinor : 0n,
    unfulfilledCategories,
  };
}
