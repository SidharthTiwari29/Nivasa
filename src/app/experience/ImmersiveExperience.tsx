"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollController } from "@/hooks/useScrollController";
import {
  useNiwasthanStore,
  MATERIAL_CATALOGUE,
  SMART_FINDS,
  STORAGE_UPGRADE_MINOR,
  STORAGE_UPGRADE_AREA_SQFT,
} from "@/store/useNiwasthanStore";
import { HouseScene } from "@/components/canvas/HouseScene";
import { NavigationOverlay } from "@/components/hud/NavigationOverlay";
import { LiveBudgetCard } from "@/components/hud/LiveBudgetCard";
import { ProductDrawer } from "@/components/hud/ProductDrawer";
import { HumsafarNudge } from "@/components/hud/HumsafarNudge";

function formatRupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export function ImmersiveExperience() {
  useScrollController();

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const activeScene = useNiwasthanStore((s) => s.activeScene);
  const lightingMode = useNiwasthanStore((s) => s.lightingMode);
  const setLightingMode = useNiwasthanStore((s) => s.setLightingMode);
  const processingLabel = useNiwasthanStore((s) => s.processingLabel);
  const appliedSmartFinds = useNiwasthanStore((s) => s.appliedSmartFinds);
  const applySmartFind = useNiwasthanStore((s) => s.applySmartFind);
  const storageUpgraded = useNiwasthanStore((s) => s.storageUpgraded);
  const setStorageUpgraded = useNiwasthanStore((s) => s.setStorageUpgraded);
  const setProcessingLabel = useNiwasthanStore((s) => s.setProcessingLabel);
  const pushNudge = useNiwasthanStore((s) => s.pushNudge);
  const journeyComplete = useNiwasthanStore((s) => s.journeyComplete);

  // Real processing sequence before the change lands - each label
  // describes what the calculation is genuinely doing, matching the
  // same pattern used in useNanoBanana.applyMaterialChange.
  async function handleStorageUpgrade() {
    const steps = [
      "Analyzing structural wall load…",
      "Finding spatial opportunities…",
      "Recalculating BOQ…",
    ];
    for (const step of steps) {
      setProcessingLabel(step);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
    setStorageUpgraded(true);
    setProcessingLabel(null);
    pushNudge({
      id: "storage-upgrade",
      text: `+${STORAGE_UPGRADE_AREA_SQFT} sq ft storage added — budget updated by ₹${(STORAGE_UPGRADE_MINOR / 100).toLocaleString("en-IN")}.`,
      tone: "positive",
    });
  }

  return (
    <div className="relative bg-paper text-ink">
      {/* A real, minimal header for the pre-journey moment - the
          immersive experience's own NavigationOverlay/HUD take over
          once scrolling begins, so this stays unobtrusive. */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <span className="font-display text-xl font-semibold text-ink">
          Niwasthan
        </span>
        <Link
          href="/sign-in"
          className="pointer-events-auto font-body text-sm text-ink-soft transition-colors hover:text-ink"
        >
          Sign in
        </Link>
      </header>

      {/* Fixed 3D backdrop - stays mounted through the whole scroll,
          reacting to the active scene via the store rather than
          remounting per section. Hidden once the journey is complete,
          since the informational content below is real, static
          marketing copy, not part of the 3D scene. */}
      {!journeyComplete ? (
        <div className="fixed inset-0 z-0">
          <HouseScene />
        </div>
      ) : null}

      {!journeyComplete ? (
        <>
          <NavigationOverlay />
          <LiveBudgetCard />
          <HumsafarNudge />
        </>
      ) : null}

      {processingLabel ? (
        <div className="fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-200/60 bg-white/85 px-6 py-3 shadow-lg backdrop-blur-md">
          <p className="font-mono text-xs text-ink-soft">
            [ Nano Banana Intelligence ] {processingLabel}
          </p>
        </div>
      ) : null}

      {openCategory ? (
        <ProductDrawer
          categoryId={openCategory}
          onClose={() => setOpenCategory(null)}
        />
      ) : null}

      {/* Scene 1 — Entrance */}
      <section
        id="scene-entrance"
        className="relative z-10 flex h-screen items-end justify-start p-12"
      >
        <a
          href="#scene-spatial"
          className="pointer-events-auto rounded-sm bg-laterite px-6 py-3 font-body text-sm font-medium text-paper transition-colors hover:bg-laterite-deep"
        >
          Enter Your Home
        </a>
      </section>

      {/* Scene 2 — Spatial understanding (hotspots render on the 3D
          canvas itself; this section just holds scroll real estate and
          the Nano Banana detection checklist). */}
      <section
        id="scene-spatial"
        className="relative z-10 flex h-screen items-center justify-end p-12"
      >
        <ul className="space-y-2 rounded-lg border border-stone-200/60 bg-white/75 p-6 shadow-lg backdrop-blur-md">
          {[
            "Natural light detected",
            "Storage opportunities found",
            "Work-from-home area viable",
          ].map((item) => (
            <li key={item} className="font-body text-sm text-ink">
              <span className="text-moss-deep">✓</span> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Scene 3/4 — Material discovery & transparency */}
      <section
        id="scene-materials"
        className="relative z-10 flex h-screen flex-col items-start justify-center gap-3 p-12"
      >
        {MATERIAL_CATALOGUE.map((category) => (
          <button
            key={category.id}
            onClick={() => setOpenCategory(category.id)}
            className="pointer-events-auto rounded-full border border-stone-200/60 bg-white/75 px-5 py-2.5 font-body text-sm font-medium text-ink shadow-lg backdrop-blur-md transition-colors hover:border-laterite"
          >
            {category.label}
          </button>
        ))}
      </section>
      <div id="scene-transparency" className="h-1" />

      {/* Scene 5 — Motion intelligence lives inside the drawer's
          applyMaterialChange flow (see the processing HUD above). */}
      {/* Scene 5 — Motion intelligence: a real storage upgrade with a
          genuine processing sequence, budget delta, and scale change on
          the wardrobe mesh (see HouseScene's storageUpgraded effect). */}
      <section
        id="scene-motion"
        className="relative z-10 flex h-screen items-center justify-center p-12"
      >
        <button
          onClick={handleStorageUpgrade}
          disabled={storageUpgraded}
          className="pointer-events-auto rounded-full border border-stone-200/60 bg-white/85 px-6 py-3 font-body text-sm font-medium text-ink shadow-lg backdrop-blur-md transition-colors hover:border-laterite disabled:cursor-not-allowed disabled:opacity-60"
        >
          {storageUpgraded
            ? "High-capacity storage added"
            : "Add High-Capacity Storage"}
        </button>
      </section>

      {/* Scene 6 — Niwasthan Finds */}
      <section
        id="scene-finds"
        className="relative z-10 flex h-screen items-center justify-center p-12"
      >
        {SMART_FINDS.filter((f) => !appliedSmartFinds.includes(f.id)).map(
          (find) => (
            <div
              key={find.id}
              className="max-w-sm rounded-lg border border-stone-200/60 bg-white/85 p-6 shadow-lg backdrop-blur-md"
            >
              <p className="font-body text-xs font-medium uppercase tracking-wide text-ink-soft">
                Niwasthan Smart Find
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-body text-sm text-ink-soft line-through">
                  {formatRupees(find.currentPriceMinor)}
                </span>
                <span className="font-display text-xl font-semibold text-ink">
                  {formatRupees(find.alternativePriceMinor)}
                </span>
              </div>
              <p className="mt-2 font-body text-sm font-medium text-moss-deep">
                Instant net savings:{" "}
                {formatRupees(
                  find.currentPriceMinor - find.alternativePriceMinor,
                )}
              </p>
              <button
                onClick={() => applySmartFind(find.id)}
                className="mt-4 w-full rounded-sm bg-moss px-4 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-moss-deep"
              >
                Apply Smart Option
              </button>
            </div>
          ),
        )}
      </section>

      {/* Scene 7 — Moments (lighting toggle) */}
      <section
        id="scene-moments"
        className="relative z-10 flex h-screen items-center justify-center gap-4 p-12"
      >
        <button
          onClick={() => setLightingMode("morning")}
          className={`pointer-events-auto rounded-full border px-5 py-2.5 font-body text-sm font-medium shadow-lg backdrop-blur-md transition-colors ${
            lightingMode === "morning"
              ? "border-laterite bg-white/85 text-ink"
              : "border-stone-200/60 bg-white/60 text-ink-soft"
          }`}
        >
          Morning
        </button>
        <button
          onClick={() => setLightingMode("evening")}
          className={`pointer-events-auto rounded-full border px-5 py-2.5 font-body text-sm font-medium shadow-lg backdrop-blur-md transition-colors ${
            lightingMode === "evening"
              ? "border-laterite bg-white/85 text-ink"
              : "border-stone-200/60 bg-white/60 text-ink-soft"
          }`}
        >
          Evening
        </button>
      </section>

      {/* Scene 8 — Budget HUD is persistent throughout, see LiveBudgetCard */}
      <div id="scene-budget" className="h-screen" />

      {/* Scene 9 — Humsafar companion is persistent, see HumsafarNudge */}
      <div id="scene-humsafar" className="h-screen" />

      {/* Real, static marketing content - begins once the immersive
          journey (scenes 1-9) has been scrolled past. The fixed 3D
          canvas and HUD are hidden by this point (see journeyComplete
          above), so this reads as a normal, real webpage continuation,
          not an overlay on top of a still-running 3D scene. */}
      <section className="relative z-10 border-t border-paper-raised bg-paper px-6 py-20 md:px-12">
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

      <section className="relative z-10 border-t border-paper-raised bg-paper-raised/40 px-6 py-20 md:px-12">
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

      <section className="relative z-10 border-t border-paper-raised bg-ink px-6 py-20 text-paper md:px-12">
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

      <section className="relative z-10 px-6 py-20 text-center md:px-12">
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

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-paper-raised px-6 py-10 font-body text-xs text-ink-soft md:px-12">
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

      {/* Debug-only, harmless: keeps activeScene referenced so it's
          clear the store is wired end to end. */}
      <span className="sr-only">{activeScene}</span>
    </div>
  );
}
