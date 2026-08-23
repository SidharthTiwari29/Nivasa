import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/server/payments/provider";
import { activatePaidPurchase } from "@/server/payments/purchaseService";
import { consumeRateLimit } from "@/server/security/rateLimit";

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
  try {
    const rate = await consumeRateLimit({
      key: `payment-webhook:${clientIp}`,
      limit: 120,
      windowSeconds: 60,
    });
    if (!rate.allowed)
      return NextResponse.json(
        { ok: false, error: "RATE_LIMITED" },
        { status: 429 },
      );
  } catch {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT_UNAVAILABLE" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature)
    return NextResponse.json(
      { ok: false, error: "MISSING_SIGNATURE" },
      { status: 400 },
    );
  let provider;
  try {
    provider = getPaymentProvider();
  } catch {
    return NextResponse.json(
      { ok: false, error: "PAYMENT_PROVIDER_NOT_CONFIGURED" },
      { status: 503 },
    );
  }
  if (!provider.verifyWebhook(rawBody, signature))
    return NextResponse.json(
      { ok: false, error: "INVALID_SIGNATURE" },
      { status: 401 },
    );

  const eventHash = createHash("sha256").update(rawBody).digest("hex");
  const body = JSON.parse(rawBody) as {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  if (body.event !== "payment.captured" && body.event !== "order.paid")
    return NextResponse.json({ ok: true, ignored: true });
  const entity = body.payload?.payment?.entity;
  if (!entity?.id || !entity.order_id)
    return NextResponse.json(
      { ok: false, error: "INVALID_EVENT" },
      { status: 400 },
    );

  await activatePaidPurchase({
    providerOrderId: entity.order_id,
    providerPaymentId: entity.id,
    signature,
    rawEventHash: eventHash,
  });
  return NextResponse.json({ ok: true });
}
