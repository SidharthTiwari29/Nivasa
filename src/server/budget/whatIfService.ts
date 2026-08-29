export interface BudgetLine {
  id: string;
  amountMinor: bigint;
}

export interface BudgetScenario {
  name: string;
  lines: readonly BudgetLine[];
}

export interface BudgetDelta {
  baselineMinor: bigint;
  scenarioMinor: bigint;
  savingsMinor: bigint;
  savingsBps: number;
  changedLineIds: string[];
}

export function calculateBudgetScenario(
  baseline: BudgetScenario,
  scenario: BudgetScenario,
): BudgetDelta {
  const baselineMinor = baseline.lines.reduce(
    (sum, line) => sum + line.amountMinor,
    0n,
  );
  const scenarioMinor = scenario.lines.reduce(
    (sum, line) => sum + line.amountMinor,
    0n,
  );
  if (baselineMinor < 0n || scenarioMinor < 0n)
    throw new Error("budget amounts cannot be negative");

  const baselineById = new Map(
    baseline.lines.map((line) => [line.id, line.amountMinor]),
  );
  const changedLineIds = scenario.lines
    .filter((line) => baselineById.get(line.id) !== line.amountMinor)
    .map((line) => line.id)
    .sort();

  const savingsMinor =
    baselineMinor > scenarioMinor ? baselineMinor - scenarioMinor : 0n;
  const savingsBps =
    baselineMinor === 0n ? 0 : Number((savingsMinor * 10_000n) / baselineMinor);
  return {
    baselineMinor,
    scenarioMinor,
    savingsMinor,
    savingsBps,
    changedLineIds,
  };
}
