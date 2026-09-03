"use client";

import { Html } from "@react-three/drei";
import type { SceneId, SpatialHotspot } from "@/types/interior";

const HOTSPOTS: SpatialHotspot[] = [
  {
    id: "living",
    label: "Living Room — 328 sq ft",
    areaSqFt: 328,
    position: [-2.5, 1.8, 0],
  },
  {
    id: "kitchen",
    label: "Kitchen — 82 sq ft",
    areaSqFt: 82,
    position: [2.6, 1.8, -1.5],
  },
  {
    id: "bedroom",
    label: "Master Bedroom — 164 sq ft",
    areaSqFt: 164,
    position: [2.6, 1.8, 2.5],
  },
  {
    id: "balcony",
    label: "Balcony — 48 sq ft",
    areaSqFt: 48,
    position: [-2.5, 1.8, -3],
  },
];

function HotspotBadge({ hotspot }: { hotspot: SpatialHotspot }) {
  return (
    <Html position={hotspot.position} center distanceFactor={10}>
      <div className="pointer-events-none rounded-full border border-stone-200/60 bg-white/75 px-3 py-1 font-body text-xs font-medium text-ink shadow-lg backdrop-blur-md">
        {hotspot.label}
      </div>
    </Html>
  );
}

export function RoomModel({ activeScene }: { activeScene: SceneId }) {
  const showHotspots = activeScene !== "entrance";

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#e8e3da" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.5, -5]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#fbf9f5" />
      </mesh>

      {/* Side wall */}
      <mesh
        position={[-6, 2.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color="#fbf9f5" />
      </mesh>

      {/* Entrance door - a slightly darker, warm-toned panel */}
      <mesh position={[0, 1.4, 4.9]} castShadow>
        <boxGeometry args={[1.4, 2.8, 0.15]} />
        <meshStandardMaterial color="#7d3216" roughness={0.6} />
      </mesh>

      {/* Sofa - a rounded, stylized box standing in for real furniture */}
      <mesh position={[-2.5, 0.5, 0]} castShadow>
        <boxGeometry args={[2.4, 1, 1]} />
        <meshStandardMaterial color="#b88e5e" roughness={0.8} />
      </mesh>

      {/* Kitchen island */}
      <mesh position={[2.6, 0.6, -1.5]} castShadow>
        <boxGeometry args={[1.6, 1.2, 0.8]} />
        <meshStandardMaterial color="#24211d" roughness={0.4} />
      </mesh>

      {/* Wardrobe */}
      <mesh position={[2.6, 1, 2.5]} castShadow>
        <boxGeometry args={[1.4, 2, 0.6]} />
        <meshStandardMaterial color="#b88e5e" roughness={0.7} />
      </mesh>

      {showHotspots &&
        HOTSPOTS.map((hotspot) => (
          <HotspotBadge key={hotspot.id} hotspot={hotspot} />
        ))}
    </group>
  );
}
