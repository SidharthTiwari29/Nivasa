import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { enqueueJob } from "./queue";
import { ForbiddenError } from "@/server/errors/AppError";
import { notificationService } from "@/server/services/notificationService";
import {
  reserveCredits,
  confirmReservation,
  releaseReservation,
} from "@/server/services/entitlements";
import { createAndEnqueueJob, transitionJob } from "./jobService";

vi.mock("@/server/services/notificationService", () => ({
  notificationService: { notify: vi.fn() },
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    aIJob: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    designProject: { findUnique: vi.fn() },
    roomUnderstanding: { findFirst: vi.fn() },
    entitlement: { findMany: vi.fn() },
  },
}));

vi.mock("./queue", () => ({ enqueueJob: vi.fn() }));

vi.mock("@/server/services/entitlements", () => ({
  reserveCredits: vi.fn(),
  confirmReservation: vi.fn(),
  releaseReservation: vi.fn(),
}));

const jobs = vi.mocked(prisma.aIJob);
const designProjects = vi.mocked(prisma.designProject);
const roomUnderstandings = vi.mocked(prisma.roomUnderstanding);
const entitlements = vi.mocked(prisma.entitlement);
const notifications = vi.mocked(notificationService);
const enqueue = vi.mocked(enqueueJob);
const reserve = vi.mocked(reserveCredits);
const confirm = vi.mocked(confirmReservation);
const release = vi.mocked(releaseReservation);

