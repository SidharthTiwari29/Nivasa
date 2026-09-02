export type DesignBattleMetric<T> =
  { value: T; available: true } | { available: false; reason: string };

export type DesignBattleSide = {
  projectId: string;
  projectName: string;
  cost: DesignBattleMetric<{ totalMinor: bigint; currency: string }>;
  storage: DesignBattleMetric<number>;
  durability: DesignBattleMetric<number>;
  maintenance: DesignBattleMetric<string>;
  styleMatch: DesignBattleMetric<number>;
};

export type DesignBattleResult = {
  a: DesignBattleSide;
  b: DesignBattleSide;
  // README section 32: "Niwasthan recommendation ⭐/⭐⭐⭐". A star rating
  // implies a holistic judgment across cost, storage, durability,
  // maintenance, and style match - this system only has real, computed
  // data for cost right now. Fabricating a rating from one out of five
  // dimensions would misrepresent it as a holistic recommendation it
  // isn't. Per section 32's own closing line ("Exact metrics and scoring
  // must become evidence-based as the system matures"), this stays
  // explicitly unavailable until the other four dimensions have real,
  // computed data behind them too - not approximated from cost alone.
  recommendation: DesignBattleMetric<"A" | "B">;
};

const NOT_YET_AVAILABLE = "This metric is not yet computed by the system";

function unavailable<T>(
  reason: string = NOT_YET_AVAILABLE,
): DesignBattleMetric<T> {
  return { available: false, reason };
}

// Real, evidence-based comparison for the one dimension this system
// actually computes today: the total cost of each design's real BOQ,
// built from real catalogue-priced line items (README section 20's
// "design-to-product grounding" is exactly what makes this cost figure
// real rather than estimated). Every other dimension is explicitly
// marked unavailable rather than approximated or guessed.
export function compareDesigns(
  a: {
    projectId: string;
    projectName: string;
    boq: { totalMinor: bigint; currency: string } | null;
  },
  b: {
    projectId: string;
    projectName: string;
    boq: { totalMinor: bigint; currency: string } | null;
  },
): DesignBattleResult {
  const buildSide = (input: typeof a): DesignBattleSide => ({
    projectId: input.projectId,
    projectName: input.projectName,
    cost: input.boq
      ? { available: true, value: input.boq }
      : unavailable("No BOQ has been created for this design yet"),
    storage: unavailable(),
    durability: unavailable(),
    maintenance: unavailable(),
    styleMatch: unavailable(),
  });

  return {
    a: buildSide(a),
    b: buildSide(b),
    recommendation: unavailable(
      "A holistic recommendation requires storage, durability, and style-match data this system does not compute yet - only cost is currently evidence-based",
    ),
  };
}
