"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";
import { RoomModel } from "./RoomModel";
import { LightingEngine } from "./LightingEngine";

// The real Canvas root. Procedural geometry only (see RoomModel) - no
// external .gltf assets required, so this renders immediately without
// any asset pipeline or download step.
export function HouseScene() {
  const activeScene = useNiwasthanStore((s) => s.activeScene);

  return (
    <Canvas
      camera={{ position: [0, 1.6, 8], fov: 45 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <LightingEngine />
        <RoomModel activeScene={activeScene} />
      </Suspense>
    </Canvas>
  );
}
