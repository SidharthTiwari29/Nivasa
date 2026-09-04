"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { ArrowDown, ArrowRight, Maximize2, Pause, Play } from "lucide-react";
import * as THREE from "three";

const rooms = [
  { name: "Entrance", eyebrow: "01", subtitle: "A considered arrival", position: [0, 1.25, 8] as [number, number, number], look: [0, 1.35, 4] as [number, number, number] },
  { name: "Drawing Room", eyebrow: "02", subtitle: "First impressions, beautifully composed", position: [-3.1, 1.15, 3.8] as [number, number, number], look: [-1.2, 1.1, 2] as [number, number, number] },
  { name: "Living Room", eyebrow: "03", subtitle: "The heart of everyday life", position: [-3.2, 1.15, 0] as [number, number, number], look: [-1, 1.1, -1.7] as [number, number, number] },
  { name: "Kitchen", eyebrow: "04", subtitle: "Function, flow and material intelligence", position: [3, 1.2, -1.8] as [number, number, number], look: [1.5, 1.05, -3.2] as [number, number, number] },
  { name: "Master Bedroom", eyebrow: "05", subtitle: "Quiet, warm and deeply personal", position: [3, 1.2, 2.1] as [number, number, number], look: [1.2, 1.05, 0.6] as [number, number, number] },
  { name: "Kids' Room", eyebrow: "06", subtitle: "Playful, practical and ready to grow", position: [0.4, 1.2, -5.2] as [number, number, number], look: [0.4, 1.05, -7] as [number, number, number] },
  { name: "Balcony", eyebrow: "07", subtitle: "The final frame: open sky and home", position: [-2.7, 1.3, -9] as [number, number, number], look: [-2.7, 1.15, -10.5] as [number, number, number] },
];

const travelSeconds = 6;
const pauseSeconds = 2;
const segmentSeconds = travelSeconds + pauseSeconds;

type Vec3 = [number, number, number];

function ProjectModel() {
  const modelUrl = process.env.NEXT_PUBLIC_NIWASTHAN_MODEL_URL;
  if (!modelUrl) return null;
  return <ProjectModelAsset url={modelUrl} />;
}

function ProjectModelAsset({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={[0, 0, 0]} dispose={null} />;
}

function FallbackArchitecture() {
  const tiles = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -1]} receiveShadow>
        <planeGeometry args={[11, 25]} />
        <meshStandardMaterial color="#a79b8b" roughness={0.72} />
      </mesh>
      {tiles.map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4.25 + (i % 6) * 1.7, 0.01, 6 - Math.floor(i / 6) * 3.9]} receiveShadow>
          <planeGeometry args={[1.55, 3.6]} />
          <meshStandardMaterial color={i % 2 ? "#b5aa99" : "#9e9382"} roughness={0.78} />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => 8 - i * 3.1).map((z) => (
        <group key={z}>
          <mesh position={[-5.15, 1.9, z]} castShadow>
            <boxGeometry args={[0.18, 3.8, 2.9]} />
            <meshStandardMaterial color="#e8e0d4" roughness={0.84} />
          </mesh>
          <mesh position={[5.15, 1.9, z]} castShadow>
            <boxGeometry args={[0.18, 3.8, 2.9]} />
            <meshStandardMaterial color="#e8e0d4" roughness={0.84} />
          </mesh>
        </group>
      ))}
      <mesh position={[-2.1, 0.55, 2.4]} castShadow>
        <boxGeometry args={[2.9, 0.9, 1.2]} />
        <meshStandardMaterial color="#735a46" roughness={0.8} />
      </mesh>
      <mesh position={[2.3, 0.62, -2.35]} castShadow>
        <boxGeometry args={[2.2, 1.15, 0.95]} />
        <meshStandardMaterial color="#3f3932" roughness={0.46} />
      </mesh>
      <mesh position={[2.55, 1.2, 2]} castShadow>
        <boxGeometry args={[1.7, 2.3, 0.65]} />
        <meshStandardMaterial color="#7b6048" roughness={0.64} />
      </mesh>
      <mesh position={[0.4, 0.5, -5.7]} castShadow>
        <boxGeometry args={[2.7, 0.9, 1.2]} />
        <meshStandardMaterial color="#626a77" roughness={0.76} />
      </mesh>
    </group>
  );
}

function WalkthroughScene({ playing, selectedRoom, onRoomChange }: { playing: boolean; selectedRoom: number; onRoomChange: (index: number) => void }) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const lastRoom = useRef(-1);

  useEffect(() => {
    elapsed.current = selectedRoom * segmentSeconds;
    lastRoom.current = -1;
  }, [selectedRoom]);

  useFrame((_, delta) => {
    if (playing) elapsed.current += delta;
    const cycle = rooms.length * segmentSeconds;
    const time = elapsed.current % cycle;
    const roomIndex = Math.min(Math.floor(time / segmentSeconds), rooms.length - 1);
    const inSegment = time - roomIndex * segmentSeconds;
    const nextIndex = (roomIndex + 1) % rooms.length;
    const from = rooms[roomIndex];
    const to = rooms[nextIndex];
    const progress = THREE.MathUtils.clamp((inSegment - pauseSeconds) / travelSeconds, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const targetPosition = new THREE.Vector3().lerpVectors(new THREE.Vector3(...from.position), new THREE.Vector3(...to.position), eased);
    const targetLook = new THREE.Vector3().lerpVectors(new THREE.Vector3(...from.look), new THREE.Vector3(...to.look), eased);

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

  const hasProjectModel = Boolean(process.env.NEXT_PUBLIC_NIWASTHAN_MODEL_URL);
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 9, 5]} intensity={2.25} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-4, 2.6, 2]} intensity={26} distance={12} color="#f4c98e" />
      <pointLight position={[4, 2.4, -5]} intensity={20} distance={11} color="#c9d8ed" />
      <Environment preset="city" environmentIntensity={0.38} />
      {hasProjectModel ? <ProjectModel /> : <FallbackArchitecture />}
    </>
  );
}

