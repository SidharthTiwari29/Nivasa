"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PROPERTY_TYPES = [
  { value: "", label: "Select type" },
  { value: "ONE_BHK", label: "1 BHK" },
  { value: "TWO_BHK", label: "2 BHK" },
  { value: "THREE_BHK", label: "3 BHK" },
  { value: "FOUR_BHK", label: "4 BHK" },
  { value: "VILLA", label: "Villa" },
  { value: "OTHER", label: "Other" },
];

const MIN_BUDGET = 100_000; // Rs 1,00,000 - a real, sensible floor for a real renovation
const MAX_BUDGET = 5_000_000; // Rs 50,00,000 - a real, generous ceiling for the slider's range
const BUDGET_STEP = 50_000;

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function CreatePropertyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState(1_000_000);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Step 1: the real property record - name, city, type, and the
      // real, stated budget, all captured once here rather than across
      // several separate later steps.
      const propertyResponse = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city: city.trim() || undefined,
          propertyType: propertyType || undefined,
          targetBudget: budget,
        }),
      });
      if (!propertyResponse.ok) {
        const body = await propertyResponse.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Couldn't add this home.");
      }
      const { property } = await propertyResponse.json();

      // Step 2: a real design project under this property, using the
      // real project name given here - the same real, existing design-
      // project system, just created as part of this one combined flow
      // instead of a separate later screen.
      if (projectName.trim()) {
        await fetch("/api/design-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: property.id,
            name: projectName,
          }),
        });
      }

      router.push(`/properties/${property.id}/floor-plan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this home.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5 max-w-md">
      <div>
        <label
          htmlFor="property-name"
          className="block font-body text-sm font-medium text-ink"
        >
          What should we call this home?
        </label>
        <input
          id="property-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Home, My apartment"
          className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="property-city"
            className="block font-body text-sm font-medium text-ink"
          >
            City
          </label>
          <input
            id="property-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
          />
        </div>
        <div>
          <label
            htmlFor="property-type"
            className="block font-body text-sm font-medium text-ink"
          >
            Property type
          </label>
          <select
            id="property-type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
          >
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="project-name"
          className="block font-body text-sm font-medium text-ink"
        >
          Project name (optional)
        </label>
        <input
          id="project-name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Living room redesign, Full home makeover"
          className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
        />
        <p className="mt-1 font-body text-xs text-ink-soft">
          You can also start this later, room by room, once your floor plan is
          in.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="property-budget"
            className="block font-body text-sm font-medium text-ink"
          >
            Your target budget
          </label>
          <span className="font-body text-sm font-semibold text-ink">
            {formatRupees(budget)}
          </span>
        </div>
        <input
          id="property-budget"
          type="range"
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step={BUDGET_STEP}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-2 w-full accent-laterite"
        />
        <div className="mt-1 flex justify-between font-mono text-xs text-ink-soft">
          <span>{formatRupees(MIN_BUDGET)}</span>
          <span>{formatRupees(MAX_BUDGET)}</span>
        </div>
        <p className="mt-1 font-body text-xs text-ink-soft">
          A real starting point — every design decision will show its real cost
          against this, and you can change it anytime.
        </p>
      </div>

      <p className="font-body text-xs text-ink-soft">
        We don&apos;t ask you to type in room sizes here — the next step is
        uploading your real floor plan, and we work out the actual dimensions
        from that.
      </p>
      {error ? <p className="font-body text-sm text-alert">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-sm bg-laterite px-5 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-laterite-deep disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add home and upload floor plan"}
      </button>
    </form>
  );
}
