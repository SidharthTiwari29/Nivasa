"use client";

import { useEffect, useState } from "react";
import {
  useNiwasthanStore,
  MATERIAL_CATALOGUE,
} from "@/store/useNiwasthanStore";

function formatRupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

// Animates the displayed number toward the real target value rather
// than snapping instantly - purely a display transition, never a
// separate source of truth from the store's real computed total.
function useAnimatedNumber(target: number, durationMs = 500) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const start = display;
    const startTime = performance.now();
    let frame: number;

    function tick(now: number) {
      const t = Math.min((now - startTime) / durationMs, 1);
      setDisplay(Math.round(start + (target - start) * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return display;
}

export function LiveBudgetCard() {
  const totalMinor = useNiwasthanStore((s) => s.totalMinor());
  const savingsMinor = useNiwasthanStore((s) => s.totalSavingsMinor());
  const categoryTotals = useNiwasthanStore((s) => s.categoryTotals());

  const animatedTotal = useAnimatedNumber(totalMinor);

  return (
    <div className="fixed right-6 top-24 z-40 w-72 rounded-lg border border-stone-200/60 bg-white/75 p-5 shadow-lg backdrop-blur-md">
      <p className="font-body text-xs font-medium uppercase tracking-wide text-ink-soft">
        Total current investment
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">
        {formatRupees(animatedTotal)}
      </p>

      <div className="mt-4 space-y-1.5 border-t border-stone-200/60 pt-3">
        {MATERIAL_CATALOGUE.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between font-body text-xs text-ink-soft"
          >
            <span>{category.label.split(" ")[0]}</span>
            <span className="font-medium text-ink">
              {formatRupees(categoryTotals[category.id] ?? 0)}
            </span>
          </div>
        ))}
      </div>

      {savingsMinor > 0 ? (
        <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2">
          <p className="font-body text-xs font-medium text-emerald-700">
            Savings engine unlocked: {formatRupees(savingsMinor)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
