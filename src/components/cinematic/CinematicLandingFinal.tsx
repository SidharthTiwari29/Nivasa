"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ArrowDown, ArrowRight, Maximize2 } from "lucide-react";
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

function ProjectModel() {
  const url = process.env.NEXT_PUBLIC_NIWASTHAN_MODEL_URL;
  if (!url) return <FallbackArchitecture />;
  return <ProjectModelAsset url={url} />;
}

function ProjectModelAsset({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} dispose={null} />;
}

function FallbackArchitecture() {
  const tiles = useMemo(() => Array.from({ length: 42 }, (_, i) => i), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -1]} receiveShadow>
        <planeGeometry args={[11, 28]} />
        <meshStandardMaterial color="#9d9282" roughness={0.72} />
      </mesh>
      {tiles.map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4.25 + (i % 6) * 1.7, 0.01, 9 - Math.floor(i / 6) * 3]} receiveShadow>
          <planeGeometry args={[1.55, 2.75]} />
          <meshStandardMaterial color={i % 2 ? "#b8ad9c" : "#8f8474"} roughness={0.78} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => 10 - i * 3.1).map((z) => (
        <group key={z}>
          <mesh position={[-5.15, 1.9, z]} castShadow><boxGeometry args={[0.18, 3.8, 2.9]} /><meshStandardMaterial color="#e8e0d4" roughness={0.84} /></mesh>
          <mesh position={[5.15, 1.9, z]} castShadow><boxGeometry args={[0.18, 3.8, 2.9]} /><meshStandardMaterial color="#e8e0d4" roughness={0.84} /></mesh>
        </group>
      ))}
      <mesh position={[-2.1, 0.55, 2.4]} castShadow><boxGeometry args={[2.9, 0.9, 1.2]} /><meshStandardMaterial color="#735a46" roughness={0.8} /></mesh>
      <mesh position={[2.3, 0.62, -2.35]} castShadow><boxGeometry args={[2.2, 1.15, 0.95]} /><meshStandardMaterial color="#3f3932" roughness={0.46} /></mesh>
      <mesh position={[2.55, 1.2, 2]} castShadow><boxGeometry args={[1.7, 2.3, 0.65]} /><meshStandardMaterial color="#7b6048" roughness={0.64} /></mesh>
      <mesh position={[0.4, 0.5, -5.7]} castShadow><boxGeometry args={[2.7, 0.9, 1.2]} /><meshStandardMaterial color="#626a77" roughness={0.76} /></mesh>
    </group>
  );
}

function WalkthroughCamera({ progress, onRoomChange }: { progress: number; onRoomChange: (index: number) => void }) {
  const { camera } = useThree();
  const lastRoom = useRef(-1);
  const position = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const current = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const scaled = THREE.MathUtils.clamp(progress, 0, 0.999999) * (rooms.length - 1);
    const index = Math.floor(scaled);
    const local = scaled - index;
    const eased = local * local * (3 - 2 * local);
    const from = rooms[index];
    const to = rooms[Math.min(index + 1, rooms.length - 1)];
    position.lerpVectors(new THREE.Vector3(...from.position), new THREE.Vector3(...to.position), eased);
    look.lerpVectors(new THREE.Vector3(...from.look), new THREE.Vector3(...to.look), eased);
    camera.position.lerp(position, 1 - Math.pow(0.0001, delta));
    camera.getWorldDirection(current);
    target.copy(look).sub(camera.position).normalize();
    current.lerp(target, 1 - Math.pow(0.0005, delta));
    camera.lookAt(camera.position.clone().add(current));
    if (index !== lastRoom.current) {
      lastRoom.current = index;
      onRoomChange(index);
    }
  });
  return null;
}

function WalkthroughScene({ progress, onRoomChange }: { progress: number; onRoomChange: (index: number) => void }) {
  const hasModel = Boolean(process.env.NEXT_PUBLIC_NIWASTHAN_MODEL_URL);
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 9, 5]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 2.6, 2]} intensity={18} distance={13} color="#f4c98e" />
      <pointLight position={[4, 2.4, -5]} intensity={14} distance={12} color="#c9d8ed" />
      <Suspense fallback={<FallbackArchitecture />}>
        {hasModel ? <ProjectModel /> : <FallbackArchitecture />}
      </Suspense>
      <WalkthroughCamera progress={progress} onRoomChange={onRoomChange} />
    </>
  );
}

