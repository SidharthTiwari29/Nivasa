"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Wall = "NORTH" | "SOUTH" | "EAST" | "WEST";

type DoorRow = { widthFt: string; wall: Wall; connectsToRoomId: string };
type WindowRow = { widthFt: string; wall: Wall };

type OtherRoom = { id: string; name: string };

function parseExistingDoors(
  dimensions: Record<string, unknown> | null,
): DoorRow[] {
  const doors = dimensions?.doors;
  if (!Array.isArray(doors)) return [];
  return doors.map((d) => ({
    widthFt: String((d as { widthFt?: number }).widthFt ?? ""),
    wall: ((d as { wall?: Wall }).wall ?? "SOUTH") as Wall,
    connectsToRoomId:
      (d as { connectsToRoomId?: string }).connectsToRoomId ?? "",
  }));
}

function parseExistingWindows(
  dimensions: Record<string, unknown> | null,
): WindowRow[] {
  const windows = dimensions?.windows;
  if (!Array.isArray(windows)) return [];
  return windows.map((w) => ({
    widthFt: String((w as { widthFt?: number }).widthFt ?? ""),
    wall: ((w as { wall?: Wall }).wall ?? "SOUTH") as Wall,
  }));
}

export function RoomUnderstandingForm({
  propertyId,
  roomId,
  roomType,
  roomName,
  otherRooms,
  latest,
}: {
  propertyId: string;
  roomId: string;
  roomType: string;
  roomName: string;
  otherRooms: OtherRoom[];
  latest: {
    status: string;
    dimensions: Record<string, unknown> | null;
  } | null;
}) {
  const router = useRouter();
  const dims = latest?.dimensions ?? null;

  const [lengthFt, setLengthFt] = useState(
    String((dims?.lengthFt as number) ?? ""),
  );
  const [widthFt, setWidthFt] = useState(
    String((dims?.widthFt as number) ?? ""),
  );
  const [heightFt, setHeightFt] = useState(
    String((dims?.heightFt as number) ?? ""),
  );
  const [doors, setDoors] = useState<DoorRow[]>(parseExistingDoors(dims));
  const [windows, setWindows] = useState<WindowRow[]>(
    parseExistingWindows(dims),
  );

  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(
    latest?.status ?? null,
  );

  function addDoor() {
    setDoors((prev) => [
      ...prev,
      { widthFt: "3", wall: "SOUTH", connectsToRoomId: "" },
    ]);
  }
  function addWindow() {
    setWindows((prev) => [...prev, { widthFt: "3", wall: "SOUTH" }]);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/rooms/${roomId}/understanding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomType,
            name: roomName,
            source: "USER",
            status: "UNCONFIRMED",
            dimensions: {
              lengthFt: Number(lengthFt) || undefined,
              widthFt: Number(widthFt) || undefined,
              heightFt: Number(heightFt) || undefined,
              doors: doors
                .filter((d) => d.widthFt)
                .map((d) => ({
                  widthFt: Number(d.widthFt),
                  wall: d.wall,
                  connectsToRoomId: d.connectsToRoomId || undefined,
                })),
              windows: windows
                .filter((w) => w.widthFt)
                .map((w) => ({ widthFt: Number(w.widthFt), wall: w.wall })),
            },
          }),
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? "Couldn't save these dimensions.",
        );
      }
      const { understanding } = await response.json();
      setSavedStatus(understanding.status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    setConfirming(true);
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/rooms/${roomId}/understanding/confirm`,
        { method: "POST" },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? "Couldn't confirm this room yet.",
        );
      }
      const { understanding } = await response.json();
      setSavedStatus(understanding.status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mt-8 max-w-2xl space-y-8">
      {savedStatus ? (
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          Status: {savedStatus}
        </p>
      ) : null}

      <section>
        <h2 className="font-body text-sm font-semibold text-ink">Dimensions</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <label className="block font-body text-xs text-ink-soft">
              Length (ft)
            </label>
            <input
              value={lengthFt}
              onChange={(e) => setLengthFt(e.target.value)}
              type="number"
              className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm outline-none focus-visible:border-laterite"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-soft">
              Width (ft)
            </label>
            <input
              value={widthFt}
              onChange={(e) => setWidthFt(e.target.value)}
              type="number"
              className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm outline-none focus-visible:border-laterite"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-soft">
              Height (ft)
            </label>
            <input
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              type="number"
              className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm outline-none focus-visible:border-laterite"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-body text-sm font-semibold text-ink">Doors</h2>
          <button
            onClick={addDoor}
            className="font-body text-xs font-medium text-laterite hover:underline"
          >
            + Add door
          </button>
        </div>
        <p className="mt-1 font-body text-xs text-ink-soft">
          Telling us which room a door leads to is what lets us build an
          accurate, connected walkthrough of your real home instead of a guessed
          layout.
        </p>
        <div className="mt-3 space-y-2">
          {doors.map((door, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={door.widthFt}
                onChange={(e) =>
                  setDoors((prev) =>
                    prev.map((d, idx) =>
                      idx === i ? { ...d, widthFt: e.target.value } : d,
                    ),
                  )
                }
                type="number"
                placeholder="Width (ft)"
                className="w-24 rounded-sm border border-ink/15 bg-white px-2 py-1.5 font-body text-sm outline-none focus-visible:border-laterite"
              />
              <select
                value={door.wall}
                onChange={(e) =>
                  setDoors((prev) =>
                    prev.map((d, idx) =>
                      idx === i ? { ...d, wall: e.target.value as Wall } : d,
                    ),
                  )
                }
                className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 font-body text-sm"
              >
                <option value="NORTH">North wall</option>
                <option value="SOUTH">South wall</option>
                <option value="EAST">East wall</option>
                <option value="WEST">West wall</option>
              </select>
              <select
                value={door.connectsToRoomId}
                onChange={(e) =>
                  setDoors((prev) =>
                    prev.map((d, idx) =>
                      idx === i
                        ? { ...d, connectsToRoomId: e.target.value }
                        : d,
                    ),
                  )
                }
                className="flex-1 rounded-sm border border-ink/15 bg-white px-2 py-1.5 font-body text-sm"
              >
                <option value="">Leads outside / not sure</option>
                {otherRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Leads to {r.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setDoors((prev) => prev.filter((_, idx) => idx !== i))
                }
                aria-label="Remove door"
                className="font-body text-xs text-alert hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-body text-sm font-semibold text-ink">Windows</h2>
          <button
            onClick={addWindow}
            className="font-body text-xs font-medium text-laterite hover:underline"
          >
            + Add window
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {windows.map((window, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={window.widthFt}
                onChange={(e) =>
                  setWindows((prev) =>
                    prev.map((w, idx) =>
                      idx === i ? { ...w, widthFt: e.target.value } : w,
                    ),
                  )
                }
                type="number"
                placeholder="Width (ft)"
                className="w-24 rounded-sm border border-ink/15 bg-white px-2 py-1.5 font-body text-sm outline-none focus-visible:border-laterite"
              />
              <select
                value={window.wall}
                onChange={(e) =>
                  setWindows((prev) =>
                    prev.map((w, idx) =>
                      idx === i ? { ...w, wall: e.target.value as Wall } : w,
                    ),
                  )
                }
                className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 font-body text-sm"
              >
                <option value="NORTH">North wall</option>
                <option value="SOUTH">South wall</option>
                <option value="EAST">East wall</option>
                <option value="WEST">West wall</option>
              </select>
              <button
                onClick={() =>
                  setWindows((prev) => prev.filter((_, idx) => idx !== i))
                }
                aria-label="Remove window"
                className="font-body text-xs text-alert hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 border-t border-paper-raised pt-6">
        <button
          onClick={handleSave}
          disabled={saving || !lengthFt || !widthFt}
          className="rounded-sm bg-indigo px-5 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-indigo-soft disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save dimensions"}
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirming || !savedStatus || savedStatus === "CONFIRMED"}
          className="rounded-sm bg-moss px-5 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-moss-deep disabled:opacity-50"
        >
          {savedStatus === "CONFIRMED"
            ? "Confirmed"
            : confirming
              ? "Confirming…"
              : "Confirm this is correct"}
        </button>
      </div>

      {error ? <p className="font-body text-sm text-alert">{error}</p> : null}
    </div>
  );
}
