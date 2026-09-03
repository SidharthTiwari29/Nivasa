"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Direction = {
  id: string;
  name: string;
  status: "ACTIVE" | "ALTERNATIVE" | "REJECTED";
};

type Selection = {
  itemId: string;
  itemName: string;
  brand: string | null;
  unitPriceMinor: string;
  quantity: number;
  lineTotalMinor: string;
};

type Recommendation = {
  id: string;
  status: string;
  selections: Selection[];
  totalMinor: string;
};

function formatRupees(minor: string | number): string {
  return `₹${(Number(minor) / 100).toLocaleString("en-IN")}`;
}

export function DesignWorkspace({
  projectId,
  hasRoom,
  initialDirections,
}: {
  projectId: string;
  hasRoom: boolean;
  initialDirections: Direction[];
}) {
  const router = useRouter();
  const [directions, setDirections] = useState(initialDirections);
  const [newDirectionName, setNewDirectionName] = useState("");
  const [targetBudget, setTargetBudget] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [committedBoq, setCommittedBoq] = useState<{
    id: string;
    totalMinor: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createDirection() {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(
        `/api/design-projects/${projectId}/directions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newDirectionName }),
        },
      );
      if (!response.ok) throw new Error("Couldn't create this direction.");
      const { direction } = await response.json();
      setDirections((prev) => [...prev, direction]);
      setNewDirectionName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function activateDirection(directionId: string) {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(
        `/api/design-projects/${projectId}/directions/${directionId}/activate`,
        { method: "POST" },
      );
      if (!response.ok) throw new Error("Couldn't activate this direction.");
      setDirections((prev) =>
        prev.map((d) => ({
          ...d,
          status:
            d.id === directionId
              ? "ACTIVE"
              : d.status === "ACTIVE"
                ? "ALTERNATIVE"
                : d.status,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function generateBoq() {
    setError(null);
    setBusy(true);
    try {
      const budgetRupees = Number(targetBudget);
      const response = await fetch(
        `/api/design-projects/${projectId}/generate-boq`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetBudgetMinor: Math.round(budgetRupees * 100),
          }),
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? "Couldn't generate a BOQ for this budget.",
        );
      }
      const { recommendation: rec } = await response.json();
      setRecommendation(rec);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function commitBoq() {
    if (!recommendation) return;
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(
        `/api/catalogue/recommend/${recommendation.id}/commit`,
        { method: "POST" },
      );
      if (!response.ok) throw new Error("Couldn't commit this BOQ.");
      const { boq } = await response.json();
      setCommittedBoq(boq);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 space-y-10">
      {/* Directions */}
      <section>
        <h2 className="font-display text-lg font-semibold">
          Design directions
        </h2>
        {directions.length === 0 ? (
          <p className="mt-2 font-body text-sm text-ink-soft">
            Explore a few real directions for this home — only one becomes
            active at a time, but nothing you explore is ever lost.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {directions.map((direction) => (
              <li
                key={direction.id}
                className="flex items-center justify-between rounded-sm border border-paper-raised px-4 py-2.5"
              >
                <span className="font-body text-sm text-ink">
                  {direction.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink-soft">
                    {direction.status}
                  </span>
                  {direction.status !== "ACTIVE" &&
                  direction.status !== "REJECTED" ? (
                    <button
                      onClick={() => activateDirection(direction.id)}
                      disabled={busy}
                      className="font-body text-xs font-medium text-laterite hover:underline disabled:opacity-50"
                    >
                      Make active
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-3">
          <input
            value={newDirectionName}
            onChange={(e) => setNewDirectionName(e.target.value)}
            placeholder="e.g. Warm Contemporary"
            className="rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
          />
          <button
            onClick={createDirection}
            disabled={busy || !newDirectionName.trim()}
            className="rounded-sm bg-indigo px-4 py-2 font-body text-sm font-medium text-paper transition-colors hover:bg-indigo-soft disabled:opacity-50"
          >
            Add direction
          </button>
        </div>
      </section>

      {/* BOQ generation */}
      {hasRoom ? (
        <section className="border-t border-paper-raised pt-8">
          <h2 className="font-display text-lg font-semibold">
            Generate a real BOQ
          </h2>
          <p className="mt-2 font-body text-sm text-ink-soft">
            Set a target budget and we&apos;ll curate real, currently-priced
            products from the catalogue to fit it.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-body text-sm text-ink-soft">₹</span>
            <input
              value={targetBudget}
              onChange={(e) => setTargetBudget(e.target.value)}
              type="number"
              placeholder="500000"
              className="rounded-sm border border-ink/15 bg-white px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-laterite"
            />
            <button
              onClick={generateBoq}
              disabled={busy || !targetBudget}
              className="rounded-sm bg-laterite px-4 py-2 font-body text-sm font-medium text-paper transition-colors hover:bg-laterite-deep disabled:opacity-50"
            >
              Generate
            </button>
          </div>
        </section>
      ) : null}

      {/* Recommendation preview + commit */}
      {recommendation && !committedBoq ? (
        <section className="border-t border-paper-raised pt-8">
          <h2 className="font-display text-lg font-semibold">
            Real, uncommitted recommendation
          </h2>
          <ul className="mt-4 divide-y divide-paper-raised">
            {recommendation.selections.map((selection) => (
              <li
                key={selection.itemId}
                className="flex items-center justify-between py-2"
              >
                <span className="font-body text-sm text-ink">
                  {selection.itemName}{" "}
                  {selection.brand ? (
                    <span className="text-ink-soft">· {selection.brand}</span>
                  ) : null}
                </span>
                <span className="font-body text-sm font-medium text-ink">
                  {formatRupees(selection.lineTotalMinor)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-paper-raised pt-4">
            <span className="font-body text-sm font-semibold text-ink">
              Total
            </span>
            <span className="font-display text-lg font-semibold text-ink">
              {formatRupees(recommendation.totalMinor)}
            </span>
          </div>
          <button
            onClick={commitBoq}
            disabled={busy}
            className="mt-4 rounded-sm bg-moss px-5 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-moss-deep disabled:opacity-50"
          >
            Commit this BOQ
          </button>
        </section>
      ) : null}

      {committedBoq ? (
        <section className="border-t border-paper-raised pt-8">
          <h2 className="font-display text-lg font-semibold">
            Real, committed BOQ
          </h2>
          <p className="mt-2 font-body text-sm text-ink-soft">
            Committed. Your budget has been automatically reconciled against
            this real total.
          </p>
          <p className="mt-3 font-display text-2xl font-semibold text-ink">
            {formatRupees(committedBoq.totalMinor)}
          </p>
        </section>
      ) : null}

      {error ? <p className="font-body text-sm text-alert">{error}</p> : null}
    </div>
  );
}
