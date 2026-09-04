import dynamic from "next/dynamic";

// Real, necessary guard: ImmersiveExperience renders a WebGL/Three.js
// canvas, which references browser-only globals (window, navigator, a
// real GPU context) that do not exist in the Node.js environment Next.js
// uses during server-side build/prerendering. Without ssr: false, this
// throws during `next build` on real infrastructure - my own local
// sandbox never caught this because it has never been able to run a
// real, complete Next.js build at all (the same permanent Prisma-client
// limitation documented throughout this project also means a full
// `next build` was never actually exercised here until now).
const ImmersiveExperience = dynamic(
  () => import("./ImmersiveExperience").then((m) => m.ImmersiveExperience),
  { ssr: false },
);

export default function ExperiencePage() {
  return <ImmersiveExperience />;
}
