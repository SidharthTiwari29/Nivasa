import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <span className="font-display text-xl font-semibold">Niwasthan</span>
        <nav className="flex items-center gap-8">
          <Link
            href="#what-we-do"
            className="hidden font-body text-sm text-ink-soft transition-colors hover:text-ink md:inline"
          >
            What we do
          </Link>
          <Link
            href="#how-it-works"
            className="hidden font-body text-sm text-ink-soft transition-colors hover:text-ink md:inline"
          >
            How it works
          </Link>
          <Link
            href="/sign-in"
            className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:px-12 md:pt-24">
        <h1 className="font-display text-4xl leading-[1.1] font-semibold text-ink md:text-6xl">
          Design your home without guessing what it&apos;ll cost.
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-ink-soft">
          Most renovations go over budget because nobody shows you the real
          price until it&apos;s too late. Niwasthan designs your home room by
          room, and every material, product, and price is real and verified
          before you commit to anything.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/sign-in"
            className="inline-flex items-center rounded-sm bg-laterite px-6 py-3 font-body text-sm font-medium text-paper transition-colors hover:bg-laterite-deep"
          >
            Start with your home
          </Link>
          <Link
            href="/experience"
            className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
          >
            See it in motion →
          </Link>
        </div>
      </section>

      {/* Who we are */}
      <section className="border-t border-paper-raised px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-xs text-brass">Who we are</span>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
            A design studio that shows its work, not just the finished photo.
          </h2>
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink-soft">
            Interior renovation in India has an honesty problem. Quotes change
            mid-project. &quot;Premium&quot; materials arrive unverified.
            Homeowners rarely know if a price is fair until it&apos;s too late
            to negotiate. Niwasthan exists to fix that specific problem — not by
            promising the cheapest renovation, but by making every material,
            every price, and every decision visible before you agree to any of
            it.
          </p>
        </div>
      </section>

      {/* What we do */}
      <section
        id="what-we-do"
        className="border-t border-paper-raised bg-paper-raised/40 px-6 py-20 md:px-12"
      >
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-xs text-brass">What we do</span>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
            AI-native design, grounded in real products you can actually buy.
          </h2>
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink-soft">
            Niwasthan designs your home using an understanding of your actual
            rooms — their real dimensions, light, and layout. Every design is
            built from a real catalogue of verified products, each with a
            genuine price, warranty status, and availability. Nothing in your
            quote is invented to look complete; if we haven&apos;t verified
            something yet, we say so.
          </p>
        </div>
      </section>

      {/* How we do it */}
      <section id="how-it-works" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <span className="font-mono text-xs text-brass">How we do it</span>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
            The same real journey, every time.
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            <li>
              <span className="font-display text-lg font-semibold text-laterite">
                01
              </span>
              <h3 className="mt-2 font-body text-base font-semibold text-ink">
                Understand your home
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                Share your floor plan and what matters to you. We confirm the
                real dimensions and constraints before designing anything.
              </p>
            </li>
            <li>
              <span className="font-display text-lg font-semibold text-laterite">
                02
              </span>
              <h3 className="mt-2 font-body text-base font-semibold text-ink">
                Design and price it, together
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                We propose real design directions grounded in real products.
                Your budget shows the real cost as you choose, never after.
              </p>
            </li>
            <li>
              <span className="font-display text-lg font-semibold text-laterite">
                03
              </span>
              <h3 className="mt-2 font-body text-base font-semibold text-ink">
                Buy it, build it, or both
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                Take the verified plan and source it yourself, or let Niwasthan
                procure and execute the work — your choice, made explicit, never
                assumed.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* The promise - price you decide, work you choose, we deliver */}
      <section className="border-t border-paper-raised bg-ink px-6 py-20 text-paper md:px-12">
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-xs text-brass">Our promise</span>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
            Price you decide. Work you choose. We deliver your home.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-body text-sm font-semibold text-brass">
                Price you decide
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-paper/80">
                Set a real budget and every design decision shows its real cost
                against it — you set the ceiling, not us.
              </p>
            </div>
            <div>
              <h3 className="font-body text-sm font-semibold text-brass">
                Work you choose
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-paper/80">
                Source the verified plan yourself, or hand execution to
                Niwasthan. Neither path is the default — you decide.
              </p>
            </div>
            <div>
              <h3 className="font-body text-sm font-semibold text-brass">
                We deliver your home
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-paper/80">
                When you choose Niwasthan to execute, the same verified plan you
                approved is exactly what gets built — no substitutions made
                quietly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center md:px-12">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">
          Ready to see your home, priced honestly?
        </h2>
        <Link
          href="/sign-in"
          className="mt-8 inline-flex items-center rounded-sm bg-laterite px-6 py-3 font-body text-sm font-medium text-paper transition-colors hover:bg-laterite-deep"
        >
          Start with your home
        </Link>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-paper-raised px-6 py-10 font-body text-xs text-ink-soft md:px-12">
        <span>Niwasthan</span>
        <nav className="flex gap-6">
          <Link href="/legal/terms" className="hover:text-ink">
            Terms of Service
          </Link>
          <Link href="/legal/privacy" className="hover:text-ink">
            Privacy Policy
          </Link>
          <Link href="/legal/refund-policy" className="hover:text-ink">
            Refunds &amp; Cancellations
          </Link>
        </nav>
      </footer>
    </main>
  );
}
