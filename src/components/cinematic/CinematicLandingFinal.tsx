"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, ChevronDown, Maximize2, Menu, X } from "lucide-react";

const rooms = [
  { name: "Entrance", number: "01", subtitle: "A considered arrival", image: "/hero/01-entrance.webp", details: ["Twin-car covered driveway with natural stone cladding", "Vertical timber screen framing the upper floor", "Layered landscape lighting along the approach"] },
  { name: "Drawing Room", number: "02", subtitle: "First impressions, beautifully composed", image: "/hero/02-drawing-room.webp", details: ["Wood-paneled entry wall with a floating console", "Direct sightline through to the garden beyond", "Warm, recessed ceiling lighting throughout"] },
  { name: "Living Room", number: "03", subtitle: "The heart of everyday life", image: "/hero/03-living-room.webp", details: ["Full-height sliding glass opening onto the garden", "Exposed natural stone feature wall", "Integrated media wall with concealed storage"] },
  { name: "Kitchen", number: "04", subtitle: "Function, flow and material intelligence", image: "/hero/04-kitchen.webp", details: ["Waterfall-edge marble island seating four", "Book-matched veined stone backsplash", "Warm brass pendant lighting over the island"] },
  { name: "Master Bedroom", number: "05", subtitle: "Quiet, warm and deeply personal", image: "/hero/05-master-bedroom.webp", details: ["Direct access to a private balcony", "Wood-slat feature wall behind the bed", "Layered ambient and reading-lamp lighting"] },
  { name: "Kids' Room", number: "06", subtitle: "Playful, practical and ready to grow", image: "/hero/06-kids-room.webp", details: ["Twin beds with a shared built-in storage headboard", "Dedicated study nook with its own task lighting", "Garden-facing window seat for morning light"] },
  { name: "Balcony", number: "07", subtitle: "The final frame: open sky and home", image: "/hero/07-balcony.webp", details: ["Full-height glass balustrade, unobstructed view", "Covered lounge seating for evening use", "Layered garden lighting visible below"] },
];

const pillars = [
  { number: "01", title: "See it before you commit", text: "Explore the rooms, proportions, finishes and important decisions before work begins.", image: "/hero/02-drawing-room.webp" },
  { number: "02", title: "Know what you are paying for", text: "Connect design decisions to products, materials and a budget you can understand.", image: "/hero/04-kitchen.webp" },
  { number: "03", title: "Keep control of the plan", text: "Take the verified direction forward yourself, or choose Niwasthan to deliver it.", image: "/hero/05-master-bedroom.webp" },
  { number: "04", title: "Build what was approved", text: "Keep execution tied to the agreed direction, with changes surfaced rather than hidden.", image: "/hero/07-balcony.webp" },
];

const processSteps = [
  ["01", "Tell us about your home", "Start with your space, priorities and the budget you want to work within."],
  ["02", "Shape the design", "Explore a coherent direction room by room, with decisions made visible as the plan develops."],
  ["03", "Understand the cost", "See what each decision means for the budget before you move from design to execution."],
  ["04", "Choose how to execute", "Take the verified plan forward yourself, or have Niwasthan deliver the home."],
];

