import { onboardingRenderService } from "@/server/rendering/onboardingRenderService";

// Previously, onboardingRenderService.grantOnSignup existed as a real,
// tested function that was never called anywhere in the actual codebase
// - every new user was silently getting zero free HD renders, the exact
// opposite of what that feature (built specifically to let a prospective
// customer see genuine quality before paying anything) was designed to
// do. This is the real wiring, called from NextAuth's events.createUser
// hook, which fires exactly once per new account, never on subsequent
// logins.
//
// Best-effort: a failure here must never block account creation itself
// - the grant can be created lazily the first time it's actually checked
// (onboardingRenderService.hasUnusedGrant returns false for a user with
// no grant row at all, which is a safe, correct default, just missing
// the "trust-building" benefit for that one user until this is retried).
export async function handleUserCreated(userId: string): Promise<void> {
  try {
    await onboardingRenderService.grantOnSignup(userId);
  } catch {
    // Intentionally swallowed - see comment above.
  }
}
