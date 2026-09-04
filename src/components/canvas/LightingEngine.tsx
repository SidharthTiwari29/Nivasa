"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { AmbientLight, DirectionalLight, PointLight } from "three";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";

const LIGHT_TARGETS = {
  morning: { sunPosition: [6, 8, 4] as const, sunIntensity: 1.55, coveIntensity: 0.08, ambientIntensity: 0.5, fillIntensity: 0.35 },
  evening: { sunPosition: [8, 1.5, 6] as const, sunIntensity: 0.18, coveIntensity: 1.35, ambientIntensity: 0.16, fillIntensity: 0.12 },
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function LightingEngine() {
  const lightingMode = useNiwasthanStore((s) => s.lightingMode);
  const sunRef = useRef<DirectionalLight>(null);
  const coveRef = useRef<PointLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const fillRef = useRef<PointLight>(null);

  useFrame((_, delta) => {
    const target = LIGHT_TARGETS[lightingMode];
    const speed = Math.min(delta * 2.2, 1);
    if (sunRef.current) {
      const [x, y, z] = target.sunPosition;
      sunRef.current.position.set(x, y, z);
      sunRef.current.intensity = lerp(sunRef.current.intensity, target.sunIntensity, speed);
    }
    if (coveRef.current) coveRef.current.intensity = lerp(coveRef.current.intensity, target.coveIntensity, speed);
    if (fillRef.current) fillRef.current.intensity = lerp(fillRef.current.intensity, target.fillIntensity, speed);
    if (ambientRef.current) ambientRef.current.intensity = lerp(ambientRef.current.intensity, target.ambientIntensity, speed);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={LIGHT_TARGETS.morning.ambientIntensity} />
      <directionalLight ref={sunRef} castShadow position={LIGHT_TARGETS.morning.sunPosition} intensity={LIGHT_TARGETS.morning.sunIntensity} shadow-mapSize={[1536, 1536]} shadow-bias={-0.0002} shadow-normalBias={0.025} />
      <pointLight ref={coveRef} position={[0, 3.65, -2.2]} color="#d49b4b" intensity={0.08} distance={9} decay={2} />
      <pointLight ref={fillRef} position={[-4, 2.4, -2]} color="#9bb4bd" intensity={0.35} distance={8} decay={2} />
      <pointLight position={[3.4, 2.5, 2.8]} color="#f4d9ae" intensity={0.12} distance={5} decay={2} />
    </>
  );
}
