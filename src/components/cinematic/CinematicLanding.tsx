"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Maximize2,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  RoundedBox,
  Text,
} from "@react-three/drei";
import * as THREE from "three";

const rooms = [
  {
    name: "Entrance",
    subtitle: "A considered arrival",
    position: [0, 1.55, 7.2] as [number, number, number],
    look: [0, 1.4, 2.2] as [number, number, number],
  },
  {
    name: "Drawing Room",
    subtitle: "First impressions, beautifully composed",
    position: [-2.8, 1.45, 2.8] as [number, number, number],
    look: [-1.5, 1.3, -0.5] as [number, number, number],
  },
  {
    name: "Living Room",
    subtitle: "The heart of everyday life",
    position: [-3.3, 1.35, -1.8] as [number, number, number],
    look: [-1, 1.2, -2.8] as [number, number, number],
  },
  {
    name: "Kitchen",
    subtitle: "Function, flow and material intelligence",
    position: [2.9, 1.45, -2.2] as [number, number, number],
    look: [2, 1.15, -3.8] as [number, number, number],
  },
  {
    name: "Master Bedroom",
    subtitle: "Quiet, warm and deeply personal",
    position: [2.9, 1.45, 1.8] as [number, number, number],
    look: [1.2, 1.2, 0.2] as [number, number, number],
  },
  {
    name: "Kids' Room",
    subtitle: "Playful, practical and ready to grow",
    position: [0.2, 1.45, -5.8] as [number, number, number],
    look: [0.2, 1.25, -7.8] as [number, number, number],
  },
  {
    name: "Balcony",
    subtitle: "The final frame: open sky and home",
    position: [-2.6, 1.5, -8.2] as [number, number, number],
    look: [-2.6, 1.35, -10] as [number, number, number],
  },
];

function RoomLabel({
  room,
  active,
}: {
  room: (typeof rooms)[number];
  active: boolean;
}) {
  return (
    <Text
      position={[room.position[0], 2.55, room.position[2] - 0.25]}
      fontSize={0.24}
      color={active ? "#f4e8cf" : "#d7cbb6"}
      anchorX="center"
      anchorY="middle"
      maxWidth={3}
    >
      {room.name}
    </Text>
  );
}

