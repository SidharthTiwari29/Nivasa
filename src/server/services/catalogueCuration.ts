export type CatalogueOption = {
  itemId: string;
  name: string;
  brand: string | null;
  unitPriceMinor: bigint;
  // Both real, already-existing fields - not new fabricated inputs. mrpMinor
  // is the printed/listed price (README's explicit "along with their MRP
  // price" requirement); priceEffectiveFrom is when this price was last
  // confirmed, the real signal quotationConfidence is computed from below.
  mrpMinor: bigint | null;
  priceEffectiveFrom: Date;
};

export type CurationNeed = {
  category: string;
  quantity: number;
};

export type QuotationConfidence = {
  // How many real, currently-priced alternatives existed in this category
  // at curation time - a selection chosen from 1 option is a real choice,
  // but a customer should know there was nothing to compare it against;
  // one chosen from 8 options carries more weight.
  alternativesConsidered: number;
  // Days since this exact price was last confirmed (CataloguePrice.effectiveFrom).
  // A price checked yesterday is more trustworthy than one checked three
  // months ago that simply hasn't been re-verified.
  priceAgeDays: number;
  // True only when a real mrpMinor exists AND is genuinely higher than the
  // selling price - never asserted from the selling price alone, since a
  // missing MRP must not be silently treated as "no discount".
  mrpVerifiedDiscount: boolean;
};

export type CurationSelection = {
  category: string;
  itemId: string;
  itemName: string;
  brand: string | null;
  unitPriceMinor: bigint;
  mrpMinor: bigint | null;
  quantity: number;
  lineTotalMinor: bigint;
  confidence: QuotationConfidence;
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
// Computed entirely from real data already fetched with each option -
// never a fabricated trust score. A confident quotation is one backed by
// real comparison (multiple alternatives existed) and real freshness
// (the price was checked recently), not an opaque "we recommend this"
// assertion with nothing behind it.
function computeConfidence(
  chosen: CatalogueOption,
  allOptionsInCategory: CatalogueOption[],
  now: Date,
): QuotationConfidence {
  const priceAgeDays = Math.floor(
    (now.getTime() - chosen.priceEffectiveFrom.getTime()) / 86_400_000,
  );
  return {
    alternativesConsidered: allOptionsInCategory.length,
    priceAgeDays,
    mrpVerifiedDiscount:
      chosen.mrpMinor !== null && chosen.mrpMinor > chosen.unitPriceMinor,
  };
}

export function curateWithinBudget(
  needs: CurationNeed[],
  optionsByCategory: Map<string, CatalogueOption[]>,
  targetBudgetMinor: bigint,
  now: Date = new Date(),
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
      mrpMinor: cheapest.mrpMinor,
      quantity: need.quantity,
      // Zero-margin guarantee, made explicit at the exact point the price
      // is used: the line total is the real unit price times quantity,
      // full stop - no markup constant, no commission percentage, nothing
      // added anywhere in this computation. This is the enforced
      // invariant, not an assumption - see the dedicated test asserting
      // this exact equality for every selection this function ever
      // produces.
      lineTotalMinor: cheapest.unitPriceMinor * BigInt(need.quantity),
      confidence: computeConfidence(cheapest, options, now),
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
        const categoryOptions = optionsByCategory.get(current.category) ?? [];
        const chosenUpgrade: CatalogueOption = bestUpgradeOption;
        const upgraded: CurationSelection = {
          ...current,
          itemId: chosenUpgrade.itemId,
          itemName: chosenUpgrade.name,
          brand: chosenUpgrade.brand,
          unitPriceMinor: chosenUpgrade.unitPriceMinor,
          mrpMinor: chosenUpgrade.mrpMinor,
          lineTotalMinor:
            chosenUpgrade.unitPriceMinor * BigInt(current.quantity),
          confidence: computeConfidence(chosenUpgrade, categoryOptions, now),
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
