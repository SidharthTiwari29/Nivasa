import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { propertyRepository } from "@/server/repositories/propertyRepository";

vi.mock("@/server/repositories/budgetRepository", () => ({
  budgetRepository: { findPlan: vi.fn() },
}));
vi.mock("@/server/repositories/propertyRepository", () => ({
  propertyRepository: { findByIdForOwner: vi.fn() },
}));

const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

const budgets = vi.mocked(budgetRepository);
const properties = vi.mocked(propertyRepository);

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
});
