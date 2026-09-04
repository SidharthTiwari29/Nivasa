"use client";

import dynamic from "next/dynamic";

const CinematicLanding = dynamic(
  () =>
    import("@/components/cinematic/CinematicLandingFinal").then(
      (m) => m.CinematicLandingFinal,
    ),
  { ssr: false },
);

export default function HomePage() {
  return <CinematicLanding />;
}
