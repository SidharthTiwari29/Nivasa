"use client";

import { X } from "lucide-react";
import { useNiwasthanStore } from "@/store/useNiwasthanStore";

const TONE_STYLES: Record<string, string> = {
  info: "border-stone-200/60 bg-white/80",
  positive: "border-emerald-200/60 bg-emerald-50/80",
  warning: "border-amber-200/60 bg-amber-50/80",
};

export function HumsafarNudge() {
  const nudges = useNiwasthanStore((s) => s.humsafarNudges);
  const dismissNudge = useNiwasthanStore((s) => s.dismissNudge);

  if (nudges.length === 0) return null;
  const current = nudges[nudges.length - 1];

  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-full border px-5 py-3 shadow-lg backdrop-blur-md ${TONE_STYLES[current.tone]}`}
      >
        <span className="font-body text-sm text-ink">{current.text}</span>
        <button
          onClick={() => dismissNudge(current.id)}
          aria-label="Dismiss"
          className="text-ink-soft transition-colors hover:text-ink"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
