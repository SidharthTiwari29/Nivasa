"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Html } from "@react-three/drei";
import type { Group, Mesh } from "three";
import type { SceneId, SpatialHotspot } from "@/types/interior";

const HOTSPOTS: SpatialHotspot[] = [
  {
    id: "living",
    label: "Living Room · 328 sq ft",
    areaSqFt: 328,
    position: [-2.5, 1.9, 0.2],
  },
  {
    id: "kitchen",
    label: "Kitchen · 82 sq ft",
    areaSqFt: 82,
    position: [2.6, 1.9, -1.7],
  },
  {
    id: "bedroom",
    label: "Master Bedroom · 164 sq ft",
    areaSqFt: 164,
    position: [2.6, 1.9, 2.7],
  },
  {
    id: "balcony",
    label: "Balcony · 48 sq ft",
    areaSqFt: 48,
    position: [-2.7, 1.9, -3.7],
  },
];

function HotspotBadge({ hotspot }: { hotspot: SpatialHotspot }) {
  return (
    <Html position={hotspot.position} center distanceFactor={9}>
      <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/30 bg-[#171512]/70 px-3 py-1.5 font-body text-[10px] font-medium tracking-wide text-white shadow-2xl backdrop-blur-xl">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#d5a86b] align-middle" />
        {hotspot.label}
      </div>
    </Html>
  );
}

export type RoomModelHandle = {
  doorGroup: Group | null;
  wardrobeMesh: Mesh | null;
};

function Material({
  color,
  roughness = 0.55,
  metalness = 0,
}: {
  color: string;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
    />
  );
}

export const RoomModel = forwardRef<RoomModelHandle, { activeScene: SceneId }>(
  function RoomModel({ activeScene }, ref) {
    const doorGroupRef = useRef<Group>(null);
    const wardrobeRef = useRef<Mesh>(null);
    const showHotspots = activeScene !== "entrance";

    useImperativeHandle(ref, () => ({
      get doorGroup() {
        return doorGroupRef.current;
      },
      get wardrobeMesh() {
        return wardrobeRef.current;
      },
    }));

    return (
      <group>
        {/* Warm limestone architectural shell */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          position={[0, 0, 0]}
        >
          <planeGeometry args={[12, 10]} />
          <Material color="#d9d0c1" roughness={0.88} />
        </mesh>
        <mesh position={[0, 2.5, -5]} receiveShadow>
          <boxGeometry args={[12, 5, 0.2]} />
          <Material color="#f5f1e9" roughness={0.95} />
        </mesh>
        <mesh
          position={[-6, 2.5, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[10, 5, 0.2]} />
          <Material color="#eee9df" roughness={0.95} />
        </mesh>
        <mesh position={[0, 5, 0]} receiveShadow>
          <boxGeometry args={[12, 0.12, 10]} />
          <Material color="#e7dfd2" roughness={0.95} />
        </mesh>

        {/* Full-height balcony glazing */}
        <mesh position={[-2.7, 2.1, -4.88]}>
          <planeGeometry args={[3.6, 3.3]} />
          <meshStandardMaterial
            color="#6f8b96"
            roughness={0.08}
            metalness={0.1}
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh position={[-2.7, 2.1, -4.96]}>
          <boxGeometry args={[0.06, 3.3, 0.08]} />
          <Material color="#24211d" roughness={0.25} metalness={0.7} />
        </mesh>
        <mesh position={[-2.7, 2.1, -4.96]}>
          <boxGeometry args={[3.6, 0.06, 0.08]} />
          <Material color="#24211d" roughness={0.25} metalness={0.7} />
        </mesh>
        <mesh position={[-0.9, 2.1, -4.96]}>
          <boxGeometry args={[0.04, 3.3, 0.08]} />
          <Material color="#24211d" roughness={0.25} metalness={0.7} />
        </mesh>
        <mesh position={[-4.5, 2.1, -4.96]}>
          <boxGeometry args={[0.04, 3.3, 0.08]} />
          <Material color="#24211d" roughness={0.25} metalness={0.7} />
        </mesh>

        {/* Entrance door with physical hinge */}
        <group ref={doorGroupRef} position={[-0.7, 1.4, 4.9]}>
          <mesh position={[0.7, 0, 0]} castShadow>
            <boxGeometry args={[1.4, 2.8, 0.15]} />
            <Material color="#684126" roughness={0.42} />
          </mesh>
          <mesh position={[0.7, 0.35, 0.085]}>
            <boxGeometry args={[0.85, 0.035, 0.02]} />
            <Material color="#c19a60" roughness={0.22} metalness={0.75} />
          </mesh>
          <mesh position={[0.7, -0.4, 0.085]}>
            <boxGeometry args={[0.85, 0.035, 0.02]} />
            <Material color="#c19a60" roughness={0.22} metalness={0.75} />
          </mesh>
          <mesh position={[1.12, 0, 0.1]} castShadow>
            <sphereGeometry args={[0.07, 16, 16]} />
            <Material color="#c19a60" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* Living room vignette */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-2.35, 0.025, 0.4]}
          receiveShadow
        >
          <planeGeometry args={[4.2, 3.0]} />
          <Material color="#a99780" roughness={1} />
        </mesh>
        <mesh position={[-2.5, 0.58, 0.25]} castShadow>
          <boxGeometry args={[2.7, 1.05, 1.05]} />
          <Material color="#8b735d" roughness={0.78} />
        </mesh>
        {[-3.25, -2.5, -1.75].map((x) => (
          <mesh key={x} position={[x, 1.0, -0.02]} castShadow>
            <boxGeometry args={[0.55, 0.42, 0.88]} />
            <Material color="#b7a38b" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[-2.45, 0.35, 1.65]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 0.12, 48]} />
          <Material color="#6f4e32" roughness={0.35} />
        </mesh>
        <mesh position={[-2.45, 0.2, 1.65]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
          <Material color="#a98550" roughness={0.25} metalness={0.7} />
        </mesh>

        {/* Kitchen island */}
        <mesh position={[2.6, 0.6, -1.6]} castShadow>
          <boxGeometry args={[2.2, 1.2, 0.95]} />
          <Material color="#242320" roughness={0.32} />
        </mesh>
        <mesh position={[2.6, 1.24, -1.6]} castShadow>
          <boxGeometry args={[2.35, 0.08, 1.05]} />
          <Material color="#c9bba5" roughness={0.2} />
        </mesh>
        {[2.05, 2.6, 3.15].map((x) => (
          <mesh key={x} position={[x, 1.32, -1.6]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.03, 24]} />
            <Material color="#9e7c4a" roughness={0.18} metalness={0.8} />
          </mesh>
        ))}

        {/* Master bedroom */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[2.55, 0.03, 2.65]}
          receiveShadow
        >
          <planeGeometry args={[3.4, 2.8]} />
          <Material color="#c2b29e" roughness={1} />
        </mesh>
        <mesh position={[2.6, 0.7, 2.65]} castShadow>
          <boxGeometry args={[2.5, 0.55, 2.05]} />
          <Material color="#f1ece3" roughness={0.95} />
        </mesh>
        <mesh position={[2.6, 1.04, 2.65]} castShadow>
          <boxGeometry args={[2.55, 0.08, 2.1]} />
          <Material color="#d2c1ac" roughness={0.72} />
        </mesh>
        <mesh ref={wardrobeRef} position={[4.15, 1.2, 3.55]} castShadow>
          <boxGeometry args={[1.05, 2.4, 0.65]} />
          <Material color="#806344" roughness={0.5} />
        </mesh>
        <mesh position={[4.15, 1.2, 3.21]}>
          <boxGeometry args={[0.05, 2.15, 0.04]} />
          <Material color="#c29a5d" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Sculptural planting */}
        <mesh position={[-4.6, 0.45, -3.6]} castShadow>
          <cylinderGeometry args={[0.38, 0.48, 0.75, 24]} />
          <Material color="#8a6444" roughness={0.8} />
        </mesh>
        <mesh position={[-4.6, 1.35, -3.6]}>
          <sphereGeometry args={[0.7, 20, 12]} />
          <Material color="#52604a" roughness={0.95} />
        </mesh>
        <mesh position={[4.7, 0.4, 0.9]} castShadow>
          <cylinderGeometry args={[0.32, 0.4, 0.65, 24]} />
          <Material color="#a2744d" roughness={0.85} />
        </mesh>
        <mesh position={[4.7, 1.05, 0.9]}>
          <sphereGeometry args={[0.58, 20, 12]} />
          <Material color="#59674e" roughness={0.95} />
        </mesh>

        {showHotspots &&
          HOTSPOTS.map((hotspot) => (
            <HotspotBadge key={hotspot.id} hotspot={hotspot} />
          ))}
      </group>
    );
  },
);
