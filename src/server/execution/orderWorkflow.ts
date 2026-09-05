export const ORDER_STATES = [
  "PLACED",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

const transitions: Record<
  OrderState,
  Partial<Record<OrderState, OrderState>>
> = {
  PLACED: { CONFIRMED: "CONFIRMED", CANCELLED: "CANCELLED" },
  CONFIRMED: { DISPATCHED: "DISPATCHED", CANCELLED: "CANCELLED" },
  DISPATCHED: { DELIVERED: "DELIVERED" },
  DELIVERED: {},
  CANCELLED: {},
};

export function transitionOrder(
  state: OrderState,
  nextState: OrderState,
): OrderState {
  const next = transitions[state][nextState];
  if (!next) {
    throw new Error(`INVALID_ORDER_TRANSITION:${state}:${nextState}`);
  }
  return next;
}

export function canTransitionOrder(
  state: OrderState,
  nextState: OrderState,
): boolean {
  return transitions[state][nextState] !== undefined;
}
