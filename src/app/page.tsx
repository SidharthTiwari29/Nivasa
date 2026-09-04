"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, type ReactNode } from "react";

const CinematicLanding = dynamic(
  () =>
    import("@/components/cinematic/CinematicLandingFinal").then(
      (m) => m.CinematicLandingFinal,
    ),
  { ssr: false, loading: () => <HomepageShell /> },
);

function HomepageShell() {
  const heroImage =
    process.env.NEXT_PUBLIC_NIWASTHAN_HERO_IMAGE || "/hero/01-entrance.webp";
  return (
    <main className="min-h-screen bg-[#12110f] text-[#f4eee2]">
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-[radial-gradient(circle_at_55%_35%,#756a5c_0%,#39342e_34%,#12110f_78%)]">
        <Image
          src={heroImage}
          alt="Niwasthan 4BHK residence"
          fill
          priority
          className="object-cover object-center"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-[#12110f]" />
        <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-6 md:px-12 md:py-8">
          <span className="font-display text-xl md:text-2xl">Niwasthan</span>
          <span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 font-mono text-[9px] uppercase tracking-[.18em] text-white/70 backdrop-blur-md">
            4BHK Residence
          </span>
        </header>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 md:px-12 md:pb-24">
          <p className="font-mono text-[10px] uppercase tracking-[.32em] text-[#d7b679]">
            Niwasthan Residence
          </p>
          <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.4rem,9vw,8.5rem)] leading-[.88] tracking-[-.055em]">
            Your home.
            <br />
            Designed your way.
          </h1>
        </div>
      </section>
    </main>
  );
}

class HomepageBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Niwasthan homepage client rendering failed:", error);
  }
  render() {
    return this.state.failed ? <HomepageShell /> : this.props.children;
  }
}

export default function HomePage() {
  return (
    <HomepageBoundary>
      <CinematicLanding />
    </HomepageBoundary>
  );
}
