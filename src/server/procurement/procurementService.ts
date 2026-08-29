export type ProcurementState =
  | "DRAFT"
  | "RFQ_READY"
  | "RFQ_SENT"
  | "QUOTE_RECEIVED"
  | "APPROVED"
  | "ORDERED";

export interface ProcurementItem {
  catalogueItemId: string;
  quantity: number;
  unitPriceMinor: bigint;
  evidenceId: string;
}

export interface ProcurementRequest {
  id: string;
  projectId: string;
  boqId: string;
  state: ProcurementState;
  items: readonly ProcurementItem[];
}

const transitions: Record<ProcurementState, ProcurementState[]> = {
  DRAFT: ["RFQ_READY"],
  RFQ_READY: ["RFQ_SENT"],
  RFQ_SENT: ["QUOTE_RECEIVED"],
  QUOTE_RECEIVED: ["APPROVED"],
  APPROVED: ["ORDERED"],
  ORDERED: [],
};

export function validateProcurementRequest(request: ProcurementRequest): void {
  if (!request.id.trim() || !request.projectId.trim() || !request.boqId.trim())
    throw new Error("procurement identity is required");
  if (!request.items.length)
    throw new Error("procurement requires at least one item");
  for (const item of request.items) {
    if (!item.catalogueItemId.trim())
      throw new Error("catalogue item is required");
    if (!Number.isFinite(item.quantity) || item.quantity <= 0)
      throw new Error("quantity must be greater than zero");
    if (item.unitPriceMinor < 0n)
      throw new Error("unit price cannot be negative");
    if (!item.evidenceId.trim()) throw new Error("price evidence is required");
  }
}

export function advanceProcurement(
  request: ProcurementRequest,
  next: ProcurementState,
): ProcurementRequest {
  validateProcurementRequest(request);
  if (!transitions[request.state].includes(next))
    throw new Error(
      `invalid procurement transition: ${request.state} -> ${next}`,
    );
  return { ...request, state: next };
}