function WalkthroughScene({
  playing,
  onRoomChange,
}: {
  playing: boolean;
  onRoomChange: (index: number) => void;
}) {
  const { camera } = require("@react-three/fiber").useThree();
  const progressRef = useRef(0);
  const lastRoom = useRef(-1);

  useFrame((_, delta) => {
    if (playing) progressRef.current += delta / 6.0;
    const max = rooms.length - 1;
    const scaled = progressRef.current * max;
    const segment = Math.min(Math.floor(scaled), max - 1);
    const local = scaled - segment;
    const a = rooms[segment];
    const b = rooms[Math.min(segment + 1, max)];
    const eased =
      local < 0.5
        ? 4 * local * local * local
        : 1 - Math.pow(-2 * local + 2, 3) / 2;
    const targetPos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...a.position),
      new THREE.Vector3(...b.position),
      eased,
    );
    const targetLook = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...a.look),
      new THREE.Vector3(...b.look),
      eased,
    );
    camera.position.lerp(targetPos, 1 - Math.pow(0.001, delta));
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const desired = targetLook.sub(camera.position).normalize();
    currentLook.lerp(desired, 1 - Math.pow(0.01, delta));
    camera.lookAt(camera.position.clone().add(currentLook));

    const active = Math.min(Math.round(scaled), max);
    if (active !== lastRoom.current) {
      lastRoom.current = active;
      onRoomChange(active);
    }

    if (progressRef.current >= 1) progressRef.current = 0;
  });

  const walls = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 8, 4]} intensity={2.1} castShadow />
      <pointLight
        position={[-4, 2.5, 1]}
        intensity={35}
        distance={12}
        color="#f2c58a"
      />
      <pointLight
        position={[4, 2.2, -4]}
        intensity={28}
        distance={10}
        color="#c8d8ee"
      />
      <Environment preset="city" environmentIntensity={0.45} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, -1]}
        receiveShadow
      >
        <planeGeometry args={[11, 23]} />
        <meshStandardMaterial color="#a99d8b" roughness={0.68} />
      </mesh>

      {walls.map((i) => {
        const z = 8 - i * 3.2;
        return (
          <group key={i}>
            <RoundedBox
              position={[-5.2, 1.9, z]}
              args={[0.18, 3.8, 3.1]}
              radius={0.04}
              smoothness={4}
            >
              <meshStandardMaterial color="#e9e2d6" roughness={0.82} />
            </RoundedBox>
            <RoundedBox
              position={[5.2, 1.9, z]}
              args={[0.18, 3.8, 3.1]}
              radius={0.04}
              smoothness={4}
            >
              <meshStandardMaterial color="#e9e2d6" roughness={0.82} />
            </RoundedBox>
          </group>
        );
      })}

      <RoundedBox
        position={[-2.2, 0.55, 2.3]}
        args={[2.8, 0.85, 1.1]}
        radius={0.16}
        smoothness={6}
        castShadow
      >
        <meshStandardMaterial color="#765e49" roughness={0.82} />
      </RoundedBox>
      <RoundedBox
        position={[2.25, 0.6, -2.5]}
        args={[1.8, 1.1, 0.85]}
        radius={0.08}
        smoothness={5}
        castShadow
      >
        <meshStandardMaterial color="#4e463d" roughness={0.48} />
      </RoundedBox>
      <RoundedBox
        position={[2.5, 1.15, 1.5]}
        args={[1.65, 2.25, 0.65]}
        radius={0.06}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#795e45" roughness={0.62} />
      </RoundedBox>
      <RoundedBox
        position={[0.2, 0.5, -5.7]}
        args={[2.5, 0.85, 1.2]}
        radius={0.12}
        smoothness={5}
        castShadow
      >
        <meshStandardMaterial color="#6e7180" roughness={0.8} />
      </RoundedBox>
      <RoundedBox
        position={[-2.6, 0.35, -8.6]}
        args={[4.7, 0.35, 0.22]}
        radius={0.04}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#b8935a"
          roughness={0.42}
          metalness={0.18}
        />
      </RoundedBox>

      {rooms.map((room, index) => (
        <RoomLabel
          key={room.name}
          room={room}
          active={index === lastRoom.current}
        />
      ))}
    </>
  );
}

