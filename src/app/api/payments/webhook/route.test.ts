import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { verifyWebhook, activatePaidPurchase, consumeRateLimit } = vi.hoisted(
  () => ({
    verifyWebhook: vi.fn(),
    activatePaidPurchase: vi.fn(),
    consumeRateLimit: vi.fn(),
  }),
);

vi.mock("@/server/payments/provider", () => ({
  getPaymentProvider: () => ({ verifyWebhook }),
}));

vi.mock("@/server/payments/purchaseService", () => ({
  activatePaidPurchase,
}));

vi.mock("@/server/security/rateLimit", () => ({
  consumeRateLimit,
}));

describe("payment webhook", () => {
  it("rejects requests without a signature", async () => {
    consumeRateLimit.mockResolvedValue({ allowed: true });

    const response = await POST(
      new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(400);
    expect(verifyWebhook).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid signature", async () => {
    consumeRateLimit.mockResolvedValue({ allowed: true });
    verifyWebhook.mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": "bad" },
        body: JSON.stringify({ event: "payment.captured" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(activatePaidPurchase).not.toHaveBeenCalled();
  });

  it("activates a verified payment event", async () => {
    consumeRateLimit.mockResolvedValue({ allowed: true });
    verifyWebhook.mockReturnValue(true);
    activatePaidPurchase.mockResolvedValue({ id: "purchase-1" });

    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "payment-1", order_id: "order-1" } } },
    });
    const response = await POST(
      new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": "sig-1" },
        body,
      }),
    );

    expect(response.status).toBe(200);
    expect(activatePaidPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOrderId: "order-1",
        providerPaymentId: "payment-1",
        signature: "sig-1",
      }),
    );
  });

  it("fails closed when the rate limiter is unavailable", async () => {
    consumeRateLimit.mockRejectedValue(new Error("REDIS_NOT_CONFIGURED"));

    const response = await POST(
      new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": "sig-1" },
        body: "{}",
      }),
    );

    expect(response.status).toBe(503);
    expect(verifyWebhook).not.toHaveBeenCalled();
  });
});
