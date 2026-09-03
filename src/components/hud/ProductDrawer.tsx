"use client";

import { X } from "lucide-react";
import {
  useNiwasthanStore,
  MATERIAL_CATALOGUE,
} from "@/store/useNiwasthanStore";
import { useNanoBanana } from "@/hooks/useNanoBanana";

function formatRupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export function ProductDrawer({
  categoryId,
  onClose,
}: {
  categoryId: string;
  onClose: () => void;
}) {
  const category = MATERIAL_CATALOGUE.find((c) => c.id === categoryId);
  const selectedOptionId = useNiwasthanStore(
    (s) => s.selectedOptions[categoryId],
  );
  const { applyMaterialChange } = useNanoBanana();

  if (!category) return null;
  const selected = category.options.find((o) => o.id === selectedOptionId);

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-stone-200/60 bg-white/85 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {category.label}
          </h3>
          <p className="mt-1 font-body text-xs text-ink-soft">
            {category.specifications.join(" · ")}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-stone-100 hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
        {category.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              onClick={() => applyMaterialChange(category.id, option.id)}
              className={`w-full rounded-md border p-4 text-left transition-colors ${
                isSelected
                  ? "border-laterite bg-laterite/5"
                  : "border-stone-200/60 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-ink">
                  {option.name}
                </span>
                <span className="font-body text-sm font-semibold text-ink">
                  {formatRupees(option.priceMinor)}
                </span>
              </div>
              <p className="mt-1 font-body text-xs text-ink-soft">
                {option.specSummary}
              </p>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-4 rounded-md bg-stone-100/70 px-4 py-3">
          <p className="font-body text-xs leading-relaxed text-ink-soft">
            {selected.reasonText}
          </p>
        </div>
      ) : null}
    </div>
  );
}
