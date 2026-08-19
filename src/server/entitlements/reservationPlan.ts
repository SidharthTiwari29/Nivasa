export type UsageReservationStatus = 'RESERVED' | 'CONFIRMED' | 'RELEASED';

export type AtomicReservationCommand = {
  userId: string;
  entitlementCode: string;
  quantity: number;
  idempotencyKey: string;
};

export type AtomicReservationPlan = {
  transactionRequired: true;
  idempotencyKey: string;
  lock: 'entitlement_grant_row';
  steps: readonly [
    'find_existing_usage_record_by_idempotency_key',
    'select_active_entitlement_grant_for_update',
    'verify_remaining_minus_reserved_covers_quantity',
    'increment_reserved_and_create_usage_record',
  ];
};

export function buildAtomicReservationPlan(command: AtomicReservationCommand): AtomicReservationPlan {
  if (!Number.isInteger(command.quantity) || command.quantity <= 0) throw new Error('INVALID_USAGE_QUANTITY');
  return {
    transactionRequired: true,
    idempotencyKey: command.idempotencyKey,
    lock: 'entitlement_grant_row',
    steps: [
      'find_existing_usage_record_by_idempotency_key',
      'select_active_entitlement_grant_for_update',
      'verify_remaining_minus_reserved_covers_quantity',
      'increment_reserved_and_create_usage_record',
    ],
  };
}
