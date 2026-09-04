import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Niwasthan — A better way to build home",
    template: "%s | Niwasthan",
  },
  description:
    "Explore your home, understand the design, see the budget relationship and decide how you want it delivered with Niwasthan.",
  keywords: [
    "Niwasthan",
    "home design",
    "interior design",
    "home renovation",
    "residential design",
    "transparent home renovation",
  ],
  openGraph: {
    title: "Niwasthan — A better way to build home",
    description:
      "See the space. Understand the design. Know the cost. Then decide how you want it delivered.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
