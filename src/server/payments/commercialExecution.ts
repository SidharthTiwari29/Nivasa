export type CommercialStatus =
  "QUOTED" | "ACCEPTED" | "INVOICED" | "PAID" | "CANCELLED";

export type CommercialAction = "ACCEPT" | "INVOICE" | "MARK_PAID" | "CANCEL";

const transitions: Record<
  CommercialStatus,
  Partial<Record<CommercialAction, CommercialStatus>>
> = {
  QUOTED: { ACCEPT: "ACCEPTED", CANCEL: "CANCELLED" },
  ACCEPTED: { INVOICE: "INVOICED", CANCEL: "CANCELLED" },
  INVOICED: { MARK_PAID: "PAID", CANCEL: "CANCELLED" },
  PAID: {},
  CANCELLED: {},
};

export function transitionCommercial(
  status: CommercialStatus,
  action: CommercialAction,
): CommercialStatus {
  const next = transitions[status][action];
  if (!next)
    throw new Error(`INVALID_COMMERCIAL_TRANSITION:${status}:${action}`);
  return next;
}

export function canTransitionCommercial(
  status: CommercialStatus,
  action: CommercialAction,
): boolean {
  return transitions[status][action] !== undefined;
}
