export interface ClearanceRule {
  code: string;
  minimumMm: number;
  message: string;
}

export interface ClearanceInput {
  itemId: string;
  frontClearanceMm?: number;
  sideClearanceMm?: number;
  rules?: readonly ClearanceRule[];
}

export interface ClearanceFinding {
  code: string;
  severity: "BLOCKER" | "WARNING";
  itemId: string;
  message: string;
  actualMm?: number;
  requiredMm?: number;
}

export function checkClearances(input: ClearanceInput): ClearanceFinding[] {
  const findings: ClearanceFinding[] = [];
  for (const rule of input.rules ?? []) {
    const actual = rule.code.includes("FRONT")
      ? input.frontClearanceMm
      : input.sideClearanceMm;
    if (actual !== undefined && actual < rule.minimumMm) {
      findings.push({
        code: rule.code,
        severity: "BLOCKER",
        itemId: input.itemId,
        message: rule.message,
        actualMm: actual,
        requiredMm: rule.minimumMm,
      });
    }
  }
  return findings;
}
