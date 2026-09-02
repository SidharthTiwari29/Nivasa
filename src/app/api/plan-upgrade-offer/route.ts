import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { parseOrThrow } from "@/server/validators/parse";
import { planUpgradeOfferService } from "@/server/services/planUpgradeOfferService";

const querySchema = z.object({
  targetPackageCode: z.string().trim().min(1),
});

// Idempotent within the current 4-hour window - calling this repeatedly
// while an offer is still valid returns the exact same offer, never a
// better one. A new, better offer only appears once the previous one has
// genuinely expired and the customer visits again.
export const GET = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const url = new URL(request.url);
  const { targetPackageCode } = parseOrThrow(querySchema, {
    targetPackageCode: url.searchParams.get("targetPackageCode"),
  });
  const offer = await planUpgradeOfferService.getOrAdvanceOffer(
    userId,
    targetPackageCode,
  );
  return NextResponse.json({ offer });
});