const faqs = [
  ["Is Niwasthan only for people who want turnkey execution?", "No. You can use the verified design and material direction yourself, or choose Niwasthan for execution."],
  ["How is this different from a conventional interior quote?", "The focus is on making the design, products and budget relationship understandable before you agree to the work."],
  ["Are the products and prices guaranteed?", "Only information that has actually been verified should be presented as verified. Availability and market pricing can change, so the experience surfaces that status clearly."],
  ["Can I explore the home before signing in?", "Yes. The public experience lets you walk through the showcased residence and understand the approach before starting your own project."],
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
  const links = [["Experience", "#walkthrough"], ["The idea", "#idea"], ["Why Niwasthan", "#why-niwasthan"], ["How it works", "#process"], ["FAQ", "#faq"]];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between rounded-full border border-[#d6b477]/25 bg-[#0d0c0b]/65 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-5">
          <Link href="/" className="font-display text-[1.35rem] font-medium tracking-[-0.045em] text-[#f5eee1] sm:text-[1.55rem]">
            Niwasthan<span className="ml-1 text-[#d6b477]">.</span>
          </Link>
          <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d6b477]/30 bg-[#d6b477]/10 text-[#e3c58f] transition hover:bg-[#d6b477]/20">
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-between bg-[#090908]/98 px-6 pb-10 pt-28 backdrop-blur-2xl sm:px-10 sm:pt-32">
          <nav className="mx-auto flex w-full max-w-[1100px] flex-col gap-2">
            {links.map(([label, href], index) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="group flex items-baseline gap-4 border-b border-[#d6b477]/15 py-4 font-display text-[2.25rem] leading-none tracking-[-0.035em] text-[#f5eee1] transition hover:text-[#d6b477] sm:py-5 sm:text-5xl md:text-6xl">
                <span className="font-mono text-[9px] tracking-[0.18em] text-[#d6b477]/70">0{index + 1}</span>
                {label}
              </a>
            ))}
          </nav>
          <div className="mx-auto w-full max-w-[1100px] border-t border-[#d6b477]/15 pt-7">
            <p className="max-w-md font-body text-sm leading-relaxed text-white/45">A clearer way to design, understand and deliver a home.</p>
            <Link href="/sign-in" onClick={() => setOpen(false)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d6b477] px-6 py-3 font-body text-sm font-semibold text-[#0d0c0b]">Start your home <ArrowRight size={16} /></Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Hero({ imageUrl }: { imageUrl: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#090908]">
      {!failed ? <Image src={imageUrl} alt="Niwasthan 4BHK residence" fill priority sizes="100vw" className="object-cover object-center" onError={() => setFailed(true)} /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,#51483b_0%,#211e19_38%,#090908_78%)]" />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/15 to-[#090908]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_38%,transparent_0%,rgba(0,0,0,.18)_45%,rgba(0,0,0,.7)_100%)]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-5 pb-12 pt-28 sm:px-8 md:px-10 md:pb-16">
        <div className="max-w-6xl">
          <h1 className="max-w-5xl font-display text-[clamp(4rem,10vw,10rem)] leading-[0.79] font-medium tracking-[-0.065em] text-[#f5eee1]">
            A better way
            <br />
            to build home.
          </h1>
          <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-white/65 md:text-lg">See the space. Understand the design. Know the cost. Then decide how you want it delivered.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#walkthrough" className="inline-flex items-center gap-2 rounded-full bg-[#d6b477] px-6 py-3.5 font-body text-sm font-semibold text-[#0d0c0b] transition hover:bg-[#e2c58f]">Explore the residence <ArrowRight size={16} /></a>
            <Link href="/sign-in" className="inline-flex items-center gap-2 rounded-full border border-[#d6b477]/35 bg-black/20 px-6 py-3.5 font-body text-sm font-medium text-[#f5eee1] backdrop-blur-md transition hover:bg-[#d6b477]/10">Start your project</Link>
          </div>
        </div>
        <a href="#walkthrough" className="mt-14 flex w-fit items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#d6b477]/70 transition hover:text-[#d6b477]"><ArrowDown size={13} /> Scroll to enter</a>
      </div>
    </section>
  );
}

function Walkthrough() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const walkthroughRef = useRef<HTMLElement>(null);
  const opacities = useRoomCrossfade(scrollProgress);
  const activeRoom = opacities.reduce((best, opacity, index) => (opacity > opacities[best] ? index : best), 0);

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
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", update); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  const jumpToRoom = (index: number) => {
    const element = walkthroughRef.current;
    if (!element) return;
    const travel = Math.max(element.offsetHeight - window.innerHeight, 1);
    window.scrollTo({ top: element.offsetTop + travel * (index / (rooms.length - 1)), behavior: "smooth" });
  };

  return (
    <section ref={walkthroughRef} id="walkthrough" className="relative h-[720vh] bg-[#090908]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">{rooms.map((room, index) => <Image key={room.name} src={room.image} alt={room.name} fill priority={index === 0} sizes="100vw" className="object-cover object-center" style={{ opacity: opacities[index], transition: "opacity 360ms linear, transform 9000ms linear", transform: opacities[index] > 0.5 ? "scale(1.06)" : "scale(1)", willChange: "opacity, transform" }} />)}</div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#090908]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_20%,rgba(0,0,0,.12)_58%,rgba(0,0,0,.78)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-7 sm:px-8 md:px-10 md:pb-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#d6b477]">
                  <span>ROOM {rooms[activeRoom].number}</span>
                  <span className="h-px w-8 bg-[#d6b477]/55" />
                  <span>{rooms[activeRoom].name}</span>
                </div>
                <h2 className="mt-2 font-display text-[clamp(3.2rem,7vw,7rem)] leading-[0.82] font-medium tracking-[-0.055em] text-[#f5eee1]">{rooms[activeRoom].name}</h2>
                <p className="mt-3 max-w-xl font-body text-sm text-white/55">{rooms[activeRoom].subtitle}</p>
              </div>
              <div className="flex items-end gap-5">
                <ul className="hidden max-w-sm space-y-1.5 md:block">{rooms[activeRoom].details.map((detail) => <li key={detail} className="flex gap-2 font-body text-xs leading-relaxed text-white/60"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#d6b477]" />{detail}</li>)}</ul>
                <button aria-label="View fullscreen" onClick={() => document.documentElement.requestFullscreen?.()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d6b477]/35 bg-black/35 text-[#d6b477] backdrop-blur-md hover:bg-[#d6b477]/10"><Maximize2 size={16} /></button>
              </div>
            </div>
            <div className="mt-7 flex gap-1.5">{rooms.map((room, index) => <button key={room.name} onClick={() => jumpToRoom(index)} aria-label={`Go to ${room.name}`} className="group relative h-8 flex-1"><span className={`absolute inset-x-0 top-3 h-1 rounded-full transition-all ${index <= activeRoom ? "bg-[#d6b477]" : "bg-white/20"}`} /><span className="absolute left-0 top-5 hidden font-mono text-[8px] uppercase tracking-[0.12em] text-white/45 group-hover:block">{room.name}</span></button>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d6b477]">{children}</p>;
}

function Intro() {
  return (
    <section id="idea" className="bg-[#090908] px-5 py-28 text-[#f5eee1] sm:py-36 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1440px]">
        <SectionLabel>The idea</SectionLabel>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-24">
          <h2 className="max-w-6xl font-display text-[clamp(3.8rem,8vw,8.5rem)] leading-[0.82] font-medium tracking-[-0.06em]">Your home should never feel like a black box.</h2>
          <div className="lg:pt-4">
            <p className="max-w-xl font-body text-lg leading-[1.65] text-white/62 md:text-xl">A home is a series of decisions. Niwasthan makes those decisions easier to see, understand and own before they become expensive commitments.</p>
            <p className="mt-6 max-w-xl font-body text-sm leading-[1.75] text-white/40 md:text-base">Explore the space. Understand the design. See how choices affect the budget. Then decide what happens next.</p>
          </div>
        </div>
        <div className="mt-20 grid gap-3 border-t border-[#d6b477]/15 pt-5 sm:grid-cols-3">
          <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#d6b477]/60">01</p><p className="mt-3 font-display text-2xl text-white">See clearly.</p></div>
          <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#d6b477]/60">02</p><p className="mt-3 font-display text-2xl text-white">Choose confidently.</p></div>
          <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#d6b477]/60">03</p><p className="mt-3 font-display text-2xl text-white">Build intentionally.</p></div>
        </div>
      </div>
    </section>
  );
}

function WhyNiwasthan() {
  return (
    <section id="why-niwasthan" className="bg-[#0d0c0b] px-5 py-28 text-[#f5eee1] sm:py-36 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-6 border-b border-[#d6b477]/15 pb-10 md:flex-row md:items-end md:justify-between">
          <div><SectionLabel>Why Niwasthan</SectionLabel><h2 className="mt-7 max-w-5xl font-display text-[clamp(4rem,8vw,8.5rem)] leading-[0.8] font-medium tracking-[-0.065em]">More clarity.<br />More control.</h2></div>
          <p className="max-w-sm font-body text-sm leading-relaxed text-white/40 md:pb-2">A home journey designed around visibility, choice and confidence.</p>
        </div>
        <div className="mt-12 grid gap-px bg-[#d6b477]/15 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => <article key={pillar.number} className="group relative min-h-[30rem] overflow-hidden bg-[#0d0c0b] p-7 md:p-8">
            <Image src={pillar.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover opacity-25 transition duration-700 group-hover:scale-105 group-hover:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0b] via-[#0d0c0b]/65 to-transparent" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#d6b477]">{pillar.number}</span>
              <div><h3 className="max-w-[14rem] font-display text-3xl leading-[0.95] tracking-[-0.03em] text-[#f5eee1] md:text-4xl">{pillar.title}</h3><p className="mt-5 max-w-xs font-body text-sm leading-relaxed text-white/50">{pillar.text}</p></div>
            </div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function Promise() {
  const benefits = ["A coherent room-by-room design direction", "Product and material decisions you can understand", "A budget relationship you can see while choosing", "A clear choice between self-execution and Niwasthan execution"];
  return (
    <section className="bg-[#090908] px-5 py-28 text-[#f5eee1] sm:py-36 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1440px] rounded-[2rem] border border-[#d6b477]/20 bg-[#11100e] p-7 sm:p-10 md:p-14 lg:p-20">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_.85fr] lg:gap-24">
          <div><SectionLabel>The promise</SectionLabel><h2 className="mt-7 max-w-5xl font-display text-[clamp(4rem,8vw,8rem)] leading-[0.8] font-medium tracking-[-0.065em]">A home you understand.<br /><span className="text-[#d6b477]">A choice you own.</span></h2><p className="mt-9 max-w-2xl font-body text-lg leading-[1.65] text-white/55 md:text-xl">We are not here to make the most expensive answer look inevitable. We are here to make the right answer visible enough for you to choose.</p></div>
          <div className="lg:pt-16"><p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#d6b477]/60">What that means</p><ul className="mt-6 divide-y divide-[#d6b477]/15 border-y border-[#d6b477]/15">{benefits.map((benefit) => <li key={benefit} className="flex gap-4 py-5 font-body text-sm leading-relaxed text-white/65"><Check size={17} className="mt-0.5 shrink-0 text-[#d6b477]" />{benefit}</li>)}</ul></div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="bg-[#0d0c0b] px-5 py-28 text-[#f5eee1] sm:py-36 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1440px]">
        <div className="max-w-5xl"><SectionLabel>How it works</SectionLabel><h2 className="mt-7 font-display text-[clamp(4rem,8vw,8.5rem)] leading-[0.8] font-medium tracking-[-0.065em]">From first idea<br />to final detail.</h2></div>
        <div className="mt-16 border-t border-[#d6b477]/15">{processSteps.map(([number, title, text]) => <article key={number} className="grid gap-6 border-b border-[#d6b477]/15 py-9 md:grid-cols-[90px_1fr_1fr] md:items-center md:py-12"><span className="font-mono text-[10px] tracking-[0.2em] text-[#d6b477]">{number}</span><h3 className="font-display text-3xl tracking-[-0.03em] text-[#f5eee1] md:text-5xl">{title}</h3><p className="max-w-md font-body text-sm leading-[1.7] text-white/42 md:text-base">{text}</p></article>)}</div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-[#090908] px-5 py-28 text-[#f5eee1] sm:py-36 md:px-10 md:py-48">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><SectionLabel>FAQ</SectionLabel><h2 className="mt-7 max-w-xl font-display text-[clamp(4rem,7vw,7.5rem)] leading-[0.8] font-medium tracking-[-0.065em]">Clear answers.<br /><span className="text-[#d6b477]">No fine print fog.</span></h2></div><div className="border-t border-[#d6b477]/15">{faqs.map(([question, answer], index) => { const isOpen = open === index; return <div key={question} className="border-b border-[#d6b477]/15"><button onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-7 text-left"><span className="font-display text-2xl tracking-[-0.025em] md:text-3xl">{question}</span><ChevronDown size={19} className={`shrink-0 text-[#d6b477] transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen ? <p className="max-w-2xl pb-8 pr-8 font-body text-sm leading-[1.75] text-white/45 md:text-base">{answer}</p> : null}</div>; })}</div></div>
    </section>
  );
}

function FinalCTA() {
  return <section className="relative overflow-hidden bg-[#050504] px-5 py-32 text-[#f5eee1] sm:py-40 md:px-10 md:py-56"><div className="absolute left-1/2 top-1/2 h-[45rem] w-[45rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d6b477]/10" /><div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d6b477]/10" /><div className="relative mx-auto max-w-[1100px] text-center"><SectionLabel>Your home starts here</SectionLabel><h2 className="mx-auto mt-7 max-w-5xl font-display text-[clamp(4rem,9vw,9rem)] leading-[0.78] font-medium tracking-[-0.07em]">Stop guessing.<br /><span className="text-[#d6b477]">Start designing.</span></h2><p className="mx-auto mt-9 max-w-xl font-body text-base leading-relaxed text-white/45 md:text-lg">Explore the Niwasthan experience, then take the first step toward your own home.</p><Link href="/sign-in" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#d6b477] px-7 py-4 font-body text-sm font-semibold text-[#0d0c0b] transition hover:bg-[#e2c58f]">Start with your home <ArrowRight size={17} /></Link></div></section>;
}

export function CinematicLandingFinal() {
  const heroImage = process.env.NEXT_PUBLIC_NIWASTHAN_HERO_IMAGE ?? rooms[0].image;
  return <main className="min-h-screen bg-[#090908] text-[#f5eee1] selection:bg-[#d6b477] selection:text-[#090908]"><SiteNav /><Hero imageUrl={heroImage} /><Walkthrough /><Intro /><WhyNiwasthan /><Promise /><Process /><FAQ /><FinalCTA /><footer className="border-t border-[#d6b477]/15 bg-[#050504] px-5 py-9 text-white/35 md:px-10"><div className="mx-auto flex max-w-[1440px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><span className="font-display text-2xl font-medium tracking-[-0.045em] text-[#f5eee1]">Niwasthan<span className="text-[#d6b477]">.</span></span><div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[8px] uppercase tracking-[0.18em]"><a href="#walkthrough" className="hover:text-[#d6b477]">Experience</a><a href="#process" className="hover:text-[#d6b477]">How it works</a><a href="#faq" className="hover:text-[#d6b477]">FAQ</a><a href="mailto:support@niwasthan.com" className="hover:text-[#d6b477]">Contact</a></div></div><div className="mx-auto mt-8 flex max-w-[1440px] justify-between border-t border-[#d6b477]/10 pt-5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/20"><span>Home intelligence</span><span>Project-led</span></div></footer></main>;
}
