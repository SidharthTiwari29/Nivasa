"use client";

import dynamic from "next/dynamic";

const CinematicLanding = dynamic(
  () =>
    import("@/components/cinematic/CinematicLandingV2").then(
      (m) => m.CinematicLandingV2,
    ),
  { ssr: false },
);

export default function HomePage() {
  return <CinematicLanding />;
}
