export type ProcurementStage =
  | "DRAFT"
  | "RFQ_READY"
  | "RFQ_SENT"
  | "QUOTE_RECEIVED"
  | "APPROVED"
  | "ORDERED";

const stages: ProcurementStage[] = [
  "DRAFT",
  "RFQ_READY",
  "RFQ_SENT",
  "QUOTE_RECEIVED",
  "APPROVED",
  "ORDERED",
];

export interface ProcurementEvent {
  stage: ProcurementStage;
  occurredAt: Date;
  actorId: string;
}

export function advanceProcurement(
  events: readonly ProcurementEvent[],
  next: ProcurementEvent,
): ProcurementEvent[] {
  if (!next.actorId.trim()) throw new Error("actor is required");
  const current = events.at(-1)?.stage ?? "DRAFT";
  if (stages.indexOf(next.stage) !== stages.indexOf(current) + 1) {
    throw new Error(
      `invalid procurement transition: ${current} -> ${next.stage}`,
    );
  }
  return [...events, next];
}
