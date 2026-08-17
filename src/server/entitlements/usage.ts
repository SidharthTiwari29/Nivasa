export type EntitlementBalance = { entitlementId: string; remaining: number; reserved: number };
export type Reservation = { entitlementId: string; quantity: number; reservationId: string };

export function canReserve(balance: EntitlementBalance, quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && balance.remaining - balance.reserved >= quantity;
}

export function reserveUsage(balance: EntitlementBalance, quantity: number, reservationId: string): Reservation {
  if (!canReserve(balance, quantity)) throw new Error('INSUFFICIENT_ENTITLEMENT_BALANCE');
  return { entitlementId: balance.entitlementId, quantity, reservationId };
}
