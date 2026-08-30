export type TimelineEntryType = "VERSION_CREATED" | "IMPACT_RECORDED";

export type TimelineEntry = {
  type: TimelineEntryType;
  occurredAt: Date;
  version?: number;
  targetDeltaMinor?: bigint;
  reason?: string;
  totalTargetMinor?: bigint;
};

export type VersionRow = {
  version: number;
  totalLowMinor: bigint;
  totalTargetMinor: bigint;
  totalHighMinor: bigint;
  createdAt: Date;
};

export type ImpactRow = {
  baseVersion: number;
  proposedTargetDeltaMinor: bigint;
  reason: string;
  createdAt: Date;
};

// Merges two independently-timestamped data sources (BudgetVersion history
// and BudgetImpact reasons) into one chronological narrative, sorted
// purely by when each event actually happened - not grouped by type, so a
// user reading it sees the real sequence: "version 1 created, then this
// impact was recorded and explained, then version 2 was created as a
// result" rather than two disconnected lists they have to cross-reference
// themselves.
export function buildBudgetTimeline(
  versions: VersionRow[],
  impacts: ImpactRow[],
): TimelineEntry[] {
  const versionEntries: TimelineEntry[] = versions.map((v) => ({
    type: "VERSION_CREATED",
    occurredAt: v.createdAt,
    version: v.version,
    totalTargetMinor: v.totalTargetMinor,
  }));

  const impactEntries: TimelineEntry[] = impacts.map((i) => ({
    type: "IMPACT_RECORDED",
    occurredAt: i.createdAt,
    version: i.baseVersion,
    targetDeltaMinor: i.proposedTargetDeltaMinor,
    reason: i.reason,
  }));

  return [...versionEntries, ...impactEntries].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
  );
}
