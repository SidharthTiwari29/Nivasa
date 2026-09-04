"use client";

import dynamic from "next/dynamic";

// Same real guard as /experience/page.tsx: the immersive experience
// renders a WebGL/Three.js canvas referencing browser-only globals that
// don't exist during Next.js's server-side build, and next/dynamic's
// ssr: false requires being called from a real Client Component.
//
// This is now the actual homepage, not a secondary linked page - the
// original spec was titled "IMMERSIVE HERO EXPERIENCE," and a hero
// belongs on the homepage a visitor actually lands on, not hidden
// behind a "see it in motion" link on a plainer page.
const ImmersiveExperience = dynamic(
  () =>
    import("./experience/ImmersiveExperience").then(
      (m) => m.ImmersiveExperience,
    ),
  { ssr: false },
);

export default function HomePage() {
  return <ImmersiveExperience />;
}
