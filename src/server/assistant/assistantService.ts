import Anthropic from "@anthropic-ai/sdk";
import { budgetRepository } from "@/server/repositories/budgetRepository";
import { propertyRepository } from "@/server/repositories/propertyRepository";
import { FAQ_ENTRIES, searchFaq } from "@/server/assistant/faq";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantResponse = {
  reply: string;
  usedTool: boolean;
};

// Same fail-closed convention as AIProvider/RenderingProvider: an
// unconfigured assistant throws an explicit, named error rather than
// silently returning a canned or fabricated answer. "No API key" must
// never look like "the assistant is working but has nothing useful to
// say" - those are different failure states and the caller needs to be
// able to tell them apart.
class AssistantNotConfiguredError extends Error {
  constructor() {
    super("ASSISTANT_NOT_CONFIGURED");
  }
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AssistantNotConfiguredError();
  return new Anthropic({ apiKey });
}

// The assistant only ever answers from two grounded sources: the static
// FAQ content (searchFaq) and the caller's OWN budget data, fetched via
// the exact same ownership-scoped repository every other part of this
// system uses (budgetRepository.findPlan(propertyId, ownerId) - ownerId
// is always the authenticated caller, never client-supplied). This is
// what stops the assistant from either hallucinating a budget figure or
// leaking another user's data - it literally cannot query anyone else's
// records, the same structural guarantee the rest of the codebase relies
// on rather than a prompt instruction hoping the model behaves.
const tools: Anthropic.Tool[] = [
  {
    name: "search_faq",
    description:
      "Search Nivasa's help articles for an answer to a general question about how the product works.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "get_my_budget_summary",
    description:
      "Get the caller's own current budget plan and latest version for a specific property they own.",
    input_schema: {
      type: "object",
      properties: { propertyId: { type: "string" } },
      required: ["propertyId"],
    },
  },
];

async function runTool(
  name: string,
  input: Record<string, unknown>,
  ownerId: string,
): Promise<string> {
  if (name === "search_faq") {
    const results = searchFaq(String(input.query ?? ""));
    if (results.length === 0) return "No matching help article found.";
    return JSON.stringify(results.map((r) => ({ q: r.question, a: r.answer })));
  }
  if (name === "get_my_budget_summary") {
    const propertyId = String(input.propertyId ?? "");
    const property = await propertyRepository.findByIdForOwner(
      propertyId,
      ownerId,
    );
    if (!property) return "No property found with that id for this account.";
    const plan = await budgetRepository.findPlan(propertyId, ownerId);
    if (!plan) return "No budget has been created for this property yet.";
    const latest = plan.versions[0];
    if (!latest) return "No budget version exists yet for this property.";
    return JSON.stringify({
      version: latest.version,
      targetMinor: latest.totalTargetMinor.toString(),
      lowMinor: latest.totalLowMinor?.toString(),
      highMinor: latest.totalHighMinor?.toString(),
    });
  }
  return "Unknown tool.";
}

export const assistantService = {
  async ask(
    ownerId: string,
    history: AssistantMessage[],
  ): Promise<AssistantResponse> {
    const client = getClient();
    let usedTool = false;

    const messages: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // A bounded loop, not recursion without limit - an assistant that
    // could call tools indefinitely is a real cost/availability risk, not
    // just a style preference.
    for (let turn = 0; turn < 4; turn += 1) {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system:
          "You are Nivasa's assistant. Only answer using search_faq or get_my_budget_summary results - never invent a price, policy, or feature. If neither tool has the answer, say you don't know and suggest contacting support.",
        tools,
        messages,
      });

      const toolUses = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
      );

      if (toolUses.length === 0) {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        return { reply: text, usedTool };
      }

      usedTool = true;
      messages.push({ role: "assistant", content: response.content });

      const toolResults = await Promise.all(
        toolUses.map(async (t) => ({
          type: "tool_result" as const,
          tool_use_id: t.id,
          content: await runTool(
            t.name,
            t.input as Record<string, unknown>,
            ownerId,
          ),
        })),
      );
      messages.push({ role: "user", content: toolResults });
    }

    return {
      reply:
        "I wasn't able to find a grounded answer to that. Please contact support.",
      usedTool,
    };
  },
};

export { FAQ_ENTRIES };
