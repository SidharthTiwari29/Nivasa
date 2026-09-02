import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { referralService } from "@/server/services/referralService";

export const GET = withErrorHandling(async () => {
  const { userId } = await requireAuth();
  const code = await referralService.getOrCreateMyCode(userId);
  return NextResponse.json({ code });
});

// Applying a referral code is a discrete, explicit user action (e.g. a
// "have a referral code?" field shown once after signup) rather than
// baked into the OAuth callback chain itself - NextAuth's createUser
// event has no reliable way to carry a referral code through an OAuth
// redirect without fragile cookie/session plumbing. This is the
// simpler, more robust real-world pattern: the client captures a
// ?ref=CODE query param (or a manually-entered code) and calls this
// endpoint once, after the user is already authenticated.
const applyCodeSchema = z.object({ code: z.string().trim().min(1).max(20) });

export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const { code } = parseOrThrow(applyCodeSchema, await request.json());
  const referral = await referralService.applyReferralCode(userId, code);
  return NextResponse.json({ referral }, { status: 201 });
});
