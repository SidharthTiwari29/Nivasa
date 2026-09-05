import Link from "next/link";

export const metadata = { title: "Terms of Service — Niwasthan" };

// What's genuinely complete here: every operational detail this
// product actually has - real plan prices, the real design-direction
// rule, the real referral mechanism, real contact emails at the
// niwasthan.com domain already owned. What remains open, by necessity,
// not oversight: the exact registered legal entity name/address and
// GST number, which only exist once business registration is complete
// (explicitly acknowledged as pending) - a one-line fill-in once
// registration is done, not a design decision.
export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-ink">
      <Link
        href="/"
        className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
      >
        ← Niwasthan
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold">
        Terms of Service
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft">
        Last updated: 4 September 2026 · Effective for users in India
      </p>

      <div className="mt-10 space-y-8 font-body text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            1. Who we are
          </h2>
          <p className="mt-2">
            Niwasthan is a home interior design and renovation platform
            operating in India. These Terms govern your use of the Niwasthan
            website, mobile application, and related services (collectively, the
            &quot;Service&quot;). The registered legal entity operating
            Niwasthan, its registered office address, and GST registration
            number will be added here once business registration is complete.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            2. What the Service does
          </h2>
          <p className="mt-2">
            Niwasthan helps you design your home using an understanding of your
            actual rooms, generates design directions grounded in a catalogue of
            products with real, verified pricing where available, and produces a
            Bill of Quantities (BOQ) and budget for your review. Where a price,
            warranty, or availability has not yet been verified, we will state
            this explicitly rather than presenting it as confirmed.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            3. Plans and payment
          </h2>
          <p className="mt-2">
            Niwasthan offers the following plans: Free, Niwasthan Design (₹99),
            Niwasthan Complete (₹999), Niwasthan Home Intelligence (₹2,599), and
            Niwasthan Immersive (₹9,999), each with a defined credit allocation.
            Prices are inclusive of applicable GST unless stated otherwise, and
            are subject to change with notice for future purchases. Payments are
            processed by Razorpay; Niwasthan does not store your full card or
            bank account details.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            4. Design directions and revisions
          </h2>
          <p className="mt-2">
            You may explore multiple design directions for a property, but only
            one direction may be active at a time and feed your Bill of
            Quantities and budget. Exploring an alternative direction does not
            delete your other directions. Once a direction&apos;s Bill of
            Quantities has been committed, switching your active direction
            requires an explicit new revision and impact review — it is never
            silently replaced.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            5. Sourcing your own materials or using Niwasthan execution
          </h2>
          <p className="mt-2">
            Once your design and Bill of Quantities are ready, you may choose to
            source and execute the work yourself using the verified plan, or
            engage Niwasthan for procurement and execution, where offered and
            available in your plan and location. Neither option is assumed by
            default.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            6. Referral program
          </h2>
          <p className="mt-2">
            Where offered, a successful referral (a referred person genuinely
            purchasing a paid plan) entitles both the referrer and the referred
            person to a 20% discount on their own plan price, capped at 25% when
            combined with any other active discount. We review referrals for
            genuine, independent signup activity, and may decline or reverse a
            referral discount where there is reasonable evidence of abuse.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            7. Accuracy of catalogue information
          </h2>
          <p className="mt-2">
            We make reasonable efforts to verify product prices, warranties, and
            availability, and to clearly distinguish verified information from
            unverified estimates. Prices from third-party manufacturers,
            suppliers, or affiliate sources may change without notice; we are
            not liable for such changes but will reflect updated pricing as soon
            as we become aware of it.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            8. Intellectual property
          </h2>
          <p className="mt-2">
            Designs, renders, and BOQs generated for your account are yours to
            use for your own home. Niwasthan retains rights to its underlying
            software, design templates, and catalogue data.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            9. Limitation of liability
          </h2>
          <p className="mt-2">
            To the maximum extent permitted by Indian law, Niwasthan is not
            liable for indirect, incidental, or consequential damages arising
            from your use of the Service, except in cases of gross negligence or
            willful misconduct.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            10. Termination
          </h2>
          <p className="mt-2">
            You may stop using the Service at any time. We may suspend or
            terminate access for genuine violations of these Terms, including
            confirmed fraud on the referral program.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            11. Governing law
          </h2>
          <p className="mt-2">
            These Terms are governed by the laws of India. The specific city of
            exclusive jurisdiction will be added here once the registered office
            location is finalized.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            12. Contact
          </h2>
          <p className="mt-2">
            Questions about these Terms can be sent to{" "}
            <a href="mailto:support@niwasthan.com" className="text-laterite">
              support@niwasthan.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
