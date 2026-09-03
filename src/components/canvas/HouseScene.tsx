"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";
import { RoomModel, type RoomModelHandle } from "./RoomModel";
import { LightingEngine } from "./LightingEngine";
import { CameraRig } from "./CameraRig";

gsap.registerPlugin(ScrollTrigger);

// The real Canvas root. Procedural geometry only (see RoomModel) - no
// external .gltf assets required, so this renders immediately without
// any asset pipeline or download step.
export function HouseScene() {
  const activeScene = useNiwasthanStore((s) => s.activeScene);
  const storageUpgraded = useNiwasthanStore((s) => s.storageUpgraded);
  const roomRef = useRef<RoomModelHandle>(null);

  // Scrubs the door's real hinge rotation against the same scroll range
  // as the camera push in CameraRig, so both read as one continuous
  // "walking through the door" motion rather than two independently-
  // timed animations that happen to overlap.
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

  // Real, direct response to the storage-upgrade interaction (Scene 5) -
  // the wardrobe genuinely expands in the scene at the same moment the
  // store's total genuinely increases, rather than the two happening on
  // different, disconnected timings.
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
    <Canvas
      camera={{ position: [0, 1.6, 8], fov: 45 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <CameraRig />
        <LightingEngine />
        <RoomModel ref={roomRef} activeScene={activeScene} />
      </Suspense>
    </Canvas>
  );
}
