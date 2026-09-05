import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";

const homeIntelligence = {
  listHomeDna: vi.fn(),
  createHomeDna: vi.fn(),
};

const rooms = {
  listForOwner: vi.fn(),
};

vi.mock("@/server/services/homeIntelligenceService", () => ({
  homeIntelligenceService: homeIntelligence,
}));

vi.mock("@/server/repositories/roomRepository", () => ({
  roomRepository: rooms,
}));

const { smartHomeService } = await import("./smartHomeService");

describe("smartHomeService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    homeIntelligence.listHomeDna.mockResolvedValue([
      {
        version: 3,
        household: { members: 4 },
        lifestyle: { mode: "family" },
        designPersonality: { style: "warm-modern" },
        storageNeeds: { priority: "high" },
        functionalNeeds: { study: true },
        futureNeeds: { flexibility: true },
        smartHomePreferences: {},
        language: "en-IN",
      },
    ]);
    homeIntelligence.createHomeDna.mockResolvedValue({ version: 4 });
    rooms.listForOwner.mockResolvedValue([{ id: "room-1" }]);
  });

  it("reads the latest Smart Home plan from Home DNA", async () => {
    await expect(
      smartHomeService.get("property-1", "owner-1"),
    ).resolves.toEqual({
      dnaVersion: 3,
      plan: {
        capabilities: [],
        scenarios: [],
        visualizationState: "PREVIEW",
        budgetMinor: null,
        enabledCapabilityIds: [],
        activeScenarioIds: [],
      },
    });
  });

  it("persists a compiled Smart Home plan while preserving the rest of Home DNA", async () => {
    const input = {
      capabilities: [
        {
          id: "SMART_LIGHTING" as const,
          enabled: true,
          roomIds: ["room-1"],
          configuration: { temperature: "warm" },
        },
      ],
      scenarios: [
        {
          id: "evening",
          name: "Evening",
          trigger: "sunset",
          capabilityIds: ["SMART_LIGHTING" as const],
          enabled: true,
        },
      ],
      visualizationState: "PREVIEW" as const,
      budgetMinor: 450000,
      notes: "Focus on living room lighting",
    };

    await expect(
      smartHomeService.create("property-1", "owner-1", input),
    ).resolves.toMatchObject({
      dnaVersion: 4,
      plan: expect.objectContaining({
        enabledCapabilityIds: ["SMART_LIGHTING"],
        activeScenarioIds: ["evening"],
      }),
    });

    expect(rooms.listForOwner).toHaveBeenCalledWith("owner-1", "property-1");
    expect(homeIntelligence.createHomeDna).toHaveBeenCalledWith(
      "property-1",
      "owner-1",
      expect.objectContaining({
        household: { members: 4 },
        lifestyle: { mode: "family" },
        language: "en-IN",
      }),
    );
  });

  it("rejects a Smart Home capability that targets a room outside the property", async () => {
    const input = {
      capabilities: [
        {
          id: "SMART_LOCK" as const,
          enabled: true,
          roomIds: ["foreign-room"],
          configuration: {},
        },
      ],
      scenarios: [],
      visualizationState: "PREVIEW" as const,
    };

    await expect(
      smartHomeService.create("property-1", "owner-1", input),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(homeIntelligence.createHomeDna).not.toHaveBeenCalled();
  });

  it("validates room targeting on patch as well as create", async () => {
    rooms.listForOwner.mockResolvedValue([{ id: "room-1" }]);

    const input = {
      capabilities: [
        {
          id: "SMART_SWITCHES" as const,
          enabled: true,
          roomIds: ["room-1", "foreign-room"],
          configuration: {},
        },
      ],
    };

    await expect(
      smartHomeService.patch("property-1", "owner-1", input),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(homeIntelligence.createHomeDna).not.toHaveBeenCalled();
  });
});
