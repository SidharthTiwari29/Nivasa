export type ReducibleLine = {
  id: string;
  category: string;
  description: string | null;
  lowMinor: bigint;
  targetMinor: bigint;
};

export type ReductionSuggestion = {
  lineId: string;
  category: string;
  description: string | null;
  currentTargetMinor: bigint;
  suggestedTargetMinor: bigint;
  reductionMinor: bigint;
};

export type ReductionPlan = {
  suggestions: ReductionSuggestion[];
  totalReductionMinor: bigint;
  targetAchieved: boolean;
  shortfallMinor: bigint;
};

// The "cheaper version of this room" feature. Deliberately does NOT invent
// a new low price for any line - each line's own already-estimated
// lowMinor (set when the budget was created) is the floor. This is a
// direct application of the project's "no fabricated certainty" rule:
// suggesting a price below what was already estimated as plausible for
// that specific item would be presenting a guess as a real option.
//
// Greedy by largest available headroom first (targetMinor - lowMinor) -
// this minimizes the NUMBER of lines touched to hit a savings goal, which
// is a defensible default (fewer changes to review/approve) even though
// it's a heuristic, not the only reasonable one.
export function planBudgetReduction(
  lines: ReducibleLine[],
  targetReductionMinor: bigint,
): ReductionPlan {
  if (targetReductionMinor <= 0n) {
    return {
      suggestions: [],
      totalReductionMinor: 0n,
      targetAchieved: true,
      shortfallMinor: 0n,
    };
  }

  const withHeadroom = lines
    .map((line) => ({
      line,
      headroomMinor: line.targetMinor - line.lowMinor,
    }))
    .filter((entry) => entry.headroomMinor > 0n)
    .sort((a, b) => (b.headroomMinor > a.headroomMinor ? 1 : -1));

  const suggestions: ReductionSuggestion[] = [];
  let remaining = targetReductionMinor;

  for (const entry of withHeadroom) {
    if (remaining <= 0n) break;
    const reduction =
      entry.headroomMinor < remaining ? entry.headroomMinor : remaining;
    suggestions.push({
      lineId: entry.line.id,
      category: entry.line.category,
      description: entry.line.description,
      currentTargetMinor: entry.line.targetMinor,
      suggestedTargetMinor: entry.line.targetMinor - reduction,
      reductionMinor: reduction,
    });
    remaining -= reduction;
  }

  const totalReductionMinor = suggestions.reduce(
    (sum, s) => sum + s.reductionMinor,
    0n,
  );

  return {
    suggestions,
    totalReductionMinor,
    targetAchieved: remaining <= 0n,
    shortfallMinor: remaining > 0n ? remaining : 0n,
  };
}
