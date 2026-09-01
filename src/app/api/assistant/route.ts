import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { consumeRateLimit } from "@/server/security/rateLimit";
import { assistantService } from "@/server/assistant/assistantService";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  // Rate limited like the webhook/quote-submission endpoints: an LLM call
  // costs real money per request, so this is the single highest-priority
  // endpoint in the codebase to protect from abuse.
  const rateLimit = await consumeRateLimit({
    key: `assistant:${userId}`,
    limit: 20,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests" } },
      { status: 429 },
    );
  }
  const { messages } = parseOrThrow(bodySchema, await request.json());
  const result = await assistantService.ask(userId, messages);
  return NextResponse.json(result);
});
