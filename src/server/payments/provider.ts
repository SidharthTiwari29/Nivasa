export type PaymentOrderRequest = { purchaseId: string; amountMinor: number; currency: string; idempotencyKey: string };
export type VerifiedWebhook = { provider: string; eventId: string; eventType: string; payload: unknown };
export interface PaymentProvider {
  readonly name: string;
  createOrder(request: PaymentOrderRequest): Promise<{ providerOrderId: string; clientSecret?: string }>;
  verifyWebhook(rawBody: string, signature: string): Promise<VerifiedWebhook>;
}
