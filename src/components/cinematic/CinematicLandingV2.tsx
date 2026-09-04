"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, RoundedBox, Text } from "@react-three/drei";
import { ArrowDown, ArrowRight, Maximize2, Pause, Play } from "lucide-react";
import * as THREE from "three";

const rooms = [
  {
    name: "Entrance",
    subtitle: "A considered arrival",
    position: [0, 1.45, 8] as [number, number, number],
    look: [0, 1.35, 4] as [number, number, number],
  },
  {
    name: "Drawing Room",
    subtitle: "First impressions, beautifully composed",
    position: [-3.2, 1.35, 3.8] as [number, number, number],
    look: [-1.4, 1.15, 2] as [number, number, number],
  },
  {
    name: "Living Room",
    subtitle: "The heart of everyday life",
    position: [-3.1, 1.35, 0] as [number, number, number],
    look: [-1, 1.2, -1.7] as [number, number, number],
  },
  {
    name: "Kitchen",
    subtitle: "Function, flow and material intelligence",
    position: [3.1, 1.4, -1.8] as [number, number, number],
    look: [1.7, 1.15, -3.2] as [number, number, number],
  },
  {
    name: "Master Bedroom",
    subtitle: "Quiet, warm and deeply personal",
    position: [3.1, 1.4, 2.2] as [number, number, number],
    look: [1.2, 1.15, 0.7] as [number, number, number],
  },
  {
    name: "Kids' Room",
    subtitle: "Playful, practical and ready to grow",
    position: [0.5, 1.4, -5.2] as [number, number, number],
    look: [0.4, 1.1, -7] as [number, number, number],
  },
  {
    name: "Balcony",
    subtitle: "The final frame: open sky and home",
    position: [-2.7, 1.5, -9] as [number, number, number],
    look: [-2.7, 1.25, -10.5] as [number, number, number],
  },
];

const segmentTravelSeconds = 6;
const pauseSeconds = 2;
const segmentSeconds = segmentTravelSeconds + pauseSeconds;

function WalkthroughScene({
  playing,
  onRoomChange,
}: {
  playing: boolean;
  onRoomChange: (index: number) => void;
}) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const lastRoom = useRef(-1);
  const floorTiles = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);

  useFrame((_, delta) => {
    if (playing) elapsed.current += delta;
    const cycle = rooms.length * segmentSeconds;
    const time = elapsed.current % cycle;
    const roomIndex = Math.min(
      Math.floor(time / segmentSeconds),
      rooms.length - 1,
    );
    const inSegment = time - roomIndex * segmentSeconds;
    const nextIndex = (roomIndex + 1) % rooms.length;
    const from = rooms[roomIndex];
    const to = rooms[nextIndex];
    const travelProgress = Math.max(
      0,
      Math.min(1, (inSegment - pauseSeconds) / segmentTravelSeconds),
    );
    const eased = travelProgress * travelProgress * (3 - 2 * travelProgress);
    const targetPosition = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...from.position),
      new THREE.Vector3(...to.position),
      eased,
    );
    const targetLook = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...from.look),
      new THREE.Vector3(...to.look),
      eased,
    );

    camera.position.lerp(targetPosition, 1 - Math.pow(0.0005, delta));
    const currentDirection = new THREE.Vector3();
    camera.getWorldDirection(currentDirection);
    const desiredDirection = targetLook.sub(camera.position).normalize();
    currentDirection.lerp(desiredDirection, 1 - Math.pow(0.002, delta));
    camera.lookAt(camera.position.clone().add(currentDirection));

    if (roomIndex !== lastRoom.current) {
      lastRoom.current = roomIndex;
      onRoomChange(roomIndex);
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[-4, 2.8, 2]}
        intensity={28}
        distance={12}
        color="#f4c98e"
      />
      <pointLight
        position={[4, 2.5, -5]}
        intensity={24}
        distance={11}
        color="#c9d8ed"
      />
      <Environment preset="city" environmentIntensity={0.42} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.03, -1]}
        receiveShadow
      >
        <planeGeometry args={[11, 25]} />
        <meshStandardMaterial color="#a69b8a" roughness={0.7} />
      </mesh>

      {floorTiles.map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-4.2 + (i % 6) * 1.65, 0.01, 6 - Math.floor(i / 6) * 4.1]}
        >
          <planeGeometry args={[1.5, 3.8]} />
          <meshStandardMaterial
            color={i % 2 ? "#b1a591" : "#a79b89"}
            roughness={0.75}
          />
        </mesh>
      ))}

      <RoundedBox
        position={[-2.1, 0.55, 2.5]}
        args={[2.8, 0.9, 1.15]}
        radius={0.14}
        smoothness={6}
        castShadow
      >
        <meshStandardMaterial color="#765d48" roughness={0.8} />
      </RoundedBox>
      <RoundedBox
        position={[-2.1, 1.45, 2.95]}
        args={[2.8, 0.15, 0.12]}
        radius={0.04}
        smoothness={3}
      >
        <meshStandardMaterial color="#b8935a" metalness={0.2} roughness={0.4} />
      </RoundedBox>
      <RoundedBox
        position={[2.3, 0.6, -2.3]}
        args={[2.2, 1.15, 0.9]}
        radius={0.08}
        smoothness={5}
        castShadow
      >
        <meshStandardMaterial color="#403a33" roughness={0.45} />
      </RoundedBox>
      <RoundedBox
        position={[2.55, 1.2, 2]}
        args={[1.7, 2.3, 0.65]}
        radius={0.05}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#7b6047" roughness={0.65} />
      </RoundedBox>
      <RoundedBox
        position={[0.4, 0.5, -5.7]}
        args={[2.7, 0.9, 1.2]}
        radius={0.12}
        smoothness={5}
        castShadow
      >
        <meshStandardMaterial color="#69707c" roughness={0.78} />
      </RoundedBox>

      {rooms.map((room) => (
        <Text
          key={room.name}
          position={[room.position[0], 2.6, room.position[2]]}
          fontSize={0.2}
          color="#e7dcc7"
          anchorX="center"
          anchorY="middle"
        >
          {room.name}
        </Text>
      ))}
    </>
  );
}

