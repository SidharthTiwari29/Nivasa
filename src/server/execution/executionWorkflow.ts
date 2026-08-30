export const EXECUTION_STATES = [
  "DRAFT",
  "READY",
  "APPROVAL_PENDING",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type ExecutionState = (typeof EXECUTION_STATES)[number];

export type ExecutionAction =
  "SUBMIT" | "APPROVE" | "START" | "COMPLETE" | "CANCEL";

const transitions: Record<
  ExecutionState,
  Partial<Record<ExecutionAction, ExecutionState>>
> = {
  DRAFT: { SUBMIT: "READY", CANCEL: "CANCELLED" },
  READY: { SUBMIT: "APPROVAL_PENDING", CANCEL: "CANCELLED" },
  APPROVAL_PENDING: { APPROVE: "APPROVED", CANCEL: "CANCELLED" },
  APPROVED: { START: "IN_PROGRESS", CANCEL: "CANCELLED" },
  IN_PROGRESS: { COMPLETE: "COMPLETED", CANCEL: "CANCELLED" },
  COMPLETED: {},
  CANCELLED: {},
};

export function transitionExecution(
  state: ExecutionState,
  action: ExecutionAction,
): ExecutionState {
  const next = transitions[state][action];
  if (!next) throw new Error(`INVALID_EXECUTION_TRANSITION:${state}:${action}`);
  return next;
}

export function canTransitionExecution(
  state: ExecutionState,
  action: ExecutionAction,
): boolean {
  return transitions[state][action] !== undefined;
}
