export interface BoqLineSnapshot { id: string; roomId: string; catalogueItemId: string; quantity: number; unitPriceMinor: bigint; }
export interface BoqImpact { baselineMinor: bigint; revisedMinor: bigint; deltaMinor: bigint; changedLineIds: string[]; }

export function calculateBoqImpact(baseline: readonly BoqLineSnapshot[], revised: readonly BoqLineSnapshot[]): BoqImpact {
  const total = (lines: readonly BoqLineSnapshot[]) => lines.reduce((sum, line) => {
    if (!line.id.trim() || !line.roomId.trim() || !line.catalogueItemId.trim() || !Number.isFinite(line.quantity) || line.quantity <= 0 || line.unitPriceMinor < 0n) throw new Error("invalid BOQ line");
    return sum + BigInt(line.quantity) * line.unitPriceMinor;
  }, 0n);
  const baselineMinor = total(baseline);
  const revisedMinor = total(revised);
  const byId = new Map(baseline.map((line) => [line.id, `${line.quantity}:${line.unitPriceMinor}`]));
  const ids = new Set([...byId.keys(), ...revised.map((line) => line.id)]);
  const revisedById = new Map(revised.map((line) => [line.id, `${line.quantity}:${line.unitPriceMinor}`]));
  const changedLineIds = [...ids].filter((id) => byId.get(id) !== revisedById.get(id)).sort();
  return { baselineMinor, revisedMinor, deltaMinor: revisedMinor - baselineMinor, changedLineIds };
}
