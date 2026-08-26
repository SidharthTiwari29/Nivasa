import { assessProcurementReadiness, type ProcurementLine } from "./procurementGuard";
import { calculateQuoteTotal, type SupplierQuote } from "./quote";

export type ProcurementDecision = "BLOCKED" | "READY_FOR_RFQ" | "QUOTE_ACCEPTABLE";

export interface ProcurementAssessment {
  decision: ProcurementDecision;
  missing: string[];
  quoteTotalMinor?: bigint;
  currency?: string;
}

export function assessForRfq(lines: readonly ProcurementLine[], buildable: boolean): ProcurementAssessment {
  const readiness = assessProcurementReadiness(lines, buildable);
  return readiness.ready
    ? { decision: "READY_FOR_RFQ", missing: [] }
    : { decision: "BLOCKED", missing: readiness.missing };
}

export function assessSupplierQuote(
  lines: readonly ProcurementLine[],
  buildable: boolean,
  quote: SupplierQuote,
  now = new Date(),
): ProcurementAssessment {
  const readiness = assessProcurementReadiness(lines, buildable);
  if (!readiness.ready) return { decision: "BLOCKED", missing: readiness.missing };
  const total = calculateQuoteTotal(quote, now);
  return { decision: "QUOTE_ACCEPTABLE", missing: [], quoteTotalMinor: total.subtotalMinor, currency: total.currency };
}
