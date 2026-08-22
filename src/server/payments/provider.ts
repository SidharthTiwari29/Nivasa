import { createHmac, timingSafeEqual } from "node:crypto";

export type PaymentOrder = { id: string; amountMinor: bigint; currency: string };

export interface PaymentProvider {
  createOrder(input: { amountMinor: bigint; currency: string; receipt: string }): Promise<PaymentOrder>;
  verifyWebhook(rawBody: string, signature: string): boolean;
}

class RazorpayProvider implements PaymentProvider {
  constructor(
    private readonly keyId = process.env.RAZORPAY_KEY_ID,
    private readonly keySecret = process.env.RAZORPAY_KEY_SECRET,
    private readonly webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET,
  ) {
    if (!keyId || !keySecret || !webhookSecret) throw new Error("RAZORPAY_NOT_CONFIGURED");
  }

  async createOrder(input: { amountMinor: bigint; currency: string; receipt: string }): Promise<PaymentOrder> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(input.amountMinor), currency: input.currency, receipt: input.receipt }),
    });
    if (!response.ok) throw new Error(`RAZORPAY_ORDER_FAILED:${response.status}`);
    const body = (await response.json()) as { id: string; amount: number; currency: string };
    return { id: body.id, amountMinor: BigInt(body.amount), currency: body.currency };
  }

  verifyWebhook(rawBody: string, signature: string) {
    const expected = createHmac("sha256", this.webhookSecret).update(rawBody).digest("hex");
    const actual = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
  }
}

export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === "razorpay") return new RazorpayProvider();
  if (!process.env.PAYMENT_PROVIDER) throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
  throw new Error(`PAYMENT_PROVIDER_UNSUPPORTED:${process.env.PAYMENT_PROVIDER}`);
}
