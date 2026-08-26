export type ExecutionStage = "DESIGN_APPROVED" | "BOQ_LOCKED" | "QUOTE_REQUESTED" | "QUOTE_RECEIVED" | "ORDERED" | "IN_PRODUCTION" | "IN_TRANSIT" | "INSTALLATION" | "COMPLETED";

export interface ExecutionMilestone {
  stage: ExecutionStage;
  occurredAt?: Date;
  note?: string;
}

const order: ExecutionStage[] = [
  "DESIGN_APPROVED", "BOQ_LOCKED", "QUOTE_REQUESTED", "QUOTE_RECEIVED", "ORDERED",
  "IN_PRODUCTION", "IN_TRANSIT", "INSTALLATION", "COMPLETED",
];

export function canAdvanceExecution(current: ExecutionStage | undefined, next: ExecutionStage): boolean {
  if (!current) return next === "DESIGN_APPROVED";
  return order.indexOf(next) === order.indexOf(current) + 1;
}

export function advanceExecution(
  milestones: readonly ExecutionMilestone[],
  next: ExecutionMilestone,
): ExecutionMilestone[] {
  const current = milestones.at(-1)?.stage;
  if (!canAdvanceExecution(current, next.stage)) {
    throw new Error(`invalid execution transition: ${current ?? "START"} -> ${next.stage}`);
  }
  return [...milestones, next];
}
