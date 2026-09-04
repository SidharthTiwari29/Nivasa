"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WAYPOINTS = [
  { at: 0, position: [0, 1.65, 8], rotation: [0.02, 0, 0] },
  { at: 0.16, position: [-1.1, 1.58, 5.6], rotation: [0.01, -0.18, 0] },
  { at: 0.31, position: [-2.0, 1.48, 3.4], rotation: [0.015, -0.42, 0] },
  { at: 0.46, position: [1.9, 1.5, 1.55], rotation: [0.01, 0.48, 0] },
  { at: 0.62, position: [3.25, 1.52, 3.65], rotation: [0.015, 0.7, 0] },
  { at: 0.77, position: [0.3, 1.7, -1.7], rotation: [-0.01, 0.08, 0] },
  { at: 0.9, position: [-2.15, 1.62, -3.55], rotation: [0, -0.3, 0] },
  { at: 1, position: [0, 1.72, -0.8], rotation: [0, 0, 0] },
] as const;

export function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    const entranceEl = document.getElementById("scene-entrance");
    const endEl = document.getElementById("scene-humsafar");
    if (!entranceEl || !endEl) return;

    const timeline = gsap.timeline({ paused: true });
    WAYPOINTS.slice(1).forEach((point, index) => {
      const previous = WAYPOINTS[index];
      const duration = Math.max(point.at - previous.at, 0.08);
      timeline.to(camera.position, {
        x: point.position[0],
        y: point.position[1],
        z: point.position[2],
        duration,
        ease: "sine.inOut",
      }, index === 0 ? 0 : "+=0");
      timeline.to(camera.rotation, {
        x: point.rotation[0],
        y: point.rotation[1],
        z: point.rotation[2],
        duration,
        ease: "sine.inOut",
      }, `<`);
    });

    const trigger = ScrollTrigger.create({
      trigger: entranceEl,
      start: "top top",
      endTrigger: endEl,
      end: "bottom bottom",
      scrub: 1.15,
      animation: timeline,
    });

    return () => {
      trigger.kill();
      timeline.kill();
    };
  }, [camera]);

  return null;
}
