import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { accountDeletionService } from "./accountDeletionService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    property: { deleteMany: vi.fn() },
    notification: { deleteMany: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        property: { deleteMany: vi.fn() },
        notification: { deleteMany: vi.fn() },
        user: { update: vi.fn() },
        auditLog: { create: vi.fn() },
      };
      return fn(tx);
    }),
  },
}));

// { deep: true } is required: vi.mocked() without it only types the
// top-level object as mocked. Nested methods like prisma.user.findUnique
// would stay typed as their real Prisma method signatures, which have no
// .mockResolvedValue - the exact TS error this caused (see also
// designProjectService.test.ts / boqService.test.ts for the same fix).
const db = vi.mocked(prisma, { deep: true });

describe("accountDeletionService.deleteAccount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects deleting a user that does not exist", async () => {
    db.user.findUnique.mockResolvedValue(null);

    await expect(
      accountDeletionService.deleteAccount("user-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes an existing, not-yet-anonymized account and returns success", async () => {
    db.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "real@example.com",
    } as never);

    const result = await accountDeletionService.deleteAccount(
      "user-1",
      "user-1",
    );

    expect(result).toEqual({ deleted: true });
  });

  it("is idempotent - deleting an already-anonymized account does not fail", async () => {
    db.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user-1@deleted.nivasa.local",
    } as never);

    const result = await accountDeletionService.deleteAccount(
      "user-1",
      "admin-1",
    );

    expect(result).toEqual({ deleted: true });
  });
});
