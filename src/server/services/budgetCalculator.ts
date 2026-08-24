export interface BudgetRange {
  lowMinor: bigint;
  targetMinor: bigint;
  highMinor: bigint;
}

export function calculateBudgetTotals(
  lines: BudgetRange[],
  contingencyMinor = 0n,
): BudgetRange {
  if (contingencyMinor < 0n) throw new Error("INVALID_CONTINGENCY");

  return lines.reduce(
    (totals, line) => {
      if (
        line.lowMinor < 0n ||
        line.targetMinor < 0n ||
        line.highMinor < 0n ||
        line.lowMinor > line.targetMinor ||
        line.targetMinor > line.highMinor
      ) {
        throw new Error("INVALID_BUDGET_RANGE");
      }

      return {
        lowMinor: totals.lowMinor + line.lowMinor,
        targetMinor: totals.targetMinor + line.targetMinor,
        highMinor: totals.highMinor + line.highMinor,
      };
    },
    { lowMinor: contingencyMinor, targetMinor: contingencyMinor, highMinor: contingencyMinor },
  );
}