describe("jobService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createAndEnqueueJob", () => {
    it("returns an existing idempotent job without reserving credits again or enqueueing another", async () => {
      const existing = { id: "job-1", status: "QUEUED" };
      jobs.findUnique.mockResolvedValue(existing as never);

      await expect(
        createAndEnqueueJob({
          projectId: "project-1",
          ownerId: "user-1",
          type: "DESIGN_GENERATION",
          idempotencyKey: "key-1",
          payload: { prompt: "modern" },
        }),
      ).resolves.toEqual(existing);
      expect(reserve).not.toHaveBeenCalled();
      expect(jobs.create).not.toHaveBeenCalled();
      expect(enqueue).not.toHaveBeenCalled();
    });

    it("reserves credits before creating the job, and stores the reservation id on it", async () => {
      jobs.findUnique.mockResolvedValue(null);
      reserve.mockResolvedValue({ id: "reservation-1" } as never);
      jobs.create.mockResolvedValue({ id: "job-1" } as never);
      enqueue.mockResolvedValue({ id: "queue-job-1" } as never);

      await createAndEnqueueJob({
        projectId: "project-1",
        ownerId: "user-1",
        type: "DESIGN_GENERATION",
        idempotencyKey: "key-1",
        payload: { prompt: "modern" },
      });

      expect(reserve).toHaveBeenCalledWith("user-1", 1, "job:project-1:key-1");
      expect(jobs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            creditReservationId: "reservation-1",
          }),
        }),
      );
    });

    it("propagates INSUFFICIENT_CREDITS without ever creating a job or touching the queue", async () => {
      jobs.findUnique.mockResolvedValue(null);
      reserve.mockRejectedValue(new Error("INSUFFICIENT_CREDITS"));

      await expect(
        createAndEnqueueJob({
          projectId: "project-1",
          ownerId: "user-1",
          type: "DESIGN_GENERATION",
          idempotencyKey: "key-1",
          payload: {},
        }),
      ).rejects.toThrow("INSUFFICIENT_CREDITS");
      expect(jobs.create).not.toHaveBeenCalled();
      expect(enqueue).not.toHaveBeenCalled();
    });

    it("releases the reservation if the job fails to enqueue after being created", async () => {
      jobs.findUnique.mockResolvedValue(null);
      reserve.mockResolvedValue({ id: "reservation-1" } as never);
      jobs.create.mockResolvedValue({ id: "job-1" } as never);
      enqueue.mockRejectedValue(new Error("queue down"));
      jobs.update.mockResolvedValue({} as never);

      await expect(
        createAndEnqueueJob({
          projectId: "project-1",
          ownerId: "user-1",
          type: "DESIGN_GENERATION",
          idempotencyKey: "key-1",
          payload: {},
        }),
      ).rejects.toThrow("queue down");

      expect(release).toHaveBeenCalledWith("reservation-1");
    });

    it("does not compute or pass a priority for a non-visualization job type", async () => {
      jobs.findUnique.mockResolvedValue(null);
      reserve.mockResolvedValue({ id: "reservation-1" } as never);
      jobs.create.mockResolvedValue({ id: "job-1" } as never);
      enqueue.mockResolvedValue({ id: "queue-job-1" } as never);

      await createAndEnqueueJob({
        projectId: "project-1",
        ownerId: "user-1",
        type: "DESIGN_GENERATION",
        idempotencyKey: "key-1",
        payload: {},
      });

      expect(designProjects.findUnique).not.toHaveBeenCalled();
      expect(enqueue).toHaveBeenCalledWith(
        expect.objectContaining({ priority: undefined }),
      );
    });

    it("prioritizes a WALKTHROUGH job for a confirmed, high-confidence room above a job with no room at all", async () => {
      jobs.findUnique.mockResolvedValue(null);
      reserve.mockResolvedValue({ id: "reservation-1" } as never);
      jobs.create.mockResolvedValue({ id: "job-1" } as never);
      enqueue.mockResolvedValue({ id: "queue-job-1" } as never);
      designProjects.findUnique.mockResolvedValue({
        roomId: "room-1",
      } as never);
      roomUnderstandings.findFirst.mockResolvedValue({
        status: "CONFIRMED",
        confidenceBps: 9000,
      } as never);
      entitlements.findMany.mockResolvedValue([
        { package: { code: "NIWASTHAN_IMMERSIVE" } },
      ] as never);

      await createAndEnqueueJob({
        projectId: "project-1",
        ownerId: "user-1",
        type: "WALKTHROUGH",
        idempotencyKey: "key-1",
        payload: {},
      });

      expect(enqueue).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 1 }),
      );
    });

    it("gives the lowest priority to a visualization job whose project has no linked room", async () => {
      jobs.findUnique.mockResolvedValue(null);
      reserve.mockResolvedValue({ id: "reservation-1" } as never);
      jobs.create.mockResolvedValue({ id: "job-1" } as never);
      enqueue.mockResolvedValue({ id: "queue-job-1" } as never);
      designProjects.findUnique.mockResolvedValue({ roomId: null } as never);
      entitlements.findMany.mockResolvedValue([
        { package: { code: "NIWASTHAN_IMMERSIVE" } },
      ] as never);

      await createAndEnqueueJob({
        projectId: "project-1",
        ownerId: "user-1",
        type: "PANORAMA",
        idempotencyKey: "key-1",
        payload: {},
      });

      expect(roomUnderstandings.findFirst).not.toHaveBeenCalled();
      expect(enqueue).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 10 }),
      );
    });
  });

  describe("transitionJob", () => {
    it("does not mutate a terminal job, and does not touch credits again", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "SUCCEEDED",
        creditReservationId: "reservation-1",
      } as never);

      await expect(
        transitionJob({ jobId: "job-1", status: "FAILED" }),
      ).resolves.toEqual({
        id: "job-1",
        status: "SUCCEEDED",
        creditReservationId: "reservation-1",
      });
      expect(jobs.update).not.toHaveBeenCalled();
      expect(confirm).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it("confirms the reservation when a job succeeds", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "RUNNING",
        creditReservationId: "reservation-1",
      } as never);
      jobs.update.mockResolvedValue({
        id: "job-1",
        status: "SUCCEEDED",
      } as never);

      await transitionJob({ jobId: "job-1", status: "SUCCEEDED" });

      expect(confirm).toHaveBeenCalledWith("reservation-1");
      expect(release).not.toHaveBeenCalled();
    });

    it("releases the reservation when a job fails", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "RUNNING",
        creditReservationId: "reservation-1",
      } as never);
      jobs.update.mockResolvedValue({ id: "job-1", status: "FAILED" } as never);

      await transitionJob({ jobId: "job-1", status: "FAILED" });

      expect(release).toHaveBeenCalledWith("reservation-1");
      expect(confirm).not.toHaveBeenCalled();
    });

    it("does not touch credits for a non-terminal transition (RUNNING)", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "QUEUED",
        creditReservationId: "reservation-1",
      } as never);
      jobs.update.mockResolvedValue({
        id: "job-1",
        status: "RUNNING",
      } as never);

      await transitionJob({ jobId: "job-1", status: "RUNNING" });

      expect(confirm).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it("does not attempt to confirm/release when the job has no reservation linked", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "RUNNING",
        creditReservationId: null,
      } as never);
      jobs.update.mockResolvedValue({
        id: "job-1",
        status: "SUCCEEDED",
      } as never);

      await transitionJob({ jobId: "job-1", status: "SUCCEEDED" });

      expect(confirm).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it("fires a WALKTHROUGH_READY Niwasthan Moment when a WALKTHROUGH job succeeds", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "RUNNING",
        creditReservationId: null,
        type: "WALKTHROUGH",
        projectId: "project-1",
      } as never);
      jobs.update.mockResolvedValue({
        id: "job-1",
        status: "SUCCEEDED",
      } as never);
      designProjects.findUnique.mockResolvedValue({
        ownerId: "user-1",
      } as never);

      await transitionJob({ jobId: "job-1", status: "SUCCEEDED" });

      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          type: "WALKTHROUGH_READY",
          message: "Your future home is ready. Shall we go inside?",
        }),
      );
    });

    it("does not fire a walkthrough moment for a non-WALKTHROUGH job succeeding", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "RUNNING",
        creditReservationId: null,
        type: "DESIGN_GENERATION",
        projectId: "project-1",
      } as never);
      jobs.update.mockResolvedValue({
        id: "job-1",
        status: "SUCCEEDED",
      } as never);

      await transitionJob({ jobId: "job-1", status: "SUCCEEDED" });

      expect(designProjects.findUnique).not.toHaveBeenCalled();
      expect(notifications.notify).not.toHaveBeenCalled();
    });

    it("does not fire a walkthrough moment when a WALKTHROUGH job fails rather than succeeds", async () => {
      jobs.findUniqueOrThrow.mockResolvedValue({
        id: "job-1",
        status: "RUNNING",
        creditReservationId: null,
        type: "WALKTHROUGH",
        projectId: "project-1",
      } as never);
      jobs.update.mockResolvedValue({
        id: "job-1",
        status: "FAILED",
      } as never);

      await transitionJob({ jobId: "job-1", status: "FAILED" });

      expect(notifications.notify).not.toHaveBeenCalled();
    });
  });

  describe("plan-gated visualization types", () => {
    it("rejects a WALKTHROUGH job for a user whose plan does not include it, before reserving credits or creating a job", async () => {
      jobs.findUnique.mockResolvedValue(null);
      entitlements.findMany.mockResolvedValue([
        { package: { code: "FREE" } },
      ] as never);

      await expect(
        createAndEnqueueJob({
          projectId: "project-1",
          ownerId: "user-1",
          type: "WALKTHROUGH",
          idempotencyKey: "key-1",
          payload: {},
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);
      expect(reserve).not.toHaveBeenCalled();
      expect(jobs.create).not.toHaveBeenCalled();
    });

    it("allows a WALKTHROUGH job for a user on the Pro plan", async () => {
      jobs.findUnique.mockResolvedValue(null);
      entitlements.findMany.mockResolvedValue([
        { package: { code: "NIWASTHAN_IMMERSIVE" } },
      ] as never);
      reserve.mockResolvedValue({ id: "reservation-1" } as never);
      jobs.create.mockResolvedValue({ id: "job-1" } as never);
      enqueue.mockResolvedValue({ id: "queue-job-1" } as never);

      await expect(
        createAndEnqueueJob({
          projectId: "project-1",
          ownerId: "user-1",
          type: "WALKTHROUGH",
          idempotencyKey: "key-1",
          payload: {},
        }),
      ).resolves.toEqual({ id: "job-1" });
    });

    it("does not check plan entitlements at all for a non-visualization job type (DESIGN_GENERATION)", async () => {
      jobs.findUnique.mockResolvedValue(null);
      reserve.mockResolvedValue({ id: "reservation-1" } as never);
      jobs.create.mockResolvedValue({ id: "job-1" } as never);
      enqueue.mockResolvedValue({ id: "queue-job-1" } as never);

      await createAndEnqueueJob({
        projectId: "project-1",
        ownerId: "user-1",
        type: "DESIGN_GENERATION",
        idempotencyKey: "key-1",
        payload: {},
      });

      expect(entitlements.findMany).not.toHaveBeenCalled();
    });

    it("gates PANORAMA the same way for a plan that lacks it", async () => {
      jobs.findUnique.mockResolvedValue(null);
      entitlements.findMany.mockResolvedValue([
        { package: { code: "FREE" } },
      ] as never);

      await expect(
        createAndEnqueueJob({
          projectId: "project-1",
          ownerId: "user-1",
          type: "PANORAMA",
          idempotencyKey: "key-1",
          payload: {},
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });
  });
});
