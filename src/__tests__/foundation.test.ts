import { describe, expect, it } from 'vitest';
import { canReserve, reserveUsage } from '@/server/entitlements/usage';
import { getConfiguredPackagePrice } from '@/server/catalogue/pricing';
import { calculateTax } from '@/server/costing/tax';
import { calculateEstimate } from '@/server/costing/estimate';
import { buildBoqSnapshot } from '@/server/boq/boq';
import { canTransitionPayment } from '@/server/payments/state';
import { webhookIdempotencyKey } from '@/server/payments/webhook';
import { buildAtomicReservationPlan } from '@/server/entitlements/reservationPlan';

describe('Phase 0 business foundations', () => {
  it('prevents entitlement over-reservation', () => {
    const balance = { entitlementId: 'ent_1', remaining: 3, reserved: 2 };
    expect(canReserve(balance, 1)).toBe(true);
    expect(canReserve(balance, 2)).toBe(false);
    expect(() => reserveUsage(balance, 2, 'res_1')).toThrow('INSUFFICIENT_ENTITLEMENT_BALANCE');
  });

  it('defines an atomic reservation transaction plan', () => {
    expect(
      buildAtomicReservationPlan({ userId: 'u1', entitlementCode: 'render', quantity: 1, idempotencyKey: 'idem-1' }),
    ).toMatchObject({
      transactionRequired: true,
      idempotencyKey: 'idem-1',
      lock: 'entitlement_grant_row',
    });
  });

  it('centralizes package prices in minor INR units', () => {
    expect(getConfiguredPackagePrice('FREE')).toEqual({ amountMinor: 0, currency: 'INR' });
    expect(getConfiguredPackagePrice('NIVASA_DESIGN')?.amountMinor).toBe(9900);
    expect(getConfiguredPackagePrice('NIVASA_COMPLETE')?.amountMinor).toBe(99900);
    expect(getConfiguredPackagePrice('NIVASA_PRO')?.amountMinor).toBe(999900);
  });

  it('calculates deterministic tax and estimates', () => {
    expect(calculateTax({ taxableAmountMinor: 10000, rateBps: 1800 })).toBe(1800);
    expect(calculateEstimate([{ category: 'product', quantity: 2, unitAmountMinor: 5000 }], 1800)).toEqual({
      subtotalMinor: 10000,
      taxMinor: 1800,
      totalMinor: 11800,
    });
  });

  it('builds reproducible BOQ snapshots with pricing version', () => {
    const snapshot = buildBoqSnapshot(
      [{ sourceId: 'p1', description: 'Chair', category: 'product', quantity: 1, unitAmountMinor: 1000 }],
      0,
      'catalogue-2026-08',
    );
    expect(snapshot.pricingVersion).toBe('catalogue-2026-08');
    expect(snapshot.totals.totalMinor).toBe(1000);
  });

  it('constrains payment transitions and webhook idempotency', () => {
    expect(canTransitionPayment('CREATED', 'PENDING')).toBe(true);
    expect(canTransitionPayment('CAPTURED', 'PENDING')).toBe(false);
    expect(webhookIdempotencyKey({ provider: 'razorpay', eventId: 'evt_1' })).toBe('razorpay:evt_1');
  });
});
