import { beforeEach, describe, expect, it, vi } from "vitest";
import { signupSignalRepository } from "@/server/repositories/signupSignalRepository";
import { signupSignalService } from "./signupSignalService";

vi.mock("@/server/repositories/signupSignalRepository", () => ({
  signupSignalRepository: {
    findExisting: vi.fn(),
    record: vi.fn(),
  },
}));

const repo = vi.mocked(signupSignalRepository);

describe("signupSignalService.recordIfAbsent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records the signal for a user with no prior record at all", async () => {
    repo.findExisting.mockResolvedValue(null);

    await signupSignalService.recordIfAbsent("user-1", "1.1.1.1", "Chrome/A");

    expect(repo.record).toHaveBeenCalledWith("user-1", "1.1.1.1", "Chrome/A");
  });

  it("records the signal for a user whose IP field is genuinely null (never yet set)", async () => {
    repo.findExisting.mockResolvedValue({
      signupIpAddress: null,
      signupUserAgent: null,
    } as never);

    await signupSignalService.recordIfAbsent("user-1", "1.1.1.1", "Chrome/A");

    expect(repo.record).toHaveBeenCalledWith("user-1", "1.1.1.1", "Chrome/A");
  });

  it("does NOT overwrite an already-recorded signal - the write-once guarantee this feature depends on", async () => {
    repo.findExisting.mockResolvedValue({
      signupIpAddress: "9.9.9.9",
      signupUserAgent: "OriginalBrowser",
    } as never);

    await signupSignalService.recordIfAbsent(
      "user-1",
      "1.1.1.1",
      "DifferentBrowser",
    );

    expect(repo.record).not.toHaveBeenCalled();
  });
});
