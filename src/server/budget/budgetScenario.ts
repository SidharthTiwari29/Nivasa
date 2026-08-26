export interface BudgetScopeLine { id: string; roomId: string; amountMinor: bigint; source?: string; }
export interface BudgetVersion { id: string; name: string; lines: readonly BudgetScopeLine[]; locked: boolean; }
export interface BudgetImpact { baselineMinor: bigint; revisedMinor: bigint; deltaMinor: bigint; changedLineIds: string[]; }

export function calculateRevisionImpact(baseline: BudgetVersion, revised: BudgetVersion): BudgetImpact {
  if (!baseline.locked) throw new Error("baseline budget must be locked");
  if (revised.locked) throw new Error("revised budget must be editable");
  const baselineMinor = baseline.lines.reduce((sum, line) => sum + line.amountMinor, 0n);
  const revisedMinor = revised.lines.reduce((sum, line) => sum + line.amountMinor, 0n);
  if (baselineMinor < 0n || revisedMinor < 0n) throw new Error("budget amounts cannot be negative");
  const baselineById = new Map(baseline.lines.map((line) => [line.id, line.amountMinor]));
  const revisedById = new Map(revised.lines.map((line) => [line.id, line.amountMinor]));
  const ids = new Set([...baselineById.keys(), ...revisedById.keys()]);
  const changedLineIds = [...ids].filter((id) => baselineById.get(id) !== revisedById.get(id)).sort();
  return { baselineMinor, revisedMinor, deltaMinor: revisedMinor - baselineMinor, changedLineIds };
}
