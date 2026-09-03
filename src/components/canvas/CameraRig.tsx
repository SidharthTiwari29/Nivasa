"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scrubs the real camera position against real scroll progress between
// the entrance and spatial-understanding sections - not a fixed-
// duration autoplay animation, so the camera's forward push always
// matches exactly where the person actually is in the scroll, in
// either direction.
export function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    const entranceEl = document.getElementById("scene-entrance");
    const spatialEl = document.getElementById("scene-spatial");
    if (!entranceEl || !spatialEl) return;

    const tween = gsap.fromTo(
      camera.position,
      { z: 8 },
      {
        z: 2.5,
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
  }, [camera]);

  return null;
}
