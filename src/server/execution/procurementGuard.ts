export type ProcurementStatus = "DRAFT" | "RFQ_READY" | "RFQ_SENT" | "QUOTE_RECEIVED" | "APPROVED" | "ORDERED";

export interface ProcurementLine {
  catalogueItemId: string;
  quantity: number;
  unitPriceMinor?: bigint;
  evidenceId?: string;
}

export interface ProcurementReadiness {
  ready: boolean;
  missing: string[];
}

/** A procurement request is not executable until its commercial evidence is complete. */
export function assessProcurementReadiness(lines: readonly ProcurementLine[], buildable: boolean): ProcurementReadiness {
  const missing: string[] = [];
  if (!buildable) missing.push("BUILDABILITY_BLOCKER");
  if (lines.length === 0) missing.push("NO_LINES");

  for (const [index, line] of lines.entries()) {
    if (!line.catalogueItemId.trim()) missing.push(`LINE_${index}_CATALOGUE_ITEM_REQUIRED`);
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) missing.push(`LINE_${index}_QUANTITY_REQUIRED`);
    if (line.unitPriceMinor !== undefined && line.unitPriceMinor < 0n) missing.push(`LINE_${index}_PRICE_INVALID`);
    if (line.unitPriceMinor !== undefined && !line.evidenceId) missing.push(`LINE_${index}_PRICE_EVIDENCE_REQUIRED`);
  }

  return { ready: missing.length === 0, missing };
}
