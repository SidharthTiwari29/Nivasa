import { describe, expect, it } from "vitest";
import { answerWhatWouldYouDo } from "./assistant";
import { availableCredits, consume, reserve } from "./entitlements";
import { buildImmersiveScene } from "./immersive";
import { normalizeLocale } from "./localization";
import { createNivasaMoment } from "./moments";
import { recommendSmartHome } from "./smartHome";
import { buildActualApartmentVisualizationPlan } from "./visualization";

describe("Phase 1 intelligence contracts", () => {
  it("builds home-aware smart-home recommendations", () => {
    const result = recommendSmartHome({ rooms: [{ id: "r1", name: "Living", type: "LIVING_ROOM" }] });
    expect(result.some((item) => item.category === "LIGHTING")).toBe(true);
    expect(result.every((item) => item.evidenceRequired)).toBe(true);
  });

  it("normalizes supported Indian locales", () => {
    expect(normalizeLocale("kn-IN")).toBe("kn-IN");
    expect(normalizeLocale("unknown")).toBe("en-IN");
  });

  it("keeps assistant decisions contextual and user-controlled", () => {
    const result = answerWhatWouldYouDo({ projectId: "p1", approvedDecisions: ["d1"], lockedDecisions: ["d1"], budgetMinor: 100n, currentTotalMinor: 120n }, "What would you do about the budget?");
    expect(result.requiresUserDecision).toBe(true);
    expect(result.affectedDecisionIds).toEqual(["d1"]);
  });

  it("governs delightful notifications around quiet hours", () => {
    const preferences = { enabled: true, quietHours: { startHour: 22, endHour: 7 }, minimumIntervalMinutes: 60 };
    expect(createNivasaMoment({ type: "PRICE_DROP", itemName: "Light", savingMinor: 1000n }, preferences, 23)).toBeNull();
    expect(createNivasaMoment({ type: "BUDGET_EXCEEDED", amountMinor: 1000n }, preferences, 23)?.priority).toBe("TRANSACTIONAL");
  });

  it("enforces commercial credit invariants", () => {
    const initial = { id: "e1", userId: "u1", packageId: "p1", creditsTotal: 10, creditsReserved: 0, creditsConsumed: 0, status: "ACTIVE" as const };
    const reserved = reserve(initial, 3);
    expect(availableCredits(reserved)).toBe(7);
    const consumed = consume(reserved, 3);
    expect(consumed.creditsConsumed).toBe(3);
    expect(consumed.creditsReserved).toBe(0);
  });

  it("grounds visualization in the actual spatial model", () => {
    const plan = buildActualApartmentVisualizationPlan({
      spatialTruth: { propertyId: "prop1", floorPlanVersion: 2, rooms: [{ id: "living", name: "Living", geometry: {}, confidenceBps: 9000 }] },
      design: { projectId: "p1", versionId: "v1", approvedAt: new Date(), lockedDecisionIds: ["sofa"], designElements: [{ id: "e1", roomId: "living", kind: "SOFA", source: "REAL" }] },
      requestedViews: ["WHOLE_HOME"],
    });
    const scene = buildImmersiveScene(plan, [{ fromRoomId: "living", toRoomId: "missing" }]);
    expect(scene.spatiallyConsistent).toBe(true);
    expect(scene.firstPerson).toBe(true);
    expect(scene.navigationEdges).toHaveLength(0);
  });
});
