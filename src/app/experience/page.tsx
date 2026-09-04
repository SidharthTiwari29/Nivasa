import { redirect } from "next/navigation";

// The immersive experience is now the actual homepage (see
// src/app/page.tsx) rather than a secondary linked page - redirecting
// here rather than duplicating the same component under two routes.
export default function ExperiencePage() {
  redirect("/");
}
