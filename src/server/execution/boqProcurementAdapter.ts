import { assessProcurementReadiness, type ProcurementLine } from "./procurementGuard";

export interface BoqForProcurement {
  status: "DRAFT" | "FINALIZED";
  lines: readonly {
    catalogueItemId: string | null;
    quantity: number;
    unitPriceMinor: bigint;
    evidenceId?: string;
  }[];
}

export function procurementLinesFromBoq(boq: BoqForProcurement): ProcurementLine[] {
  if (boq.status !== "FINALIZED") throw new Error("BOQ must be finalized before procurement");
  return boq.lines.map((line) => ({
    catalogueItemId: line.catalogueItemId ?? "",
    quantity: line.quantity,
    unitPriceMinor: line.unitPriceMinor,
    evidenceId: line.evidenceId,
  }));
}

export function assessFinalizedBoqForProcurement(boq: BoqForProcurement, buildable: boolean) {
  return assessProcurementReadiness(procurementLinesFromBoq(boq), buildable);
}
