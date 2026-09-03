"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { DirectionalLight, PointLight } from "three";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";

// Real target values for each lighting mode - not arbitrary, matching
// the actual spec: morning is a high sun angle (45°) with bright
// natural light; evening is low ambient sun with warm 2700K cove
// accents taking over as the dominant light source.
const LIGHT_TARGETS = {
  morning: {
    sunPosition: [6, 8, 4] as const,
    sunIntensity: 1.4,
    coveIntensity: 0.15,
    ambientIntensity: 0.55,
  },
  evening: {
    sunPosition: [8, 1.5, 6] as const,
    sunIntensity: 0.25,
    coveIntensity: 1.1,
    ambientIntensity: 0.2,
  },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function LightingEngine() {
  const lightingMode = useNiwasthanStore((s) => s.lightingMode);
  const sunRef = useRef<DirectionalLight>(null);
  const coveRef = useRef<PointLight>(null);

  useFrame((_, delta) => {
    const target = LIGHT_TARGETS[lightingMode];
    const speed = Math.min(delta * 1.5, 1);

    if (sunRef.current) {
      const [x, y, z] = target.sunPosition;
      sunRef.current.position.set(x, y, z);
      sunRef.current.intensity = lerp(
        sunRef.current.intensity,
        target.sunIntensity,
        speed,
      );
    }
    if (coveRef.current) {
      coveRef.current.intensity = lerp(
        coveRef.current.intensity,
        target.coveIntensity,
        speed,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={LIGHT_TARGETS[lightingMode].ambientIntensity} />
      <directionalLight
        ref={sunRef}
        castShadow
        position={LIGHT_TARGETS.morning.sunPosition}
        intensity={LIGHT_TARGETS.morning.sunIntensity}
        shadow-mapSize={[1024, 1024]}
      />
      {/* Warm 2700K cove accent - a point light positioned along the
          ceiling line, only dominant in evening mode. */}
      <pointLight
        ref={coveRef}
        position={[0, 3.4, -2]}
        color="#d49b4b"
        intensity={LIGHT_TARGETS.morning.coveIntensity}
        distance={10}
      />
    </>
  );
}
