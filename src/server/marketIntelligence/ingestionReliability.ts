export type IngestionStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "PARTIAL"
  | "FAILED"
  | "CANCELLED";

export interface IngestionCounters {
  recordsSeen: number;
  recordsAccepted: number;
  recordsRejected: number;
}

export interface IngestionRunSummary extends IngestionCounters {
  status: IngestionStatus;
  errors: string[];
}

export const validateIngestionCounters = (
  counters: IngestionCounters,
): void => {
  if (!Number.isInteger(counters.recordsSeen) || counters.recordsSeen < 0) {
    throw new Error("recordsSeen must be a non-negative integer");
  }
  if (
    !Number.isInteger(counters.recordsAccepted) ||
    counters.recordsAccepted < 0
  ) {
    throw new Error("recordsAccepted must be a non-negative integer");
  }
  if (
    !Number.isInteger(counters.recordsRejected) ||
    counters.recordsRejected < 0
  ) {
    throw new Error("recordsRejected must be a non-negative integer");
  }
  if (
    counters.recordsAccepted + counters.recordsRejected >
    counters.recordsSeen
  ) {
    throw new Error("accepted and rejected records cannot exceed records seen");
  }
};

export const summarizeIngestionRun = (input: {
  counters: IngestionCounters;
  errors?: readonly string[];
  cancelled?: boolean;
}): IngestionRunSummary => {
  validateIngestionCounters(input.counters);
  const errors = [
    ...new Set(
      (input.errors ?? []).map((error) => error.trim()).filter(Boolean),
    ),
  ];
  let status: IngestionStatus = "SUCCEEDED";
  if (input.cancelled) status = "CANCELLED";
  else if (
    input.counters.recordsRejected > 0 &&
    input.counters.recordsAccepted > 0
  ) {
    status = "PARTIAL";
  } else if (input.counters.recordsRejected > 0) {
    status = "FAILED";
  }

  return { ...input.counters, status, errors };
};

export const buildReplayKey = (
  sourceKey: string,
  idempotencyKey: string,
): string => {
  const source = sourceKey.trim();
  const key = idempotencyKey.trim();
  if (!source || !key) {
    throw new Error("sourceKey and idempotencyKey are required");
  }
  return `${source}:${key}`;
};

export interface SourceHealth {
  sourceKey: string;
  successfulRuns: number;
  partialRuns: number;
  failedRuns: number;
  lastSuccessfulAt: Date | null;
  lastFailureAt: Date | null;
}

export const calculateSourceHealth = (
  sourceKey: string,
  runs: readonly {
    status: IngestionStatus;
    completedAt: Date | null;
  }[],
): SourceHealth => {
  const matching = runs.filter(() => true);
  const successful = matching.filter((run) => run.status === "SUCCEEDED");
  const partial = matching.filter((run) => run.status === "PARTIAL");
  const failed = matching.filter((run) => run.status === "FAILED");
  const latest = (items: typeof matching): Date | null =>
    items.reduce<Date | null>((latestDate, run) => {
      if (!run.completedAt) return latestDate;
      return !latestDate || run.completedAt > latestDate
        ? run.completedAt
        : latestDate;
    }, null);

  return {
    sourceKey,
    successfulRuns: successful.length,
    partialRuns: partial.length,
    failedRuns: failed.length,
    lastSuccessfulAt: latest(successful),
    lastFailureAt: latest(failed),
  };
};
