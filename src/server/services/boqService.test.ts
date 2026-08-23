import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { createBoq } from "./boqService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    designProject: { findFirst: vi.fn() },
    boq: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("./costing", () => ({
  calculateCost: vi.fn().mockReturnValue({
    subtotalMinor: 1000n,
    wastageMinor: 0n,
    taxMinor: 0n,
    discountMinor: 0n,
    totalMinor: 1000n,
  }),
}));

const db = vi.mocked(prisma);

describe("boqService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects BOQ creation for an unowned project", async () => {
    db.designProject.findFirst.mockResolvedValue(null);

    await expect(
      createBoq({
        ownerId: "user-1",
        projectId: "project-1",
        lines: [
          {
            description: "Chair",
            quantity: 1n,
            unit: "each",
            unitPriceMinor: 1000n,
          },
        ],
      }),
    ).rejects.toThrow("PROJECT_NOT_FOUND");
    expect(db.boq.create).not.toHaveBeenCalled();
  });

  it("creates the next BOQ version with a JSON-safe snapshot", async () => {
    db.designProject.findFirst.mockResolvedValue({ id: "project-1" } as never);
    db.boq.findFirst.mockResolvedValue({ version: 2 } as never);
    db.boq.create.mockResolvedValue({ id: "boq-3", version: 3 } as never);

    const lines = [
      {
        description: "Chair",
        quantity: 2n,
        unit: "each",
        unitPriceMinor: 500n,
      },
    ];
    await expect(
      createBoq({ ownerId: "user-1", projectId: "project-1", lines }),
    ).resolves.toEqual({ id: "boq-3", version: 3 });

    expect(db.boq.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "project-1",
          version: 3,
          snapshot: [
            expect.objectContaining({
              description: "Chair",
              quantity: "2",
              unitPriceMinor: "500",
            }),
          ],
        }),
        include: { lines: true },
      }),
    );
  });
});
