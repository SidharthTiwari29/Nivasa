import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { withErrorHandling } from "@/server/errors/handler";
import { signupSignalService } from "@/server/services/signupSignalService";

// Called once by the client immediately after first login - the real
// request headers with genuine IP/User-Agent information are only
// available here, not inside NextAuth's internal event callbacks.
// Idempotent and write-once: calling this repeatedly, including from a
// later, different device, never overwrites the original signal.
//
// Honest limitation, stated where the actual header parsing happens:
// x-forwarded-for can list multiple proxy hops - the first entry is
// used as the best-available real client IP, but this is not proof
// against a determined actor spoofing the header themselves, nor does
// it detect a VPN's own IP as anything other than a normal address.
export const POST = withErrorHandling(async (request: Request) => {
  const { userId } = await requireAuth();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
  const userAgent = request.headers.get("user-agent");

  await signupSignalService.recordIfAbsent(userId, ipAddress, userAgent);
  return NextResponse.json({ recorded: true });
});
