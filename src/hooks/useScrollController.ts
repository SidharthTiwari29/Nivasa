"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";
import type { SceneId } from "@/types/interior";

gsap.registerPlugin(ScrollTrigger);

const SCENE_ORDER: SceneId[] = [
  "entrance",
  "spatial",
  "materials",
  "transparency",
  "motion",
  "finds",
  "moments",
  "budget",
  "humsafar",
];

// Wires real inertial scrolling (Lenis) into GSAP's ticker so
// ScrollTrigger stays perfectly in sync with the smoothed scroll
// position, rather than the raw, jumpy native scroll event. Each scene
// section registers its own ScrollTrigger keyed to its real DOM id, so
// the active scene in the store always reflects what's genuinely
// in view, not an assumed or hardcoded sequence.
export function useScrollController() {
  const setActiveScene = useNiwasthanStore((s) => s.setActiveScene);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenis.on("scroll", ScrollTrigger.update);

    const triggers = SCENE_ORDER.map((sceneId) => {
      const el = document.getElementById(`scene-${sceneId}`);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveScene(sceneId),
        onEnterBack: () => setActiveScene(sceneId),
      });
    }).filter((t): t is ScrollTrigger => t !== null);

    return () => {
      gsap.ticker.remove(raf);
      triggers.forEach((t) => t.kill());
      lenis.destroy();
    };
  }, [setActiveScene]);
}
