import { describe, expect, it } from "vitest";
import {
  compileSmartHomePlan,
  mergeSmartHomePlan,
} from "@/server/smartHome/smartHomePlan";

describe("smart home plan", () => {
  it("keeps only scenarios whose capabilities are enabled", () => {
    const plan = compileSmartHomePlan({
      capabilities: [
        {
          id: "MOVIE_MODE",
          enabled: true,
          roomIds: [],
          configuration: {},
        },
        {
          id: "SMART_LIGHTING",
          enabled: true,
          roomIds: [],
          configuration: {},
        },
        {
          id: "SMART_LOCK",
          enabled: false,
          roomIds: [],
          configuration: {},
        },
      ],
      scenarios: [
        {
          id: "movie",
          name: "Movie mode",
          trigger: "Movie starts",
          capabilityIds: ["MOVIE_MODE", "SMART_LIGHTING"],
          enabled: true,
        },
        {
          id: "entry",
          name: "Entry",
          trigger: "Door opens",
          capabilityIds: ["SMART_LOCK"],
          enabled: true,
        },
      ],
      visualizationState: "PREVIEW",
      budgetMinor: 250000,
    });

    expect(plan.enabledCapabilityIds).toEqual(["MOVIE_MODE", "SMART_LIGHTING"]);
    expect(plan.activeScenarioIds).toEqual(["movie"]);
    expect(plan.scenarios).toHaveLength(1);
  });

  it("merges a patch without mutating the previous plan", () => {
    const plan = mergeSmartHomePlan(
      {
        capabilities: [
          {
            id: "SMART_LIGHTING",
            enabled: true,
            roomIds: [],
            configuration: {},
          },
        ],
        scenarios: [],
        visualizationState: "PREVIEW",
        budgetMinor: 100000,
      },
      { visualizationState: "ACTIVE", budgetMinor: 120000 },
    );

    expect(plan.visualizationState).toBe("ACTIVE");
    expect(plan.budgetMinor).toBe(120000);
    expect(plan.enabledCapabilityIds).toEqual(["SMART_LIGHTING"]);
  });
});
