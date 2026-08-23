import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import {
  createDesignRevision,
  createDesignVersion,
} from "./designProjectService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    designProject: { findFirst: vi.fn(), create: vi.fn() },
    designVersion: { findFirst: vi.fn(), create: vi.fn() },
    designRevision: { findFirst: vi.fn(), create: vi.fn() },
    property: { findFirst: vi.fn() },
    room: { findFirst: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

describe("designProjectService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a version for an unowned project", async () => {
    db.designProject.findFirst.mockResolvedValue(null);

    await expect(
      createDesignVersion({
        ownerId: "user-1",
        projectId: "project-1",
        prompt: "modern",
      }),
    ).rejects.toThrow("PROJECT_NOT_FOUND");
    expect(db.designVersion.create).not.toHaveBeenCalled();
  });

  it("increments the design version and preserves parameters", async () => {
    db.designProject.findFirst.mockResolvedValue({ id: "project-1" } as never);
    db.designVersion.findFirst.mockResolvedValue({ version: 3 } as never);
    db.designVersion.create.mockResolvedValue({
      id: "version-4",
      version: 4,
    } as never);

    await expect(
      createDesignVersion({
        ownerId: "user-1",
        projectId: "project-1",
        prompt: "modern",
        parameters: { palette: "warm" },
      }),
    ).resolves.toEqual({ id: "version-4", version: 4 });
    expect(db.designVersion.create).toHaveBeenCalledWith({
      data: {
        projectId: "project-1",
        version: 4,
        prompt: "modern",
        parameters: { palette: "warm" },
      },
    });
  });

  it("rejects a revision whose base version is not owned by the project", async () => {
    db.designProject.findFirst.mockResolvedValue({ id: "project-1" } as never);
    db.designVersion.findFirst.mockResolvedValue(null);

    await expect(
      createDesignRevision({
        ownerId: "user-1",
        projectId: "project-1",
        baseVersionId: "version-1",
        instruction: "make it brighter",
      }),
    ).rejects.toThrow("VERSION_NOT_FOUND");
    expect(db.designRevision.create).not.toHaveBeenCalled();
  });
});
