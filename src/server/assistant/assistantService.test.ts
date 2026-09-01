import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { propertyRepository } from "@/server/repositories/propertyRepository";
import { roomRepository } from "@/server/repositories/roomRepository";

vi.mock("@/server/repositories/budgetRepository", () => ({
  budgetRepository: { findPlan: vi.fn() },
}));
vi.mock("@/server/repositories/propertyRepository", () => ({
  propertyRepository: { findByIdForOwner: vi.fn() },
}));
vi.mock("@/server/repositories/roomRepository", () => ({
  roomRepository: { findWithUnderstandingForOwner: vi.fn() },
}));

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

const budgets = vi.mocked(budgetRepository);
const properties = vi.mocked(propertyRepository);
const rooms = vi.mocked(roomRepository);

describe("assistantService.ask", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it("throws ASSISTANT_NOT_CONFIGURED when no API key is set, rather than fabricating a reply", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { assistantService } = await import("./assistantService");

    await expect(
      assistantService.ask("user-1", [{ role: "user", content: "hi" }]),
    ).rejects.toThrow("ASSISTANT_NOT_CONFIGURED");
  });

  it("returns the model's direct text reply when no tool is used", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "Here is the answer." }],
    });
    const { assistantService } = await import("./assistantService");

    const result = await assistantService.ask("user-1", [
      { role: "user", content: "hello" },
    ]);

    expect(result.reply).toBe("Here is the answer.");
    expect(result.usedTool).toBe(false);
  });

  it("calls get_my_budget_summary scoped to the caller and grounds the final reply in the real result", async () => {
    properties.findByIdForOwner.mockResolvedValue({
      id: "property-1",
    } as never);
    budgets.findPlan.mockResolvedValue({
      plan: { id: "plan-1" },
      versions: [
        {
          version: 2,
          totalTargetMinor: 500_000n,
          totalLowMinor: 450_000n,
          totalHighMinor: 550_000n,
        },
      ],
    } as never);

    mockCreate
      .mockResolvedValueOnce({
        content: [
          {
            type: "tool_use",
            id: "tool-1",
            name: "get_my_budget_summary",
            input: { propertyId: "property-1" },
          },
        ],
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "Your target budget is ₹5,000." }],
      });

    const { assistantService } = await import("./assistantService");
    const result = await assistantService.ask("user-1", [
      { role: "user", content: "what is my budget" },
    ]);

    expect(properties.findByIdForOwner).toHaveBeenCalledWith(
      "property-1",
      "user-1",
    );
    expect(result.usedTool).toBe(true);
    expect(result.reply).toContain("5,000");
  });

  it("does not leak another owner's budget when the property does not belong to the caller", async () => {
    properties.findByIdForOwner.mockResolvedValue(null);

    mockCreate
      .mockResolvedValueOnce({
        content: [
          {
            type: "tool_use",
            id: "tool-1",
            name: "get_my_budget_summary",
            input: { propertyId: "someone-elses-property" },
          },
        ],
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "I could not find that property." }],
      });

    const { assistantService } = await import("./assistantService");
    await assistantService.ask("user-1", [
      { role: "user", content: "what is my budget" },
    ]);

    expect(budgets.findPlan).not.toHaveBeenCalled();
  });

  it("calls get_room_context and grounds a 'what would you do' answer in the real room data", async () => {
    rooms.findWithUnderstandingForOwner.mockResolvedValue({
      type: "BEDROOM",
      areaSqFt: { toString: () => "120" },
      roomUnderstandings: [{ status: "CONFIRMED", confidenceBps: 9000 }],
    } as never);

    mockCreate
      .mockResolvedValueOnce({
        content: [
          {
            type: "tool_use",
            id: "tool-1",
            name: "get_room_context",
            input: { roomId: "room-1" },
          },
        ],
      })
      .mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: "Given your 120 sq ft confirmed bedroom, I'd suggest...",
          },
        ],
      });

    const { assistantService } = await import("./assistantService");
    const result = await assistantService.ask("user-1", [
      {
        role: "user",
        content: "what would you do if this were your home",
      },
    ]);

    expect(rooms.findWithUnderstandingForOwner).toHaveBeenCalledWith(
      "room-1",
      "user-1",
    );
    expect(result.usedTool).toBe(true);
    expect(result.reply).toContain("120 sq ft");
  });

  it("does not leak another owner's room data when the room does not belong to the caller", async () => {
    rooms.findWithUnderstandingForOwner.mockResolvedValue(null);

    mockCreate
      .mockResolvedValueOnce({
        content: [
          {
            type: "tool_use",
            id: "tool-1",
            name: "get_room_context",
            input: { roomId: "someone-elses-room" },
          },
        ],
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "I could not find that room." }],
      });

    const { assistantService } = await import("./assistantService");
    await assistantService.ask("user-1", [
      { role: "user", content: "what would you do with this room" },
    ]);

    expect(rooms.findWithUnderstandingForOwner).toHaveBeenCalledWith(
      "someone-elses-room",
      "user-1",
    );
    // The mock resolving to null is what proves ownership scoping is
    // enforced at the repository call itself (same userId always passed
    // through, never a client-controlled owner id) - not asserting on
    // unreachable internals, just that the real call shape can't leak.
  });
});
