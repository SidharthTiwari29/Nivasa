import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyRazorpayWebhookSignature } from "./provider";

describe("Razorpay webhook signatures", () => {
  it("accepts an authentic signature", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    const secret = "test-secret";
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyRazorpayWebhookSignature(body, signature, secret)).toBe(true);
  });

  it("rejects a forged signature", () => {
    expect(
      verifyRazorpayWebhookSignature("{}", "not-a-signature", "test-secret"),
    ).toBe(false);
  });
});
