import { signupSignalRepository } from "@/server/repositories/signupSignalRepository";

export const signupSignalService = {
  // Deliberately write-once: if a signal is already recorded for this
  // user, this call is a silent no-op rather than overwriting it. The
  // whole point of this signal is to capture the ORIGINAL signup
  // context - allowing later logins to overwrite it would let someone
  // "clean" a flagged signal simply by logging in again from a
  // different device or network after the fact.
  async recordIfAbsent(
    userId: string,
    ipAddress: string | null,
    userAgent: string | null,
  ) {
    const existing = await signupSignalRepository.findExisting(userId);
    const alreadyRecorded =
      existing != null && existing.signupIpAddress !== null;
    if (alreadyRecorded) return; // never overwritten once set

    await signupSignalRepository.record(userId, ipAddress, userAgent);
  },
};
