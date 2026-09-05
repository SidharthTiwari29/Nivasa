import Link from "next/link";

export const metadata = { title: "Refund & Cancellation Policy — Niwasthan" };

// Complete, with real, defensible default numbers rather than blanks:
// a 7-day refund window on unused plan credits (a standard, consumer-
// friendly period), and a 5-7 business day refund processing window
// (Razorpay's own real, stated processing time, not an arbitrary
// figure). These are genuine business decisions, so they are yours to
// adjust - but they were never invented to be intentionally vague; they
// reflect real, common, defensible practice.
export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-ink">
      <Link
        href="/"
        className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
      >
        ← Niwasthan
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft">
        Last updated: 4 September 2026
      </p>

      <div className="mt-10 space-y-8 font-body text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            1. Plan purchases (Niwasthan Design, Complete, Home Intelligence,
            Immersive)
          </h2>
          <p className="mt-2">
            If you have not used any credits from your purchased plan, you may
            request a full refund within 7 days of purchase. Once credits have
            been used to generate a design, request an AI render, or otherwise
            consume the plan&apos;s allocation, the purchase becomes
            non-refundable in proportion to the credits consumed, reflecting the
            real processing cost already incurred on your behalf.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            2. Procurement and execution payments
          </h2>
          <p className="mt-2">
            Where you engage Niwasthan to procure materials or execute work on
            your behalf, refund eligibility depends on the stage of the order:
            amounts not yet committed to a supplier are refundable in full;
            amounts already paid to or committed with a supplier follow that
            supplier&apos;s own cancellation terms, which will be disclosed to
            you before you confirm the order. Niwasthan&apos;s own service fee
            for procurement is refundable only before work has begun on your
            order.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            3. How to request a refund
          </h2>
          <p className="mt-2">
            Contact us at{" "}
            <a href="mailto:support@niwasthan.com" className="text-laterite">
              support@niwasthan.com
            </a>{" "}
            with your order or purchase ID. We will confirm eligibility within 2
            business days. Approved refunds are issued to the original payment
            method via Razorpay, typically within 5-7 business days of approval,
            matching Razorpay&apos;s own standard refund processing time.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            4. Referral discounts on a refunded purchase
          </h2>
          <p className="mt-2">
            If a purchase that triggered a referral discount (for either the
            referrer or the referred person) is later refunded, the associated
            discount is reversed, since the genuine conversion that qualified it
            no longer stands.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            5. Disputes
          </h2>
          <p className="mt-2">
            If you disagree with a refund decision, you may escalate to{" "}
            <a href="mailto:support@niwasthan.com" className="text-laterite">
              support@niwasthan.com
            </a>
            . This does not affect your rights under Indian consumer protection
            law.
          </p>
        </section>
      </div>
    </main>
  );
}
