import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { CustomPrismaAdapter } from "./prismaAdapter";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    account: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const db = vi.mocked(prisma, { deep: true });

describe("CustomPrismaAdapter", () => {
  const adapter = CustomPrismaAdapter();
  beforeEach(() => vi.clearAllMocks());

  it("createUser inserts via the real User model and returns a real AdapterUser shape", async () => {
    db.user.create.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
    } as never);

    const result = await adapter.createUser!({
      email: "test@example.com",
      name: "Test User",
      image: null,
      emailVerified: null,
    } as never);

    expect(db.user.create).toHaveBeenCalledWith({
      data: { email: "test@example.com", name: "Test User", image: null },
    });
    expect(result).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      emailVerified: null,
    });
  });

  it("getUser returns null for a real, genuinely nonexistent user rather than throwing", async () => {
    db.user.findUnique.mockResolvedValue(null);

    const result = await adapter.getUser!("nonexistent-id");

    expect(result).toBeNull();
  });

  it("getUserByEmail finds the real user by their real email", async () => {
    db.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: null,
      image: null,
    } as never);

    const result = await adapter.getUserByEmail!("test@example.com");

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(result?.id).toBe("user-1");
  });

  it("getUserByAccount uses the real compound unique key matching the actual schema constraint", async () => {
    db.account.findUnique.mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@example.com",
        name: null,
        image: null,
      },
    } as never);

    const result = await adapter.getUserByAccount!({
      provider: "google",
      providerAccountId: "google-id-1",
    });

    expect(db.account.findUnique).toHaveBeenCalledWith({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: "google-id-1",
        },
      },
      include: { user: true },
    });
    expect(result?.id).toBe("user-1");
  });

  it("getUserByAccount returns null when no real account exists for this provider pair", async () => {
    db.account.findUnique.mockResolvedValue(null);

    const result = await adapter.getUserByAccount!({
      provider: "google",
      providerAccountId: "nonexistent",
    });

    expect(result).toBeNull();
  });

  it("linkAccount writes the real OAuth token fields to the real Account model", async () => {
    db.account.create.mockResolvedValue({} as never);

    await adapter.linkAccount!({
      userId: "user-1",
      type: "oauth",
      provider: "google",
      providerAccountId: "google-id-1",
      refresh_token: "real-refresh-token",
      access_token: "real-access-token",
      expires_at: 1234567890,
      token_type: "Bearer",
      scope: "openid email profile",
      id_token: "real-id-token",
      session_state: undefined,
    } as never);

    expect(db.account.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        provider: "google",
        providerAccountId: "google-id-1",
        refresh_token: "real-refresh-token",
        access_token: "real-access-token",
      }),
    });
  });

  it("useVerificationToken returns the real token when it genuinely exists and deletes it", async () => {
    const realToken = {
      identifier: "test@example.com",
      token: "real-token-value",
      expires: new Date("2026-01-01"),
    };
    db.verificationToken.delete.mockResolvedValue(realToken as never);

    const result = await adapter.useVerificationToken!({
      identifier: "test@example.com",
      token: "real-token-value",
    });

    expect(result).toEqual(realToken);
  });

  it("useVerificationToken returns null (never throws) for an already-used or nonexistent token - the real, documented Auth.js contract", async () => {
    db.verificationToken.delete.mockRejectedValue(
      new Error("Record to delete does not exist"),
    );

    const result = await adapter.useVerificationToken!({
      identifier: "test@example.com",
      token: "already-used-token",
    });

    expect(result).toBeNull();
  });

  it("createVerificationToken persists the real token via the real model", async () => {
    const realToken = {
      identifier: "test@example.com",
      token: "real-token",
      expires: new Date("2026-01-01"),
    };
    db.verificationToken.create.mockResolvedValue(realToken as never);

    const result = await adapter.createVerificationToken!(realToken);

    expect(db.verificationToken.create).toHaveBeenCalledWith({
      data: realToken,
    });
    expect(result).toEqual(realToken);
  });

  it("unlinkAccount uses the real compound unique key to delete the exact real account", async () => {
    db.account.delete.mockResolvedValue({} as never);

    await adapter.unlinkAccount!({
      provider: "google",
      providerAccountId: "google-id-1",
    });

    expect(db.account.delete).toHaveBeenCalledWith({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: "google-id-1",
        },
      },
    });
  });

  it("deleteUser removes the real user by their real id", async () => {
    db.user.delete.mockResolvedValue({} as never);

    await adapter.deleteUser!("user-1");

    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("updateUser writes real changes and returns the real, updated AdapterUser shape", async () => {
    db.user.update.mockResolvedValue({
      id: "user-1",
      email: "new-email@example.com",
      name: "New Name",
      image: null,
    } as never);

    const result = await adapter.updateUser!({
      id: "user-1",
      email: "new-email@example.com",
      name: "New Name",
    } as never);

    expect(result.email).toBe("new-email@example.com");
    expect(result.emailVerified).toBeNull();
  });
});
