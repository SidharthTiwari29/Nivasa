export interface WhatIfLine {
  id: string;
  label: string;
  currentMinor: bigint;
  alternativeMinor: bigint;
  confidenceBps: number;
}

export interface WhatIfResult {
  currentTotalMinor: bigint;
  alternativeTotalMinor: bigint;
  savingMinor: bigint;
  savingBps: number;
  lines: WhatIfLine[];
}

/** Deterministic scenario calculator. It never mutates the selected design or budget. */
export function calculateWhatIf(lines: readonly WhatIfLine[]): WhatIfResult {
  for (const line of lines) {
    if (line.currentMinor < 0n || line.alternativeMinor < 0n) throw new Error("scenario prices cannot be negative");
    if (!Number.isInteger(line.confidenceBps) || line.confidenceBps < 0 || line.confidenceBps > 10_000) {
      throw new Error("confidenceBps must be an integer between 0 and 10000");
    }
  }

  const currentTotalMinor = lines.reduce((sum, line) => sum + line.currentMinor, 0n);
  const alternativeTotalMinor = lines.reduce((sum, line) => sum + line.alternativeMinor, 0n);
  const savingMinor = currentTotalMinor > alternativeTotalMinor ? currentTotalMinor - alternativeTotalMinor : 0n;
  const savingBps = currentTotalMinor === 0n ? 0 : Number((savingMinor * 10_000n) / currentTotalMinor);

  return { currentTotalMinor, alternativeTotalMinor, savingMinor, savingBps, lines: [...lines] };
}