export function CinematicLandingV2() {
  const [playing, setPlaying] = useState(true);
  const [activeRoom, setActiveRoom] = useState(0);
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-[#12110f]" />
        <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <span className="font-display text-xl md:text-2xl">Niwasthan</span>
          <a
            href="#walkthrough"
            className="rounded-full border border-white/25 bg-black/20 px-4 py-2 font-body text-xs backdrop-blur-md"
          >
            Experience the home
          </a>
        </header>
        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 md:px-12 md:pb-24">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d7b679]">
              4BHK · NIWASTHAN IMMERSIVE
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[0.94] tracking-[-0.04em] sm:text-6xl md:text-8xl">
              Your home.
              <br />
              Designed your way.
            </h1>
            <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-white/75 md:text-lg">
              Ghar mein ghusne se pehle, ghar ko experience karo. Experience a
              cinematic 4BHK journey where design, materials, budget and
              buildability meet.
            </p>
            <a
              href="#walkthrough"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#f4eee2] px-6 py-3 font-body text-sm font-semibold text-[#171512]"
            >
              Start walkthrough <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="absolute bottom-7 left-6 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55 md:left-12">
          <ArrowDown size={13} /> Scroll to enter
        </div>
      </section>

      <section
        id="walkthrough"
        className="border-y border-white/10 bg-[#171512] py-16 md:py-24"
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
            <p className="max-w-sm font-body text-sm leading-relaxed text-white/55">
              Low-angle cinematic camera flow. Each room gets a deliberate
              two-second hold before the transition continues.
            </p>
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
            </Canvas>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent" />
            <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
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
              <div className="flex gap-2">
                <button
                  aria-label={
                    playing ? "Pause walkthrough" : "Play walkthrough"
                  }
                  onClick={() => setPlaying((v) => !v)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10"
                >
                  {playing ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <button
                  aria-label="Fullscreen"
                  onClick={() => document.documentElement.requestFullscreen?.()}
                  className="hidden h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10 sm:grid"
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
                className={`rounded-xl border px-3 py-3 text-left ${index === activeRoom ? "border-[#d7b679]/60 bg-[#d7b679]/10" : "border-white/10 bg-white/[0.02]"}`}
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

      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d7b679]">
            More than a render
          </p>
          <h2 className="mt-4 max-w-4xl font-display text-4xl tracking-[-0.03em] md:text-6xl">
            See the home. Understand the decisions.
          </h2>
          <div className="mt-12 grid gap-3 md:grid-cols-4">
            {[
              [
                "01",
                "Spatial understanding",
                "Your real rooms, proportions, light and opportunities become the starting point.",
              ],
              [
                "02",
                "Material intelligence",
                "Design directions connect to specifications, products and choices.",
              ],
              [
                "03",
                "Budget awareness",
                "See what decisions cost before they become surprises.",
              ],
              [
                "04",
                "Buildability",
                "A beautiful visual is useful only when it can actually be built.",
              ],
            ].map(([n, t, c]) => (
              <article
                key={n}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
              >
                <span className="font-mono text-[10px] text-[#d7b679]">
                  {n}
                </span>
                <h3 className="mt-5 font-display text-xl">{t}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/50">
                  {c}
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
            <h2 className="max-w-4xl font-display text-4xl leading-tight md:text-6xl">
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

      <footer className="flex flex-wrap items-center justify-between gap-4 bg-[#12110f] px-6 py-8 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 md:px-12">
        <span>Niwasthan · Home Intelligence</span>
        <span>niwasthan.com</span>
      </footer>
    </main>
  );
}
