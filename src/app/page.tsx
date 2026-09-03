import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <span className="font-display text-xl font-semibold">Niwasthan</span>
        <Link
          href="/sign-in"
          className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
        >
          Sign in
        </Link>
      </header>

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
            href="#how-it-works"
            className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
          >
            See how it works
          </Link>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-paper-raised bg-paper-raised/40 px-6 py-20 md:px-12"
      >
        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-3">
          <div>
            <span className="font-mono text-xs text-brass">Your home</span>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Tell us what you have
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              Share your floor plan and what matters to you. We build a real
              understanding of your rooms before we design anything.
            </p>
          </div>
          <div>
            <span className="font-mono text-xs text-brass">Your design</span>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Choose a direction
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              Explore a few genuine design directions for your home. Pick one to
              move forward with — your other ideas stay saved, not lost.
            </p>
          </div>
          <div>
            <span className="font-mono text-xs text-brass">Your price</span>
            <h3 className="mt-2 font-display text-xl font-semibold">
              See the real cost
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              Every product in your design comes with its real price, warranty,
              and availability — verified, not estimated.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 font-body text-xs text-ink-soft md:px-12">
        Niwasthan
      </footer>
    </main>
  );
}
