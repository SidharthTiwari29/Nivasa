"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { ACESFilmicToneMapping, FogExp2, SRGBColorSpace } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";
import { RoomModel, type RoomModelHandle } from "./RoomModel";
import { LightingEngine } from "./LightingEngine";
import { CameraRig } from "./CameraRig";

gsap.registerPlugin(ScrollTrigger);

export function HouseScene() {
  const activeScene = useNiwasthanStore((s) => s.activeScene);
  const storageUpgraded = useNiwasthanStore((s) => s.storageUpgraded);
  const roomRef = useRef<RoomModelHandle>(null);

  useEffect(() => {
    const entranceEl = document.getElementById("scene-entrance");
    const spatialEl = document.getElementById("scene-spatial");
    if (!entranceEl || !spatialEl || !roomRef.current?.doorGroup) return;

    const tween = gsap.fromTo(
      roomRef.current.doorGroup.rotation,
      { y: 0 },
      {
        y: -2.1,
        ease: "none",
        scrollTrigger: {
          trigger: entranceEl,
          start: "top top",
          endTrigger: spatialEl,
          end: "top center",
          scrub: true,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  useEffect(() => {
    if (!roomRef.current?.wardrobeMesh) return;
    gsap.to(roomRef.current.wardrobeMesh.scale, {
      x: storageUpgraded ? 1.35 : 1,
      z: storageUpgraded ? 1.35 : 1,
      duration: 0.8,
      ease: "power2.out",
    });
  }, [storageUpgraded]);

  return (
    <div className="cinematic-stage">
      <Canvas
        shadows
        camera={{ position: [0, 1.65, 8], fov: 43, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: SRGBColorSpace,
        }}
        dpr={[1, 1.75]}
        onCreated={({ scene }) => {
          scene.fog = new FogExp2("#b8aea0", 0.018);
        }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <LightingEngine />
          <RoomModel ref={roomRef} activeScene={activeScene} />
        </Suspense>
      </Canvas>
    </div>
  );
}
