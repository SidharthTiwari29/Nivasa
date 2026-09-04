"use client";

import dynamic from "next/dynamic";

// Real, necessary guard: ImmersiveExperience renders a WebGL/Three.js
// canvas, which references browser-only globals (window, navigator, a
// real GPU context) that do not exist in the Node.js environment Next.js
// uses during server-side build/prerendering. `ssr: false` prevents
// this module tree from ever being evaluated during the server build.
//
// This page is marked "use client" because Next.js's App Router
// specifically disallows `ssr: false` on a `next/dynamic` import inside
// a Server Component - it must be called from a real Client Component.
// This page does no server-only work (no data fetching, no server-only
// imports), so making it a Client Component costs nothing real here.
const ImmersiveExperience = dynamic(
  () => import("./ImmersiveExperience").then((m) => m.ImmersiveExperience),
  { ssr: false },
);

export default function ExperiencePage() {
  return <ImmersiveExperience />;
}