function CinematicHero({ imageUrl }: { imageUrl: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#12110f]">
      <div className={`absolute inset-0 transition-transform duration-[4000ms] ease-out ${loaded ? "scale-100" : "scale-[1.035]"}`}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} onLoad={() => setLoaded(true)} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(0,0,0,.12)_38%,rgba(0,0,0,.72)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-[#12110f]" />
      <header className="relative z-10 flex items-center justify-between px-5 py-6 md:px-12 md:py-8">
        <span className="font-display text-xl tracking-tight md:text-2xl">Niwasthan</span>
        <a href="#walkthrough" className="rounded-full border border-white/20 bg-black/20 px-4 py-2 font-body text-xs text-white/85 backdrop-blur-md">Enter the home</a>
      </header>
      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-7xl items-end px-5 pb-14 md:px-12 md:pb-24">
        <div className="max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#d7b679]">4BHK · NIWASTHAN RESIDENCE</p>
          <h1 className="mt-5 font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[.88] tracking-[-.055em]">Your home.<br />Designed your way.</h1>
          <p className="mt-7 max-w-xl font-body text-sm leading-relaxed text-white/70 md:text-base">Ghar mein ghusne se pehle, ghar ko experience karo.</p>
          <a href="#walkthrough" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f4eee2] px-6 py-3 font-body text-sm font-semibold text-[#171512]">Start the journey <ArrowRight size={16} /></a>
        </div>
      </div>
      <div className="absolute bottom-7 left-5 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/50 md:left-12"><ArrowDown size={13} /> Scroll to enter</div>
    </section>
  );
}

export function CinematicLandingFinal() {
  const [playing, setPlaying] = useState(true);
  const [activeRoom, setActiveRoom] = useState(0);
  const heroImage = process.env.NEXT_PUBLIC_NIWASTHAN_HERO_IMAGE || "/niwasthan-project-hero.jpg";

  return (
    <main className="min-h-screen bg-[#12110f] text-[#f4eee2] selection:bg-[#d7b679] selection:text-[#171512]">
      <CinematicHero imageUrl={heroImage} />

      <section id="walkthrough" className="border-y border-white/10 bg-[#171512] py-14 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-12">
          <div className="mb-7 flex flex-col gap-5 md:mb-9 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d7b679]">Continuous 3D walkthrough</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl md:text-7xl">Walk through the home.<br className="hidden sm:block" /> Feel the spaces.</h2>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-white/50">Low camera. Long easing. Material close-ups. A deliberate two-second pause in every room.</p>
          </div>

          <div className="relative h-[58svh] min-h-[430px] overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl sm:h-[66vh] sm:min-h-[520px] md:rounded-[30px]">
            <Canvas camera={{ position: rooms[0].position, fov: 42 }} shadows dpr={[1, 2]}>
              <WalkthroughScene playing={playing} selectedRoom={activeRoom} onRoomChange={setActiveRoom} />
            </Canvas>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />
            <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-2 font-mono text-[9px] uppercase tracking-[.18em] text-white/65 backdrop-blur-md sm:left-5 sm:top-5 sm:px-4">Real-time 3D · Cinematic camera</div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[.22em] text-[#d7b679]">Now entering · {rooms[activeRoom].eyebrow}</p>
                <h3 className="mt-1 truncate font-display text-3xl tracking-[-.03em] sm:text-4xl">{rooms[activeRoom].name}</h3>
                <p className="mt-1 hidden font-body text-sm text-white/55 sm:block">{rooms[activeRoom].subtitle}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button aria-label={playing ? "Pause walkthrough" : "Play walkthrough"} onClick={() => setPlaying((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10 sm:h-11 sm:w-11">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
                <button aria-label="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()} className="hidden h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10 sm:grid"><Maximize2 size={16} /></button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {rooms.map((room, index) => (
              <button key={room.name} onClick={() => { setActiveRoom(index); setPlaying(false); }} className={`rounded-xl border px-3 py-3 text-left transition ${index === activeRoom ? "border-[#d7b679]/60 bg-[#d7b679]/10" : "border-white/10 bg-white/[.02] hover:bg-white/[.05]"}`}>
                <span className="font-mono text-[9px] text-white/35">{room.eyebrow}</span>
                <span className="mt-1 block font-body text-xs text-white/75">{room.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#d7b679]">More than a render</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[.95] tracking-[-.04em] sm:text-5xl md:text-7xl">See the home.<br />Understand the decisions.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["01", "Spatial understanding", "Rooms, proportions, movement, light and opportunities become tangible."],
              ["02", "Material intelligence", "Finishes and specifications can connect to the spaces where they belong."],
              ["03", "Budget awareness", "The experience is designed to lead into choices, quantities and cost thinking."],
              ["04", "Buildability", "The final direction should remain grounded in what can actually be built."],
            ].map(([number, title, text]) => (
              <article key={number} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:p-6">
                <span className="font-mono text-[9px] text-[#d7b679]">{number}</span>
                <h3 className="mt-5 font-display text-xl tracking-[-.02em]">{title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 font-mono text-[9px] uppercase tracking-[.2em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>Niwasthan · Home intelligence</span>
          <span>Project-led · Not a generic demo</span>
        </div>
      </footer>
    </main>
  );
}
