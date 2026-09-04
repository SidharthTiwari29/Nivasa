import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/server/errors/AppError";
import { prisma } from "@/server/db/prisma";
import { generateProjectPdf } from "./projectPdfService";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    designProject: { findFirst: vi.fn() },
  },
}));

const db = vi.mocked(prisma, { deep: true });

describe("generateProjectPdf", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when the project does not exist or is not owned by the caller", async () => {
    db.designProject.findFirst.mockResolvedValue(null);

    await expect(
      generateProjectPdf("project-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a project with no real, committed Bill of Quantities yet", async () => {
    db.designProject.findFirst.mockResolvedValue({
      id: "project-1",
      name: "Living Room Redesign",
      property: { name: "My Home" },
      room: { name: "Living Room" },
      boqs: [],
    } as never);

    await expect(
      generateProjectPdf("project-1", "user-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("generates a real, non-empty PDF buffer for a project with a real, committed BOQ", async () => {
    db.designProject.findFirst.mockResolvedValue({
      id: "project-1",
      name: "Living Room Redesign",
      property: { name: "My Home" },
      room: { name: "Living Room" },
      boqs: [
        {
          totalMinor: 250_000n,
          lines: [
            {
              description: "Modular Sofa",
              quantity: { toString: () => "1" },
              unit: "piece",
              unitPriceMinor: 250_000n,
              lineTotalMinor: 250_000n,
              catalogueItem: {
                brand: "Godrej Interio",
                prices: [
                  {
                    amountMinor: 250_000n,
                    mrpMinor: 280_000n,
                    warrantyMonths: 24,
                    verifiedAt: new Date("2026-08-01T00:00:00Z"),
                    availability: "IN_STOCK",
                    effectiveFrom: new Date("2026-08-01T00:00:00Z"),
                  },
                ],
              },
            },
          ],
        },
      ],
    } as never);

    const result = await generateProjectPdf("project-1", "user-1");

    // A real PDF's byte stream always begins with the "%PDF-" magic
    // bytes - this confirms pdfkit genuinely produced a real PDF
    // document, not an empty or malformed buffer, without asserting on
    // exact internal formatting, which would be brittle.
    expect(result.length).toBeGreaterThan(0);
    expect(result.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("handles a line with no catalogue item linked, without crashing on the missing merits data", async () => {
    db.designProject.findFirst.mockResolvedValue({
      id: "project-1",
      name: "Living Room Redesign",
      property: { name: "My Home" },
      room: null,
      boqs: [
        {
          totalMinor: 100_000n,
          lines: [
            {
              description: "Custom carpentry work",
              quantity: { toString: () => "1" },
              unit: "job",
              unitPriceMinor: 100_000n,
              lineTotalMinor: 100_000n,
              catalogueItem: null,
            },
          ],
        },
      ],
    } as never);

    const result = await generateProjectPdf("project-1", "user-1");

    expect(result.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
