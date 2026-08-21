export type PaymentOrder = { id: string; amountMinor: bigint; currency: string };
export interface PaymentProvider { createOrder(input: { amountMinor: bigint; currency: string; receipt: string }): Promise<PaymentOrder>; verifyWebhook(rawBody: string, signature: string): boolean; }
export function getPaymentProvider(): PaymentProvider { throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED"); }