function CinematicHero({ imageUrl }: { imageUrl: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#12110f]">
      {!imageFailed ? (
        <img src={imageUrl} alt="Niwasthan 4BHK residence" className="absolute inset-0 h-full w-full object-cover object-center scale-[1.025]" onError={() => setImageFailed(true)} />
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_55%_35%,#756a5c_0%,#39342e_34%,#12110f_78%)]">
          <div className="absolute left-[7%] top-[15%] h-[68%] w-[86%] border border-white/15 bg-white/[.025] [transform:perspective(900px)_rotateX(4deg)_rotateY(-7deg)]" />
          <div className="absolute left-[15%] top-[24%] h-[52%] w-[28%] border border-white/10 bg-black/20" />
          <div className="absolute left-[47%] top-[20%] h-[56%] w-[38%] border border-white/10 bg-black/25" />
          <div className="absolute bottom-[16%] left-[12%] h-px w-[76%] bg-white/15" />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(0,0,0,.1)_38%,rgba(0,0,0,.72)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-[#12110f]" />
      <header className="relative z-10 flex items-center justify-between px-5 py-6 md:px-12 md:py-8">
        <span className="font-display text-xl tracking-tight md:text-2xl">Niwasthan</span>
        <span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 font-mono text-[9px] uppercase tracking-[.18em] text-white/70 backdrop-blur-md">4BHK Residence</span>
      </header>
      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-7xl items-end px-5 pb-14 md:px-12 md:pb-24">
        <div className="max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[.32em] text-[#d7b679]">Niwasthan Residence</p>
          <h1 className="mt-5 font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[.88] tracking-[-.055em]">Your home.<br />Designed your way.</h1>
          <a href="#walkthrough" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f4eee2] px-6 py-3 font-body text-sm font-semibold text-[#171512]">Enter the home <ArrowRight size={16} /></a>
        </div>
      </div>
      <div className="absolute bottom-7 left-5 z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.22em] text-white/50 md:left-12"><ArrowDown size={13} /> Scroll to enter</div>
    </section>
  );
}

export function CinematicLandingFinal() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeRoom, setActiveRoom] = useState(0);
  const walkthroughRef = useRef<HTMLElement>(null);
  const heroImage = process.env.NEXT_PUBLIC_NIWASTHAN_HERO_IMAGE || "/niwasthan-project-hero.jpg";

  useEffect(() => {
    const update = () => {
      const element = walkthroughRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const travel = Math.max(element.offsetHeight - window.innerHeight, 1);
      setScrollProgress(THREE.MathUtils.clamp(-rect.top / travel, 0, 1));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const jumpToRoom = (index: number) => {
    const element = walkthroughRef.current;
    if (!element) return;
    const travel = Math.max(element.offsetHeight - window.innerHeight, 1);
    window.scrollTo({ top: element.offsetTop + travel * (index / (rooms.length - 1)), behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#12110f] text-[#f4eee2] selection:bg-[#d7b679] selection:text-[#171512]">
      <CinematicHero imageUrl={heroImage} />
      <section ref={walkthroughRef} id="walkthrough" className="relative h-[700vh] border-y border-white/10 bg-[#171512]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-x-0 top-0 z-20 px-5 pt-10 md:px-12 md:pt-12">
            <div className="mx-auto flex max-w-7xl items-end justify-between gap-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#d7b679]">Continuous 3D walkthrough</p>
                <h2 className="mt-3 max-w-4xl font-display text-4xl leading-none tracking-[-.04em] sm:text-5xl md:text-7xl">Walk through the home.</h2>
              </div>
              <p className="hidden max-w-sm pb-1 text-right font-body text-sm leading-relaxed text-white/50 md:block">Scroll to move the camera through every room. Slow transitions and deliberate holds.</p>
            </div>
          </div>
          <div className="absolute inset-0">
            <Canvas camera={{ position: rooms[0].position, fov: 42 }} dpr={[1, 1.5]} shadows>
              <WalkthroughScene progress={scrollProgress} onRoomChange={setActiveRoom} />
            </Canvas>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_20%,rgba(0,0,0,.25)_65%,rgba(0,0,0,.7)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#12110f] to-transparent" />
          <div className="absolute inset-x-5 bottom-6 z-20 md:inset-x-12 md:bottom-10">
            <div className="mx-auto flex max-w-7xl items-end justify-between gap-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.22em] text-[#d7b679]">{rooms[activeRoom].eyebrow} · Now entering</p>
                <h3 className="mt-1 font-display text-4xl tracking-[-.03em] sm:text-5xl md:text-6xl">{rooms[activeRoom].name}</h3>
                <p className="mt-2 hidden font-body text-sm text-white/55 sm:block">{rooms[activeRoom].subtitle}</p>
              </div>
              <button aria-label="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-black/45 backdrop-blur-md hover:bg-white/10"><Maximize2 size={16} /></button>
            </div>
            <div className="mx-auto mt-5 grid max-w-7xl grid-cols-7 gap-1.5">
              {rooms.map((room, index) => <button key={room.name} onClick={() => jumpToRoom(index)} aria-label={`Go to ${room.name}`} className={`h-1.5 rounded-full transition-all ${index <= activeRoom ? "bg-[#d7b679]" : "bg-white/15"}`} />)}
            </div>
          </div>
        </div>
      </section>
      <section className="px-5 py-20 sm:py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div><p className="font-mono text-[10px] uppercase tracking-[.28em] text-[#d7b679]">More than a render</p><h2 className="mt-4 max-w-3xl font-display text-4xl leading-[.95] tracking-[-.04em] sm:text-5xl md:text-7xl">See the home.<br />Understand the decisions.</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[['01','Spatial understanding','Rooms, proportions, movement, light and opportunities become tangible.'],['02','Material intelligence','Finishes and specifications can connect to the spaces where they belong.'],['03','Budget awareness','The experience is designed to lead into choices, quantities and cost thinking.'],['04','Buildability','The final direction should remain grounded in what can actually be built.']].map(([number,title,text]) => <article key={number} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:p-6"><span className="font-mono text-[9px] text-[#d7b679]">{number}</span><h3 className="mt-5 font-display text-xl tracking-[-.02em]">{title}</h3><p className="mt-2 font-body text-sm leading-relaxed text-white/50">{text}</p></article>)}
          </div>
        </div>
      </section>
      <footer className="border-t border-white/10 px-5 py-8 md:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-3 font-mono text-[9px] uppercase tracking-[.2em] text-white/35 sm:flex-row sm:items-center sm:justify-between"><span>Niwasthan · Home intelligence</span><span>Project-led · Not a generic demo</span></div></footer>
    </main>
  );
}
