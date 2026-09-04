"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Maximize2,
  Menu,
  X,
} from "lucide-react";

const rooms = [
  {
    name: "Entrance",
    number: "01",
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
    number: "02",
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
    number: "03",
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
    number: "04",
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
    number: "05",
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
    number: "06",
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
    number: "07",
    subtitle: "The final frame: open sky and home",
    image: "/hero/07-balcony.webp",
    details: [
      "Full-height glass balustrade, unobstructed view",
      "Covered lounge seating for evening use",
      "Layered garden lighting visible below",
    ],
  },
];

const pillars = [
  {
    number: "01",
    title: "See it before you commit",
    text: "Understand the rooms, proportions, finishes and decisions before a build begins.",
  },
  {
    number: "02",
    title: "Know what you are paying for",
    text: "Design decisions are connected to real products, prices and availability instead of vague allowances.",
  },
  {
    number: "03",
    title: "Keep control of the plan",
    text: "You can use the verified plan for execution yourself or choose Niwasthan to deliver it.",
  },
  {
    number: "04",
    title: "Build what was approved",
    text: "The execution direction stays tied to the plan you agreed to, with substitutions surfaced rather than hidden.",
  },
];

const processSteps = [
  [
    "01",
    "Tell us about your home",
    "Start with the space, your priorities and the budget you want to work within.",
  ],
  [
    "02",
    "Shape the design",
    "Explore a coherent direction room by room, with decisions made visible as the plan develops.",
  ],
  [
    "03",
    "Understand the cost",
    "See what each decision means for the budget before you move from design to execution.",
  ],
  [
    "04",
    "Choose how to execute",
    "Take the verified plan forward yourself, or have Niwasthan deliver the home.",
  ],
];