export function CinematicLanding() {
  const [playing, setPlaying] = useState(true);
  const [activeRoom, setActiveRoom] = useState(0);
  const [muted, setMuted] = useState(true);
  const heroImage =
    process.env.NEXT_PUBLIC_NIWASTHAN_HERO_IMAGE ||
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=3840&q=90";

  return (
    <main className="bg-[#12110f] text-[#f4eee2]">
      <section className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-[#12110f]" />
        <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <span className="font-display text-xl tracking-tight md:text-2xl">
            Niwasthan
          </span>
          <a
            href="#walkthrough"
            className="rounded-full border border-white/25 bg-black/20 px-4 py-2 font-body text-xs backdrop-blur-md hover:bg-white/10"
          >
            Experience the home
          </a>
        </header>
        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 md:px-12 md:pb-24">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d7b679]">
              4BHK · NIWASTHAN IMMERSIVE
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.94] tracking-[-0.04em] sm:text-6xl md:text-8xl">
              Your home.
              <br />
              Designed your way.
            </h1>
            <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-white/75 md:text-lg">
              Ghar mein ghusne se pehle, ghar ko experience karo. Explore a
              cinematic 4BHK journey where design, materials, budget and
              buildability meet.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#walkthrough"
                className="inline-flex items-center gap-2 rounded-full bg-[#f4eee2] px-6 py-3 font-body text-sm font-semibold text-[#171512]"
              >
                Start walkthrough <ArrowRight size={16} />
              </a>
              <a
                href="#intelligence"
                className="rounded-full border border-white/25 px-6 py-3 font-body text-sm text-white/90 backdrop-blur-md"
              >
                Explore Niwasthan
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 left-6 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55 md:left-12">
          <ArrowDown size={13} /> Scroll to enter
        </div>
      </section>

      <section
        id="walkthrough"
        className="relative border-y border-white/10 bg-[#171512] py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d7b679]">
                Continuous 3D walkthrough
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl tracking-[-0.03em] md:text-6xl">
                Walk through your future home.
              </h2>
            </div>
            <div className="max-w-sm font-body text-sm leading-relaxed text-white/55">
              A steady low-angle camera flows from the entrance through every
              key space, lingering on the architecture, textures, lighting and
              proportions.
            </div>
          </div>

          <div className="relative h-[68vh] min-h-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl">
            <Canvas
              camera={{ position: rooms[0].position, fov: 42 }}
              shadows
              dpr={[1, 2]}
            >
              <WalkthroughScene
                playing={playing}
                onRoomChange={setActiveRoom}
              />
              <OrbitControls enabled={false} />
            </Canvas>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
            <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md md:left-7 md:top-7">
              Live 3D · Cinematic camera
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 md:inset-x-7 md:bottom-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#d7b679]">
                  Now entering
                </p>
                <h3 className="mt-1 font-display text-3xl md:text-4xl">
                  {rooms[activeRoom].name}
                </h3>
                <p className="mt-1 font-body text-sm text-white/60">
                  {rooms[activeRoom].subtitle}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  aria-label={
                    playing ? "Pause walkthrough" : "Play walkthrough"
                  }
                  onClick={() => setPlaying((value) => !value)}
                  className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10"
                >
                  {playing ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <button
                  aria-label="Toggle sound"
                  onClick={() => setMuted((value) => !value)}
                  className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10"
                >
                  <Volume2 size={17} className={muted ? "opacity-40" : ""} />
                </button>
                <button
                  aria-label="Fullscreen"
                  onClick={() => document.documentElement.requestFullscreen?.()}
                  className="pointer-events-auto hidden h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10 sm:grid"
                >
                  <Maximize2 size={17} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {rooms.map((room, index) => (
              <button
                key={room.name}
                onClick={() => {
                  setActiveRoom(index);
                  setPlaying(false);
                }}
                className={`rounded-xl border px-3 py-3 text-left transition ${index === activeRoom ? "border-[#d7b679]/60 bg-[#d7b679]/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
              >
                <span className="font-mono text-[9px] text-white/35">
                  0{index + 1}
                </span>
                <span className="mt-1 block font-body text-xs text-white/75">
                  {room.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="intelligence" className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d7b679]">
              More than a render
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-[-0.03em] md:text-6xl">
              See the home. Understand the decisions.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                "01",
                "Real spatial understanding",
                "Your rooms, proportions, light and opportunities become the starting point.",
              ],
              [
                "02",
                "Real material intelligence",
                "Design directions connect to specifications, products and choices.",
              ],
              [
                "03",
                "Budget-aware decisions",
                "See what changes cost before a choice becomes a surprise.",
              ],
              [
                "04",
                "Buildability by design",
                "A beautiful visual is only useful when it can actually be built.",
              ],
            ].map(([number, title, copy]) => (
              <article
                key={number}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
              >
                <span className="font-mono text-[10px] text-[#d7b679]">
                  {number}
                </span>
                <h3 className="mt-5 font-display text-xl">{title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/50">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#f0eadf] px-6 py-20 text-[#1c1a17] md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8b6234]">
            The Niwasthan promise
          </p>
          <div className="mt-5 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <h2 className="max-w-4xl font-display text-4xl leading-tight tracking-[-0.03em] md:text-6xl">
              More Options. Better Options. Better Deals. Better Decisions.
              Better Homes.
            </h2>
            <a
              href="/sign-in"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1c1a17] px-6 py-3 font-body text-sm font-semibold text-[#f0eadf]"
            >
              Start with your home <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#12110f] px-6 py-8 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 md:px-12">
        <span>Niwasthan · Home Intelligence</span>
        <span>niwasthan.com</span>
      </footer>
    </main>
  );
}
