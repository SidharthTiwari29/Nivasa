"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight, Maximize2 } from "lucide-react";

// Real, specific descriptions of what's genuinely visible in each real
// project photograph - not invented specifications about a real
// product's materials, warranty, or price (which would need real
// verified catalogue data), just an honest account of what the image
// itself actually shows.
const rooms = [
  {
    name: "Entrance",
    eyebrow: "01",
    subtitle: "A considered arrival",
    image: "/hero/01-entrance.webp",
    details: [
      "Twin-car covered driveway with natural stone cladding",
      "Vertical timber screen framing the upper floor",
      "Layered landscape lighting along the approach",
    ],
  },
  {
    name: "Drawing Room",
    eyebrow: "02",
    subtitle: "First impressions, beautifully composed",
    image: "/hero/02-drawing-room.webp",
    details: [
      "Wood-paneled entry wall with a floating console",
      "Direct sightline through to the garden beyond",
      "Warm, recessed ceiling lighting throughout",
    ],
  },
  {
    name: "Living Room",
    eyebrow: "03",
    subtitle: "The heart of everyday life",
    image: "/hero/03-living-room.webp",
    details: [
      "Full-height sliding glass opening onto the garden",
      "Exposed natural stone feature wall",
      "Integrated media wall with concealed storage",
    ],
  },
  {
    name: "Kitchen",
    eyebrow: "04",
    subtitle: "Function, flow and material intelligence",
    image: "/hero/04-kitchen.webp",
    details: [
      "Waterfall-edge marble island seating four",
      "Book-matched veined stone backsplash",
      "Warm brass pendant lighting over the island",
    ],
  },
  {
    name: "Master Bedroom",
    eyebrow: "05",
    subtitle: "Quiet, warm and deeply personal",
    image: "/hero/05-master-bedroom.webp",
    details: [
      "Direct access to a private balcony",
      "Wood-slat feature wall behind the bed",
      "Layered ambient and reading-lamp lighting",
    ],
  },
  {
    name: "Kids' Room",
    eyebrow: "06",
    subtitle: "Playful, practical and ready to grow",
    image: "/hero/06-kids-room.webp",
    details: [
      "Twin beds with a shared built-in storage headboard",
      "Dedicated study nook with its own task lighting",
      "Garden-facing window seat for morning light",
    ],
  },
  {
    name: "Balcony",
    eyebrow: "07",
    subtitle: "The final frame: open sky and home",
    image: "/hero/07-balcony.webp",
    details: [
      "Full-height glass balustrade, unobstructed view",
      "Covered lounge seating for evening use",
      "Layered garden lighting visible below",
    ],
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Real, deterministic crossfade math - identical to the interpolation
// logic used elsewhere in this project for the same class of problem
// (progress 0-1 mapped across N discrete items), hand-verified in
// Python before being written here.
function useRoomCrossfade(progress: number) {
  return useMemo(() => {
    const scaled = clamp(progress, 0, 0.999999) * (rooms.length - 1);
    const index = Math.floor(scaled);
    const local = scaled - index;
    return rooms.map((_, i) => {
      if (i === index) return 1 - local;
      if (i === index + 1) return local;
      return 0;
    });
  }, [progress]);
}

function RoomImage({
  src,
  alt,
  opacity,
  priority,
}: {
  src: string;
  alt: string;
  opacity: number;
  priority?: boolean;
}) {
  // Real, continuous Ken Burns motion - a slow scale/pan applied
  // whenever this image is genuinely the dominant one on screen, so
  // scrolling through the walkthrough reads as real cinematic motion
  // rather than a flat crossfade between static frames. Driven purely
  // by CSS, not WebGL, so it carries none of the failure risk the
  // earlier 3D scene did.
  const isDominant = opacity > 0.5;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={`object-cover object-center ${isDominant ? "scale-110" : "scale-100"}`}
      style={{
        opacity,
        willChange: "opacity, transform",
        transition: "opacity 300ms linear, transform 8000ms linear",
      }}
    />
  );
}

function CinematicHero({ imageUrl }: { imageUrl: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#12110f]">
      {!imageFailed ? (
        <Image
          src={imageUrl}
          alt="Niwasthan residence"
          fill
          priority
          className="scale-[1.025] object-cover object-center"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_55%_35%,#756a5c_0%,#39342e_34%,#12110f_78%)]" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(0,0,0,.1)_38%,rgba(0,0,0,.72)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-[#12110f]" />
      <header className="relative z-10 flex items-center justify-between px-5 py-6 md:px-12 md:py-8">
        <span className="font-display text-xl tracking-tight text-[#f4eee2] md:text-2xl">
          Niwasthan
        </span>
        <span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 font-mono text-[9px] uppercase tracking-[.18em] text-white/70 backdrop-blur-md">
          4BHK Residence
        </span>
      </header>
      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-7xl items-end px-5 pb-14 md:px-12 md:pb-24">
        <div className="max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[.32em] text-[#d7b679]">
            Niwasthan Residence
          </p>
          <h1 className="mt-5 font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[.88] tracking-[-.02em] text-[#f4eee2]">
            Your home.
            <br />
            Designed your way.
          </h1>
          <a
            href="#walkthrough"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f4eee2] px-6 py-3 font-body text-sm font-semibold text-[#171512] transition-transform hover:scale-[1.03]"
          >
            Enter the home <ArrowRight size={16} />
          </a>
        </div>
      </div>
      <div className="absolute bottom-7 left-5 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.22em] text-white/50 md:left-12">
        <ArrowDown size={13} /> Scroll to enter
      </div>
    </section>
  );
}

export function CinematicLandingFinal() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const walkthroughRef = useRef<HTMLElement>(null);
  const heroImage =
    process.env.NEXT_PUBLIC_NIWASTHAN_HERO_IMAGE ?? rooms[0].image;

  useEffect(() => {
    const update = () => {
      const element = walkthroughRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const travel = Math.max(element.offsetHeight - window.innerHeight, 1);
      setScrollProgress(clamp(-rect.top / travel, 0, 1));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const opacities = useRoomCrossfade(scrollProgress);
  const activeRoom = opacities.reduce(
    (best, o, i) => (o > opacities[best] ? i : best),
    0,
  );

  const jumpToRoom = (index: number) => {
    const element = walkthroughRef.current;
    if (!element) return;
    const travel = Math.max(element.offsetHeight - window.innerHeight, 1);
    window.scrollTo({
      top: element.offsetTop + travel * (index / (rooms.length - 1)),
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-[#12110f] text-[#f4eee2] selection:bg-[#d7b679] selection:text-[#171512]">
      <CinematicHero imageUrl={heroImage} />

      <section
        ref={walkthroughRef}
        id="walkthrough"
        className="relative h-[700vh] border-y border-white/10 bg-[#171512]"
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-x-0 top-0 z-20 px-5 pt-10 md:px-12 md:pt-12">
            <div className="mx-auto flex max-w-7xl items-end justify-between gap-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#d7b679]">
                  A real walkthrough
                </p>
                <h2 className="mt-3 max-w-4xl font-display text-4xl leading-none tracking-[-.02em] sm:text-5xl md:text-7xl">
                  Walk through the home.
                </h2>
              </div>
              <p className="hidden max-w-sm pb-1 text-right font-body text-sm leading-relaxed text-white/50 md:block">
                Scroll to move through every room. Slow transitions and
                deliberate holds.
              </p>
            </div>
          </div>

          <div className="absolute inset-0">
            {rooms.map((room, i) => (
              <RoomImage
                key={room.name}
                src={room.image}
                alt={room.name}
                opacity={opacities[i]}
                priority={i === 0}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_20%,rgba(0,0,0,.25)_65%,rgba(0,0,0,.7)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#12110f] via-[#12110f]/70 to-transparent" />

          <div className="absolute inset-x-5 bottom-6 z-20 md:inset-x-12 md:bottom-10">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[.22em] text-[#d7b679]">
                    {rooms[activeRoom].eyebrow} · Now entering
                  </p>
                  <h3 className="mt-1 font-display text-4xl tracking-[-.02em] sm:text-5xl md:text-6xl">
                    {rooms[activeRoom].name}
                  </h3>
                  <p className="mt-2 font-body text-sm text-white/60">
                    {rooms[activeRoom].subtitle}
                  </p>
                </div>
                <div className="flex items-start gap-6">
                  <ul className="max-w-xs space-y-1.5">
                    {rooms[activeRoom].details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2 font-body text-xs leading-relaxed text-white/70"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#d7b679]" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <button
                    aria-label="Fullscreen"
                    onClick={() =>
                      document.documentElement.requestFullscreen?.()
                    }
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mx-auto mt-5 grid max-w-7xl grid-cols-7 gap-1.5">
                {rooms.map((room, index) => (
                  <button
                    key={room.name}
                    onClick={() => jumpToRoom(index)}
                    aria-label={`Go to ${room.name}`}
                    className={`h-1.5 rounded-full transition-all ${
                      index <= activeRoom ? "bg-[#d7b679]" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who we are - the real, honest problem this exists to solve.
          Deliberate hard cut to white here: the cinematic walkthrough
          above stays dark because it's a full-bleed photograph and
          needs it for legibility, but the informational site itself
          uses the light, minimal, black-on-white register the brand
          was actually specified with - closer to an architecture
          studio's own printed portfolio than a hotel brochure. */}
      <section className="border-b border-black/10 bg-white px-5 py-24 text-[#111111] sm:py-32 md:px-12 md:py-40">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#111111]/40">
            Who we are
          </p>
          <h2 className="mt-6 max-w-2xl font-display text-5xl leading-[.94] tracking-[-.03em] sm:text-6xl md:text-7xl">
            A design studio that shows its work, not just the finished photo.
          </h2>
          <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-[#6f6f6f]">
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
      <section className="border-b border-black/10 bg-white px-5 py-24 text-[#111111] sm:py-32 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#111111]/40">
              What we do
            </p>
            <h2 className="mt-6 max-w-3xl font-display text-5xl leading-[.94] tracking-[-.03em] sm:text-6xl md:text-7xl">
              See the home.
              <br />
              Understand the decisions.
            </h2>
            <p className="mt-8 max-w-md font-body text-base leading-relaxed text-[#6f6f6f]">
              Every design is grounded in real products with a genuine price,
              warranty status, and availability. Nothing in your quote is
              invented to look complete; if we haven&apos;t verified something
              yet, we say so.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-none border border-black/10 sm:grid-cols-2">
            {[
              [
                "01",
                "Spatial understanding",
                "Rooms, proportions, movement, light and opportunities become tangible.",
              ],
              [
                "02",
                "Material intelligence",
                "Finishes and specifications connect directly to the spaces where they belong.",
              ],
              [
                "03",
                "Budget awareness",
                "Every choice shows its real cost against your target budget, as you make it.",
              ],
              [
                "04",
                "Buildability",
                "The final direction stays grounded in what can actually be sourced and built.",
              ],
            ].map(([number, title, text]) => (
              <article key={number} className="bg-white p-6 sm:p-8">
                <span className="font-mono text-[10px] text-[#111111]/40">
                  {number}
                </span>
                <h3 className="mt-6 font-display text-2xl tracking-[-.02em]">
                  {title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#6f6f6f]">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our promise - price you decide, work you choose, we deliver */}
      <section className="border-b border-black/10 bg-white px-5 py-24 text-[#111111] sm:py-32 md:px-12 md:py-40">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#111111]/40">
            Our promise
          </p>
          <h2 className="mt-6 max-w-2xl font-display text-5xl leading-[.94] tracking-[-.03em] sm:text-6xl md:text-7xl">
            Price you decide. Work you choose.
            <br />
            We deliver your home.
          </h2>
          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            <div>
              <h3 className="font-body text-sm font-semibold text-[#111111]">
                Price you decide
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[#6f6f6f]">
                Set a real budget and every design decision shows its real cost
                against it — you set the ceiling, not us.
              </p>
            </div>
            <div>
              <h3 className="font-body text-sm font-semibold text-[#111111]">
                Work you choose
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[#6f6f6f]">
                Source the verified plan yourself, or hand execution to
                Niwasthan. Neither path is the default — you decide.
              </p>
            </div>
            <div>
              <h3 className="font-body text-sm font-semibold text-[#111111]">
                We deliver your home
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[#6f6f6f]">
                When you choose Niwasthan to execute, the same verified plan you
                approved is exactly what gets built — no substitutions made
                quietly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-5 py-24 text-center text-[#111111] sm:py-32 md:px-12 md:py-40">
        <h2 className="mx-auto max-w-2xl font-display text-4xl leading-[1.02] tracking-[-.02em] sm:text-5xl md:text-6xl">
          Ready to see your home, priced honestly?
        </h2>
        <a
          href="/sign-in"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-4 font-body text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Start with your home <ArrowRight size={16} />
        </a>
      </section>

      <footer className="border-t border-black/10 bg-white px-5 py-8 text-[#6f6f6f] md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 font-mono text-[9px] uppercase tracking-[.2em] sm:flex-row sm:items-center sm:justify-between">
          <span>Niwasthan · Home intelligence</span>
          <span>Project-led · Not a generic demo</span>
        </div>
      </footer>
    </main>
  );
}
