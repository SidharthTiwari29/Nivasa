export type PaymentStatus = 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
const transitions: Record<PaymentStatus, PaymentStatus[]> = {
  CREATED: ['PENDING', 'FAILED'],
  PENDING: ['AUTHORIZED', 'CAPTURED', 'FAILED'],
  AUTHORIZED: ['CAPTURED', 'FAILED'],
  CAPTURED: ['REFUNDED'],
  FAILED: [],
  REFUNDED: [],
};
export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return transitions[from].includes(to);
}