const faqs = [
  [
    "Is Niwasthan only for people who want turnkey execution?",
    "No. The proposition is deliberately flexible: you can use the verified design and material direction yourself, or choose Niwasthan for execution.",
  ],
  [
    "How is this different from a conventional interior quote?",
    "The focus is on making decisions legible: the design, products and budget relationship should be understandable before you agree to the work.",
  ],
  [
    "Are the products and prices guaranteed?",
    "Only information that has actually been verified should be presented as verified. Availability and market pricing can change, so the experience is designed to surface that status rather than hide it.",
  ],
  [
    "Can I explore the home before signing in?",
    "Yes. The public experience is designed to explain the approach and let you walk through the showcased residence before you start your own project.",
  ],
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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

function SiteNav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["The experience", "#walkthrough"],
    ["How it works", "#process"],
    ["Why Niwasthan", "#why-niwasthan"],
    ["FAQ", "#faq"],
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-5 py-5 md:px-10 md:py-6">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between rounded-full border border-white/15 bg-black/20 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl md:px-5">
          <Link
            href="/"
            className="font-display text-xl tracking-[-0.03em] text-white md:text-2xl"
          >
            Niwasthan
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="font-body text-[11px] font-medium tracking-[0.08em] text-white/65 transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden rounded-full bg-[#f5efe3] px-5 py-2.5 font-body text-xs font-semibold text-[#151310] transition-transform hover:scale-[1.03] sm:inline-flex"
            >
              Start your home
            </Link>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/10"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-between bg-[#11100e]/98 px-6 pb-10 pt-32 backdrop-blur-2xl">
          <nav className="flex flex-col gap-5">
            {links.map(([label, href], index) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-white/10 pb-5 font-display text-4xl tracking-[-0.03em] text-white sm:text-5xl"
              >
                <span className="font-mono text-[9px] text-[#cda86a]">
                  0{index + 1}
                </span>
                {label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-4">
            <p className="max-w-sm font-body text-sm leading-relaxed text-white/45">
              A more transparent way to design, understand and deliver a home.
            </p>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f5efe3] px-6 py-3 font-body text-sm font-semibold text-[#151310]"
            >
              Start your home <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Hero({ imageUrl }: { imageUrl: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#171512]">
      {!failed ? (
        <Image
          src={imageUrl}
          alt="Niwasthan 4BHK residence"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,#756a5c_0%,#39342e_34%,#12110f_78%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/15 to-[#12110f]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,transparent_0%,rgba(0,0,0,.12)_40%,rgba(0,0,0,.65)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-5 pb-12 pt-32 md:px-10 md:pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-5xl">
            <div className="mb-5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#d6b477]">
              <span className="h-px w-8 bg-[#d6b477]/70" />A Niwasthan residence
            </div>
            <h1 className="max-w-5xl font-display text-[clamp(3.8rem,9.5vw,9.5rem)] leading-[0.82] tracking-[-0.055em] text-[#f6f0e5]">
              A better way
              <br />
              to build home.
            </h1>
            <p className="mt-7 max-w-xl font-body text-base leading-relaxed text-white/65 md:text-lg">
              See the space. Understand the design. Know the cost. Then decide
              how you want it delivered.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#walkthrough"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5efe3] px-6 py-3.5 font-body text-sm font-semibold text-[#151310] transition-transform hover:scale-[1.03]"
              >
                Explore the residence <ArrowRight size={16} />
              </a>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-6 py-3.5 font-body text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                Start your project
              </Link>
            </div>
          </div>

          <div className="hidden w-64 border-l border-white/20 pl-6 lg:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
              Featured residence
            </p>
            <p className="mt-3 font-display text-3xl text-white">4BHK</p>
            <p className="mt-1 font-body text-xs leading-relaxed text-white/50">
              A complete residential story, from arrival to the final balcony
              frame.
            </p>
          </div>
        </div>
        <a
          href="#walkthrough"
          className="mt-14 flex w-fit items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-white/75"
        >
          <ArrowDown size={13} /> Scroll to enter
        </a>
      </div>
    </section>
  );
}

function Walkthrough() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const walkthroughRef = useRef<HTMLElement>(null);
  const opacities = useRoomCrossfade(scrollProgress);
  const activeRoom = opacities.reduce(
    (best, opacity, index) => (opacity > opacities[best] ? index : best),
    0,
  );

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const element = walkthroughRef.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        const travel = Math.max(element.offsetHeight - window.innerHeight, 1);
        setScrollProgress(clamp(-rect.top / travel, 0, 1));
      }
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

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
    <section
      ref={walkthroughRef}
      id="walkthrough"
      className="relative h-[720vh] bg-[#171512]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {rooms.map((room, index) => (
            <Image
              key={room.name}
              src={room.image}
              alt={room.name}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover object-center ${opacities[index] > 0.5 ? "scale-[1.06]" : "scale-100"}`}
              style={{
                opacity: opacities[index],
                transition: "opacity 360ms linear, transform 9000ms linear",
                willChange: "opacity, transform",
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-[#12110f]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_18%,rgba(0,0,0,.12)_55%,rgba(0,0,0,.72)_100%)]" />

        <div className="absolute inset-x-0 top-0 z-20 px-5 pt-28 md:px-10 md:pt-32">
          <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#d6b477]">
                The experience
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.9] tracking-[-0.04em] text-white sm:text-5xl md:text-7xl">
                Walk through the home.
              </h2>
            </div>
            <p className="hidden max-w-xs pt-1 text-right font-body text-xs leading-relaxed text-white/50 md:block">
              A room-by-room visual story. Scroll slowly and let each space
              reveal itself.
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-7 md:px-10 md:pb-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#d6b477]">
                  <span>{rooms[activeRoom].number}</span>
                  <span className="h-px w-8 bg-[#d6b477]/60" />
                  <span>Now entering</span>
                </div>
                <h3 className="mt-2 font-display text-5xl tracking-[-0.035em] text-white sm:text-6xl md:text-7xl">
                  {rooms[activeRoom].name}
                </h3>
                <p className="mt-2 font-body text-sm text-white/55">
                  {rooms[activeRoom].subtitle}
                </p>
              </div>
              <div className="flex items-end gap-5">
                <ul className="hidden max-w-sm space-y-1.5 md:block">
                  {rooms[activeRoom].details.map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-2 font-body text-xs leading-relaxed text-white/65"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#d6b477]" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <button
                  aria-label="View fullscreen"
                  onClick={() => document.documentElement.requestFullscreen?.()}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md hover:bg-white/10"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-7 flex gap-1.5">
              {rooms.map((room, index) => (
                <button
                  key={room.name}
                  onClick={() => jumpToRoom(index)}
                  aria-label={`Go to ${room.name}`}
                  className="group relative h-8 flex-1"
                >
                  <span
                    className={`absolute inset-x-0 top-3 h-1 rounded-full transition-all ${index <= activeRoom ? "bg-[#d6b477]" : "bg-white/20"}`}
                  />
                  <span className="absolute left-0 top-5 hidden font-mono text-[8px] uppercase tracking-[0.12em] text-white/45 group-hover:block">
                    {room.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="bg-[#f4efe6] px-5 py-28 text-[#141311] sm:py-36 md:px-10 md:py-44">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-black/40">
            The idea
          </p>
          <p className="mt-7 max-w-xs font-body text-sm leading-relaxed text-black/55">
            Home renovation should feel considered and exciting — not like a
            negotiation you are trying to survive.
          </p>
        </div>
        <div>
          <h2 className="max-w-5xl font-display text-[clamp(3rem,6.5vw,6.8rem)] leading-[0.9] tracking-[-0.05em]">
            Your home is too important to be a black box.
          </h2>
          <p className="mt-9 max-w-2xl font-body text-base leading-relaxed text-black/60 md:text-lg">
            Niwasthan is built around a simple principle: make the important
            decisions visible before they become expensive decisions. Explore
            the space, understand the design, see how choices affect the budget,
            and keep control over what happens next.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhyNiwasthan() {
  return (
    <section
      id="why-niwasthan"
      className="bg-[#151412] px-5 py-28 text-[#f4efe6] sm:py-36 md:px-10 md:py-44"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="max-w-3xl">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#d6b477]">
            Why Niwasthan
          </p>
          <h2 className="mt-6 font-display text-[clamp(3rem,6.5vw,6.8rem)] leading-[0.88] tracking-[-0.05em]">
            Less ambiguity.
            <br />
            More ownership.
          </h2>
        </div>
        <div className="mt-20 grid border-y border-white/10 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.number}
              className={`border-white/10 p-7 md:p-8 ${index > 0 ? "border-t md:border-l md:border-t-0" : ""}`}
            >
              <span className="font-mono text-[9px] text-[#d6b477]">
                {pillar.number}
              </span>
              <h3 className="mt-14 max-w-[14rem] font-display text-3xl leading-[0.95] tracking-[-0.025em]">
                {pillar.title}
              </h3>
              <p className="mt-5 font-body text-sm leading-relaxed text-white/45">
                {pillar.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Promise() {
  const benefits = [
    "A coherent room-by-room design direction",
    "Product and material decisions that can be understood",
    "A budget relationship you can see while choosing",
    "A clear choice between self-execution and Niwasthan execution",
  ];
  return (
    <section className="bg-[#e9e2d5] px-5 py-28 text-[#151310] sm:py-36 md:px-10 md:py-44">
      <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-black/40">
            The promise
          </p>
          <h2 className="mt-6 max-w-4xl font-display text-[clamp(3.2rem,6vw,6.5rem)] leading-[0.88] tracking-[-0.05em]">
            Price you decide.
            <br />
            Work you choose.
          </h2>
          <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-black/55 md:text-lg">
            The point is not to push you toward the most expensive answer. It is
            to make the answer understandable enough that you can choose it with
            confidence.
          </p>
        </div>
        <div className="lg:pt-20">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-black/35">
            What that means
          </p>
          <ul className="mt-7 divide-y divide-black/10 border-y border-black/10">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex gap-4 py-5 font-body text-sm leading-relaxed"
              >
                <Check size={17} className="mt-0.5 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section
      id="process"
      className="bg-white px-5 py-28 text-[#151310] sm:py-36 md:px-10 md:py-44"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-black/40">
              How it works
            </p>
            <h2 className="mt-6 font-display text-[clamp(3rem,6vw,6.5rem)] leading-[0.88] tracking-[-0.05em]">
              From first idea
              <br />
              to a home you own.
            </h2>
          </div>
          <p className="max-w-sm font-body text-sm leading-relaxed text-black/50">
            Four clear stages. No need to understand the whole process before
            you take the first step.
          </p>
        </div>
        <div className="mt-20 border-t border-black/10">
          {processSteps.map(([number, title, text]) => (
            <article
              key={number}
              className="grid gap-5 border-b border-black/10 py-8 md:grid-cols-[100px_1fr_1fr] md:items-center md:py-10"
            >
              <span className="font-mono text-[9px] text-black/35">
                {number}
              </span>
              <h3 className="font-display text-3xl tracking-[-0.025em] md:text-4xl">
                {title}
              </h3>
              <p className="max-w-md font-body text-sm leading-relaxed text-black/50">
                {text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      id="faq"
      className="bg-[#f4efe6] px-5 py-28 text-[#151310] sm:py-36 md:px-10 md:py-44"
    >
      <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-black/40">
            FAQ
          </p>
          <h2 className="mt-6 max-w-xl font-display text-[clamp(3rem,5.5vw,5.8rem)] leading-[0.9] tracking-[-0.05em]">
            Good questions deserve clear answers.
          </h2>
        </div>
        <div className="border-t border-black/10">
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <div key={question} className="border-b border-black/10">
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-2xl tracking-[-0.02em] md:text-3xl">
                    {question}
                  </span>
                  <ChevronDown
                    size={19}
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen ? (
                  <p className="max-w-2xl pb-7 pr-8 font-body text-sm leading-relaxed text-black/55">
                    {answer}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#171512] px-5 py-32 text-[#f4efe6] sm:py-40 md:px-10 md:py-52">
      <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full border border-[#d6b477]/10" />
      <div className="absolute -right-8 -top-16 h-[20rem] w-[20rem] rounded-full border border-[#d6b477]/10" />
      <div className="relative mx-auto max-w-[1100px] text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#d6b477]">
          Your home starts here
        </p>
        <h2 className="mx-auto mt-6 max-w-5xl font-display text-[clamp(3.3rem,7vw,7.5rem)] leading-[0.86] tracking-[-0.055em]">
          Stop guessing.
          <br />
          Start designing.
        </h2>
        <p className="mx-auto mt-8 max-w-xl font-body text-base leading-relaxed text-white/50 md:text-lg">
          Explore the Niwasthan experience, then take the first step toward your
          own home.
        </p>
        <Link
          href="/sign-in"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#f5efe3] px-7 py-4 font-body text-sm font-semibold text-[#151310] transition-transform hover:scale-[1.03]"
        >
          Start with your home <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

export function CinematicLandingFinal() {
  const heroImage =
    process.env.NEXT_PUBLIC_NIWASTHAN_HERO_IMAGE ?? rooms[0].image;
  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#151310] selection:bg-[#d6b477] selection:text-[#151310]">
      <SiteNav />
      <Hero imageUrl={heroImage} />
      <Walkthrough />
      <Intro />
      <WhyNiwasthan />
      <Promise />
      <Process />
      <FAQ />
      <FinalCTA />
      <footer className="border-t border-white/10 bg-[#11100e] px-5 py-9 text-white/40 md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-xl text-white">Niwasthan</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[8px] uppercase tracking-[0.18em]">
            <a href="#walkthrough" className="hover:text-white">
              Experience
            </a>
            <a href="#process" className="hover:text-white">
              How it works
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
            <a href="mailto:support@niwasthan.com" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-[1440px] justify-between border-t border-white/10 pt-5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
          <span>Home intelligence</span>
          <span>Project-led</span>
        </div>
      </footer>
    </main>
  );
}
