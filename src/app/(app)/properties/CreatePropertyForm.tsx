"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreatePropertyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: address.trim() ? address : undefined,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Couldn't add this home.");
      }
      const { property } = await response.json();
      setName("");
      setAddress("");
      // Real, direct continuation of the actual agreed flow: a home's
      // real size and layout come from an uploaded floor plan (or, as a
      // fallback, room-by-room confirmation) - never from typing a
      // number into this initial form, which only ever asked for a
      // name and an optional address. Taking the person straight to the
      // upload step keeps that intent unambiguous.
      router.push(`/properties/${property.id}/floor-plan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this home.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 max-w-md">
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
        <p className="mt-1 font-body text-xs text-ink-soft">
          Just a label to find it later — not something we&apos;ll show anyone
          else.
        </p>
      </div>
      <div>
        <label
          htmlFor="property-address"
          className="block font-body text-sm font-medium text-ink"
        >
          Address (optional)
        </label>
        <input
          id="property-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Only if you'd like it saved with this home"
          className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
        />
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
