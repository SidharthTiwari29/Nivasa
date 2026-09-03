"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ROOM_TYPES = [
  { value: "LIVING_ROOM", label: "Living room" },
  { value: "BEDROOM", label: "Bedroom" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BATHROOM", label: "Bathroom" },
  { value: "DINING_ROOM", label: "Dining room" },
  { value: "BALCONY", label: "Balcony" },
  { value: "STUDY", label: "Study" },
  { value: "OTHER", label: "Other" },
];

export function CreateRoomForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("LIVING_ROOM");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, type, name }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Couldn't add this room.");
      }
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this room.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 flex flex-wrap items-end gap-3"
    >
      <div>
        <label
          htmlFor="room-name"
          className="block font-body text-xs font-medium text-ink-soft"
        >
          Name
        </label>
        <input
          id="room-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Main living room"
          className="mt-1 rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
        />
      </div>
      <div>
        <label
          htmlFor="room-type"
          className="block font-body text-xs font-medium text-ink-soft"
        >
          Type
        </label>
        <select
          id="room-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
        >
          {ROOM_TYPES.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-sm bg-indigo px-4 py-2 font-body text-sm font-medium text-paper transition-colors hover:bg-indigo-soft disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add room"}
      </button>
      {error ? (
        <p className="w-full font-body text-sm text-alert">{error}</p>
      ) : null}
    </form>
  );
}
