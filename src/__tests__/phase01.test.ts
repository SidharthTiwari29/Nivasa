import { describe, expect, it } from 'vitest';
import { hasMinimumRole, hasPermission } from '@/server/auth/rbac';
import { assertTransition, canTransition } from '@/server/jobs/state';
import { canReserve, reserveUsage } from '@/server/entitlements/usage';
import { RazorpayProvider } from '@/server/payments/razorpay';

describe('Phase 0.1 authorization', () => {
  it('supports designer without granting admin privileges', () => {
    expect(hasPermission('DESIGNER', 'design:review')).toBe(true);
    expect(hasPermission('DESIGNER', 'payment:manage')).toBe(false);
    expect(hasMinimumRole('SUPER_ADMIN', 'ADMIN')).toBe(true);
  });
});

describe('job lifecycle', () => {
  it('rejects terminal-state resurrection', () => {
    expect(canTransition('SUCCEEDED', 'RUNNING')).toBe(false);
    expect(() => assertTransition('CANCELLED', 'SUCCEEDED')).toThrow('INVALID_JOB_TRANSITION');
  });
});

describe('entitlement reservation primitive', () => {
  it('prevents overspending and preserves idempotency data', () => {
    const balance = { entitlementId: 'e1', remaining: 2, reserved: 0 };
    expect(canReserve(balance, 3)).toBe(false);
    expect(reserveUsage(balance, 2, 'req-1')).toEqual({ entitlementId: 'e1', quantity: 2, reservationId: 'req-1' });
  });
});

describe('Razorpay webhook verification', () => {
  it('fails closed for an invalid signature', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test-secret';
    const provider = new RazorpayProvider();
    await expect(provider.verifyWebhook('{"id":"evt_1","event":"payment.captured"}', 'bad')).rejects.toThrow(
      'INVALID_WEBHOOK_SIGNATURE',
    );
  });
});
