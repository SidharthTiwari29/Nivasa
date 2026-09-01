import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { homeIntelligenceRepository } from "@/server/repositories/homeIntelligenceRepository";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { designQualityService } from "./designQualityService";

vi.mock("@/server/repositories/homeIntelligenceRepository", () => ({
  homeIntelligenceRepository: { findForOwner: vi.fn() },
}));
vi.mock("@/server/repositories/budgetRepository", () => ({
  budgetRepository: { findPlan: vi.fn() },
}));

const homeIntelligence = vi.mocked(homeIntelligenceRepository);
const budgets = vi.mocked(budgetRepository);

describe("designQualityService.runChecks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a property the caller does not own", async () => {
    homeIntelligence.findForOwner.mockResolvedValue(null);
    await expect(
      designQualityService.runChecks("property-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns no flags for a well-formed property with no budget yet", async () => {
    homeIntelligence.findForOwner.mockResolvedValue({
      id: "property-1",
      rooms: [
        {
          id: "room-1",
          type: "BEDROOM",
          areaSqFt: 120,
          roomUnderstandings: [{ status: "CONFIRMED", confidenceBps: 9500 }],
        },
      ],
    } as never);
    budgets.findPlan.mockResolvedValue(null);

    const flags = await designQualityService.runChecks("property-1", "user-1");

    expect(flags).toEqual([]);
  });

  it("surfaces a real room-area risk alongside a real budget risk", async () => {
    homeIntelligence.findForOwner.mockResolvedValue({
      id: "property-1",
      rooms: [
        {
          id: "room-1",
          type: "BEDROOM",
          areaSqFt: 50, // below the 80 sqft minimum
          roomUnderstandings: [{ status: "CONFIRMED", confidenceBps: 9500 }],
        },
      ],
    } as never);
    budgets.findPlan.mockResolvedValue({
      plan: { id: "plan-1" },
      versions: [{ version: 1, totalTargetMinor: 500_000n }], // ₹100/sqft over 50 sqft - implausibly low
    } as never);

    const flags = await designQualityService.runChecks("property-1", "user-1");

    const codes = flags.map((f) => f.code);
    expect(codes).toContain("ROOM_AREA_BELOW_MINIMUM");
    expect(codes).toContain("BUDGET_IMPLAUSIBLY_LOW");
  });

  it("flags an unconfirmed room understanding even when area is fine", async () => {
    homeIntelligence.findForOwner.mockResolvedValue({
      id: "property-1",
      rooms: [
        {
          id: "room-1",
          type: "BEDROOM",
          areaSqFt: 150,
          roomUnderstandings: [{ status: "UNCONFIRMED", confidenceBps: 9000 }],
        },
      ],
    } as never);
    budgets.findPlan.mockResolvedValue(null);

    const flags = await designQualityService.runChecks("property-1", "user-1");

    expect(flags.some((f) => f.code === "ROOM_UNDERSTANDING_UNCONFIRMED")).toBe(
      true,
    );
  });
});
