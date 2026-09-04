import Link from "next/link";

export const metadata = { title: "Privacy Policy — Niwasthan" };

// Same real-notice as terms/page.tsx: bracketed placeholders need real
// values, and a Grievance Officer name + contact is a REQUIRED field
// under India's DPDP Act and IT Rules - not optional, and not
// something this draft can supply on your behalf. Legal review before
// production use is strongly recommended, particularly for
// cross-border data transfer language (Google/Gemini, Razorpay,
// storage providers) and retention periods specific to your actual
// operations.
export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-ink">
      <Link
        href="/"
        className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
      >
        ← Niwasthan
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold">
        Privacy Policy
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft">
        Last updated: [DATE] · Governed by India&apos;s Digital Personal Data
        Protection Act, 2023
      </p>

      <div className="mt-10 space-y-8 font-body text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            1. What this covers
          </h2>
          <p className="mt-2">
            This Policy explains what personal data Niwasthan (&quot;we&quot;,
            operated by [LEGAL ENTITY NAME]) collects when you use our website
            and mobile app, why we collect it, and the rights you have over it
            as a Data Principal under India&apos;s Digital Personal Data
            Protection Act, 2023 (&quot;DPDP Act&quot;).
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            2. What we collect
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-ink">Account data</span> — your
              name, email address, and profile image, from Google Sign-In.
            </li>
            <li>
              <span className="font-medium text-ink">
                Property and room data
              </span>{" "}
              — property names, addresses, room types, dimensions, and any floor
              plans or photos you upload.
            </li>
            <li>
              <span className="font-medium text-ink">
                Design and catalogue data
              </span>{" "}
              — your design directions, product selections, and budget
              preferences.
            </li>
            <li>
              <span className="font-medium text-ink">Payment records</span>—
              plan purchased, amount charged, and transaction status. Your card
              or bank details are processed directly by Razorpay and are never
              stored by us.
            </li>
            <li>
              <span className="font-medium text-ink">
                Referral fraud signals
              </span>{" "}
              — your signup IP address and browser User-Agent, recorded once and
              never overwritten, used solely to detect misuse of the referral
              program. This is not device fingerprinting and does not track your
              later activity.
            </li>
            <li>
              <span className="font-medium text-ink">
                Usage and support data
              </span>{" "}
              — pages visited, actions taken in the app, and any support
              requests you send us.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            3. Why we collect it
          </h2>
          <p className="mt-2">
            To operate the Service (designing your home, generating your BOQ and
            budget, processing payments), to protect the referral program from
            abuse, to communicate with you about your account or purchases, and
            to meet legal obligations (including tax and consumer protection
            law).
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            4. Who we share it with
          </h2>
          <p className="mt-2">
            Razorpay (payments), Google (sign-in, and AI-assisted design
            generation where you use that feature), and our cloud hosting and
            storage providers, each solely to the extent needed to provide the
            Service. We do not sell your personal data. Some of these providers
            may process data outside India; where this happens, we require them
            to apply protections consistent with the DPDP Act.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            5. How long we keep it
          </h2>
          <p className="mt-2">
            We retain your data for as long as your account is active, and for
            [RETENTION PERIOD] after account closure to meet legal, tax, and
            dispute-resolution obligations, after which it is deleted or
            anonymized.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            6. Your rights as a Data Principal
          </h2>
          <p className="mt-2">Under the DPDP Act, you have the right to:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Access a summary of the personal data we hold about you.</li>
            <li>Request correction or completion of inaccurate data.</li>
            <li>
              Request erasure of your data, subject to our legal retention
              obligations.
            </li>
            <li>Withdraw consent for processing that relies on it.</li>
            <li>
              Nominate another individual to exercise these rights on your
              behalf in the event of death or incapacity.
            </li>
            <li>
              File a complaint with our Grievance Officer, and thereafter with
              the Data Protection Board of India if unresolved.
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at [PRIVACY CONTACT
            EMAIL].
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            7. Grievance Officer
          </h2>
          <p className="mt-2">
            In accordance with the DPDP Act and applicable Information
            Technology Rules, our designated Grievance Officer is:
          </p>
          <p className="mt-2">
            [GRIEVANCE OFFICER NAME]
            <br />
            [DESIGNATION]
            <br />
            [EMAIL] · [PHONE] · [REGISTERED ADDRESS]
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            8. Security
          </h2>
          <p className="mt-2">
            We use reasonable technical and organizational measures to protect
            your data, including access controls and audit logging on sensitive
            actions. No system is perfectly secure, and we will notify affected
            users and relevant authorities in the event of a significant data
            breach, as required by law.
          </p>
        </section>

        <section>
          <h2 className="font-body text-base font-semibold text-ink">
            9. Changes to this Policy
          </h2>
          <p className="mt-2">
            We will update the &quot;Last updated&quot; date above and, for
            material changes, notify you directly before they take effect.
          </p>
        </section>
      </div>
    </main>
  );
}
