import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/errors/AppError";
import {
  createDesignProject,
  createDesignRevision,
  createDesignVersion,
} from "./designProjectService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    designProject: { findFirst: vi.fn(), create: vi.fn() },
    designVersion: { findFirst: vi.fn(), create: vi.fn() },
    designRevision: { findFirst: vi.fn(), create: vi.fn() },
    designDirection: { findFirst: vi.fn() },
    property: { findFirst: vi.fn() },
    room: { findFirst: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

describe("designProjectService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createDesignProject", () => {
    it("rejects when the property does not exist or is not owned by the caller", async () => {
      db.property.findFirst.mockResolvedValue(null);

      await expect(
        createDesignProject({
          ownerId: "user-1",
          propertyId: "property-1",
          name: "Living Room Redesign",
        }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(db.designProject.create).not.toHaveBeenCalled();
    });

    it("rejects when a specified room does not exist under that property", async () => {
      db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
      db.room.findFirst.mockResolvedValue(null);

      await expect(
        createDesignProject({
          ownerId: "user-1",
          propertyId: "property-1",
          roomId: "room-1",
          name: "Living Room Redesign",
        }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(db.designProject.create).not.toHaveBeenCalled();
    });

    it("creates a project when the property is owned and no room is specified", async () => {
      db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
      db.designProject.create.mockResolvedValue({ id: "project-1" } as never);

      const result = await createDesignProject({
        ownerId: "user-1",
        propertyId: "property-1",
        name: "Whole Property Redesign",
      });

      expect(result).toEqual({ id: "project-1" });
      expect(db.room.findFirst).not.toHaveBeenCalled();
    });

    it("creates a project with a specified, existing room", async () => {
      db.property.findFirst.mockResolvedValue({ id: "property-1" } as never);
      db.room.findFirst.mockResolvedValue({ id: "room-1" } as never);
      db.designProject.create.mockResolvedValue({ id: "project-1" } as never);

      const result = await createDesignProject({
        ownerId: "user-1",
        propertyId: "property-1",
        roomId: "room-1",
        name: "Living Room Redesign",
      });

      expect(result).toEqual({ id: "project-1" });
    });
  });

  describe("createDesignVersion", () => {
    it("rejects a version for an unowned project", async () => {
      db.designProject.findFirst.mockResolvedValue(null);

      await expect(
        createDesignVersion({
          ownerId: "user-1",
          projectId: "project-1",
          prompt: "modern",
        }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(db.designVersion.create).not.toHaveBeenCalled();
    });

    it("rejects an explicit directionId that does not belong to this project", async () => {
      db.designProject.findFirst.mockResolvedValue({
        id: "project-1",
      } as never);
      db.designDirection.findFirst.mockResolvedValue(null);

      await expect(
        createDesignVersion({
          ownerId: "user-1",
          projectId: "project-1",
          directionId: "direction-from-another-project",
          prompt: "modern",
        }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(db.designVersion.create).not.toHaveBeenCalled();
    });

    it("defaults to the project's currently ACTIVE direction when none is explicitly given", async () => {
      db.designProject.findFirst.mockResolvedValue({
        id: "project-1",
      } as never);
      db.designDirection.findFirst.mockResolvedValue({
        id: "active-direction-1",
      } as never);
      db.designVersion.findFirst.mockResolvedValue({ version: 3 } as never);
      db.designVersion.create.mockResolvedValue({
        id: "version-4",
        version: 4,
      } as never);

      await createDesignVersion({
        ownerId: "user-1",
        projectId: "project-1",
        prompt: "modern",
      });

      expect(db.designVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ directionId: "active-direction-1" }),
      });
    });

    it("leaves directionId undefined for a project with no direction at all yet, rather than fabricating one", async () => {
      db.designProject.findFirst.mockResolvedValue({
        id: "project-1",
      } as never);
      db.designDirection.findFirst.mockResolvedValue(null);
      db.designVersion.findFirst.mockResolvedValue(null);
      db.designVersion.create.mockResolvedValue({
        id: "version-1",
        version: 1,
      } as never);

      await createDesignVersion({
        ownerId: "user-1",
        projectId: "project-1",
        prompt: "modern",
      });

      expect(db.designVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ directionId: undefined }),
      });
    });

    it("uses an explicit directionId when given, without looking up the active one", async () => {
      db.designProject.findFirst.mockResolvedValue({
        id: "project-1",
      } as never);
      db.designDirection.findFirst.mockResolvedValue({
        id: "exploring-direction-2",
      } as never);
      db.designVersion.findFirst.mockResolvedValue({ version: 3 } as never);
      db.designVersion.create.mockResolvedValue({
        id: "version-4",
        version: 4,
      } as never);

      await createDesignVersion({
        ownerId: "user-1",
        projectId: "project-1",
        directionId: "exploring-direction-2",
        prompt: "modern",
      });

      expect(db.designDirection.findFirst).toHaveBeenCalledWith({
        where: { id: "exploring-direction-2", projectId: "project-1" },
      });
      expect(db.designVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          directionId: "exploring-direction-2",
        }),
      });
    });

    it("increments the design version and preserves parameters", async () => {
      db.designProject.findFirst.mockResolvedValue({
        id: "project-1",
      } as never);
      db.designDirection.findFirst.mockResolvedValue(null);
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
        data: expect.objectContaining({
          projectId: "project-1",
          version: 4,
          prompt: "modern",
          parameters: { palette: "warm" },
        }),
      });
    });
  });

  describe("createDesignRevision", () => {
    it("rejects a revision whose base version is not owned by the project", async () => {
      db.designProject.findFirst.mockResolvedValue({
        id: "project-1",
      } as never);
      db.designVersion.findFirst.mockResolvedValue(null);

      await expect(
        createDesignRevision({
          ownerId: "user-1",
          projectId: "project-1",
          baseVersionId: "version-1",
          instruction: "make it brighter",
        }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(db.designRevision.create).not.toHaveBeenCalled();
    });
  });
});
