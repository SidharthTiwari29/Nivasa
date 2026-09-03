"use client";

import { useNiwasthanStore } from "@/store/useNiwasthanStore";
import type { SceneId } from "@/types/interior";

const SCENE_COPY: Record<SceneId, { heading: string; subtext?: string }> = {
  entrance: {
    heading: "YOUR HOME. DESIGNED YOUR WAY.",
    subtext: "See exactly how your home gets designed, priced and built.",
  },
  spatial: { heading: "Understanding your home" },
  materials: { heading: "Every material, chosen with a reason" },
  transparency: { heading: "The real price, and why" },
  motion: { heading: "Recalculating, live" },
  finds: { heading: "A smarter equivalent, found for you" },
  moments: { heading: "Designed for your everyday moments" },
  budget: { heading: "Your real total, always visible" },
  humsafar: { heading: "Your design companion" },
};

export function NavigationOverlay() {
  const activeScene = useNiwasthanStore((s) => s.activeScene);
  const copy = SCENE_COPY[activeScene];

  return (
    <div className="pointer-events-none fixed left-6 top-24 z-30 max-w-md md:left-12">
      <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
        {copy.heading}
      </h2>
      {copy.subtext ? (
        <p className="mt-2 font-body text-sm text-ink-soft">{copy.subtext}</p>
      ) : null}
    </div>
  );
}
