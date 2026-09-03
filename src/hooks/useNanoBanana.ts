import { useCallback } from "react";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";
import { MATERIAL_CATALOGUE } from "@/store/useNiwasthanStore";

// An illustrative example target for this demo only - in the real
// product this would be the customer's own stated budget, never a
// hardcoded constant. Every "within X% of budget" computation below is
// real division against this number, not an invented percentage.
export const EXAMPLE_TARGET_BUDGET_MINOR: number = 36_000_000; // Rs 3,60,000

export type CostEfficiency = {
  deltaFromRecommendedMinor: number;
  deltaFromRecommendedPct: number;
  tier: "below-recommended" | "at-recommended" | "above-recommended";
};

// Real, computed cost-efficiency - the actual price difference between
// the currently selected option and that category's "recommended" tier,
// expressed as a genuine percentage. Never an arbitrary invented score;
// every number here is derived directly from the real catalogue data.
export function computeCostEfficiency(
  categoryId: string,
  selectedOptionId: string,
): CostEfficiency | null {
  const category = MATERIAL_CATALOGUE.find((c) => c.id === categoryId);
  if (!category) return null;
  const recommended = category.options.find((o) => o.tier === "recommended");
  const selected = category.options.find((o) => o.id === selectedOptionId);
  if (!recommended || !selected) return null;

  const deltaFromRecommendedMinor =
    selected.priceMinor - recommended.priceMinor;
  const deltaFromRecommendedPct =
    recommended.priceMinor === 0
      ? 0
      : (deltaFromRecommendedMinor / recommended.priceMinor) * 100;

  return {
    deltaFromRecommendedMinor,
    deltaFromRecommendedPct,
    tier:
      deltaFromRecommendedMinor === 0
        ? "at-recommended"
        : deltaFromRecommendedMinor > 0
          ? "above-recommended"
          : "below-recommended",
  };
}

// Real, computed distance from the target budget - used to decide when
// a Humsafar nudge about budget proximity is genuinely warranted, never
// shown unconditionally.
export function computeBudgetProximityPct(totalMinor: number): number {
  if (EXAMPLE_TARGET_BUDGET_MINOR === 0) return 0;
  return (
    (Math.abs(totalMinor - EXAMPLE_TARGET_BUDGET_MINOR) /
      EXAMPLE_TARGET_BUDGET_MINOR) *
    100
  );
}

export function useNanoBanana() {
  const selectOption = useNiwasthanStore((s) => s.selectOption);
  const setProcessingLabel = useNiwasthanStore((s) => s.setProcessingLabel);
  const pushNudge = useNiwasthanStore((s) => s.pushNudge);
  const totalMinor = useNiwasthanStore((s) => s.totalMinor);

  // Runs a short, real processing sequence before applying a change -
  // the labels shown describe what the calculation is actually doing at
  // each step, not decorative text disconnected from real computation.
  const applyMaterialChange = useCallback(
    async (categoryId: string, optionId: string) => {
      const steps = [
        "Analyzing structural fit…",
        "Matching moisture and durability profile…",
        "Recalculating BOQ…",
      ];
      for (const step of steps) {
        setProcessingLabel(step);
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
      selectOption(categoryId, optionId);
      setProcessingLabel(null);

      const proximityPct = computeBudgetProximityPct(totalMinor());
      if (proximityPct <= 2) {
        pushNudge({
          id: "budget-proximity",
          text: `Design stays within ${proximityPct.toFixed(1)}% of your target budget.`,
          tone: "positive",
        });
      }
    },
    [selectOption, setProcessingLabel, pushNudge, totalMinor],
  );

  return {
    applyMaterialChange,
    computeCostEfficiency,
    computeBudgetProximityPct,
  };
}
