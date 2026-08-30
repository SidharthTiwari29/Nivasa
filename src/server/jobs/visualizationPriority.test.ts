import { describe, expect, it } from "vitest";
import { computeVisualizationPriority } from "./visualizationPriority";

describe("computeVisualizationPriority", () => {
  it("gives the highest priority (lowest number) to a confirmed, high-confidence room", () => {
    const priority = computeVisualizationPriority({
      status: "CONFIRMED",
      confidenceBps: 9500,
    });
    expect(priority).toBe(1);
  });

  it("gives a lower priority to a confirmed but low-confidence room", () => {
    const priority = computeVisualizationPriority({
      status: "CONFIRMED",
      confidenceBps: 5000,
    });
    expect(priority).toBe(3);
  });

  it("gives the lowest-but-one priority to any unconfirmed room, regardless of confidence score", () => {
    // Even a high confidenceBps doesn't matter if the user hasn't
    // confirmed the room understanding - unconfirmed always ranks below
    // any confirmed room.
    const priority = computeVisualizationPriority({
      status: "UNCONFIRMED",
      confidenceBps: 9900,
    });
    expect(priority).toBe(5);
  });

  it("gives the lowest priority when there is no room understanding data at all", () => {
    expect(computeVisualizationPriority(null)).toBe(10);
  });

  it("treats a null confidenceBps on a confirmed room as low confidence, not high", () => {
    const priority = computeVisualizationPriority({
      status: "CONFIRMED",
      confidenceBps: null,
    });
    expect(priority).toBe(3);
  });

  it("orders all four cases correctly relative to each other (lower number always renders first)", () => {
    const confirmedHigh = computeVisualizationPriority({
      status: "CONFIRMED",
      confidenceBps: 8000,
    });
    const confirmedLow = computeVisualizationPriority({
      status: "CONFIRMED",
      confidenceBps: 3000,
    });
    const unconfirmed = computeVisualizationPriority({
      status: "UNCONFIRMED",
      confidenceBps: 8000,
    });
    const noData = computeVisualizationPriority(null);

    expect(confirmedHigh).toBeLessThan(confirmedLow);
    expect(confirmedLow).toBeLessThan(unconfirmed);
    expect(unconfirmed).toBeLessThan(noData);
  });

  it("treats the 70% confidence boundary correctly (exactly at threshold counts as high)", () => {
    const atThreshold = computeVisualizationPriority({
      status: "CONFIRMED",
      confidenceBps: 7000,
    });
    const justBelow = computeVisualizationPriority({
      status: "CONFIRMED",
      confidenceBps: 6999,
    });
    expect(atThreshold).toBe(1);
    expect(justBelow).toBe(3);
  });
});
