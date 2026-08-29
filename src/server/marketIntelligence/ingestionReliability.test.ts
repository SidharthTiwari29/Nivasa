import { describe, expect, it } from "vitest";
import {
  buildReplayKey,
  calculateSourceHealth,
  summarizeIngestionRun,
} from "./ingestionReliability";

describe("ingestion reliability", () => {
  it("classifies complete, partial and failed runs", () => {
    expect(
      summarizeIngestionRun({
        counters: { recordsSeen: 10, recordsAccepted: 10, recordsRejected: 0 },
      }).status,
    ).toBe("SUCCEEDED");
    expect(
      summarizeIngestionRun({
        counters: { recordsSeen: 10, recordsAccepted: 8, recordsRejected: 2 },
      }).status,
    ).toBe("PARTIAL");
    expect(
      summarizeIngestionRun({
        counters: { recordsSeen: 10, recordsAccepted: 0, recordsRejected: 10 },
      }).status,
    ).toBe("FAILED");
  });

  it("rejects impossible ingestion counters", () => {
    expect(() =>
      summarizeIngestionRun({
        counters: { recordsSeen: 2, recordsAccepted: 2, recordsRejected: 1 },
      }),
    ).toThrow("cannot exceed");
  });

  it("creates deterministic replay keys", () => {
    expect(buildReplayKey(" ikea-in ", " run-1 ")).toBe("ikea-in:run-1");
    expect(() => buildReplayKey("", "run-1")).toThrow();
  });

  it("calculates source health and latest successful/failure timestamps", () => {
    const health = calculateSourceHealth("ikea-in", [
      { status: "SUCCEEDED", completedAt: new Date("2026-08-28") },
      { status: "PARTIAL", completedAt: new Date("2026-08-29") },
      { status: "FAILED", completedAt: new Date("2026-08-27") },
      { status: "FAILED", completedAt: null },
    ]);
    expect(health).toMatchObject({
      sourceKey: "ikea-in",
      successfulRuns: 1,
      partialRuns: 1,
      failedRuns: 2,
    });
    expect(health.lastSuccessfulAt).toEqual(new Date("2026-08-28"));
    expect(health.lastFailureAt).toEqual(new Date("2026-08-27"));
  });
});
