import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PaymentOrderRequest, PaymentProvider, VerifiedWebhook } from './provider';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`NOT_CONFIGURED:${name}`);
  return value;
}

function verifyHmac(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay';

  async createOrder(request: PaymentOrderRequest) {
    const keyId = required('RAZORPAY_KEY_ID');
    const secret = required('RAZORPAY_KEY_SECRET');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: request.amountMinor,
        currency: request.currency,
        receipt: request.purchaseId,
        notes: { idempotencyKey: request.idempotencyKey },
      }),
    });
    if (!response.ok) throw new Error(`PAYMENT_PROVIDER_ERROR:${response.status}`);
    const order = (await response.json()) as { id: string };
    return { providerOrderId: order.id };
  }

  async verifyWebhook(rawBody: string, signature: string): Promise<VerifiedWebhook> {
    const secret = required('RAZORPAY_WEBHOOK_SECRET');
    if (!verifyHmac(rawBody, signature, secret)) throw new Error('INVALID_WEBHOOK_SIGNATURE');
    const payload = JSON.parse(rawBody) as { event?: string; id?: string };
    if (!payload.id || !payload.event) throw new Error('INVALID_WEBHOOK_PAYLOAD');
    return { provider: this.name, eventId: payload.id, eventType: payload.event, payload };
  }
}
