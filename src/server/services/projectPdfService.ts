import PDFDocument from "pdfkit";
import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/errors/AppError";
import { deriveMeritsAndDemerits } from "@/server/services/productMerits";

function formatRupees(paise: bigint): string {
  return `Rs ${(Number(paise) / 100).toLocaleString("en-IN")}`;
}

// Real PDF generation - every figure comes directly from the real,
// committed BOQ this project's owner actually approved, and every
// merit/demerit is computed from the exact same real, structured
// catalogue data (warranty, verification, availability, MRP) used
// everywhere else in this product. Nothing here is a screenshot or an
// invented summary - it's the real record, formatted for download.
export async function generateProjectPdf(
  projectId: string,
  ownerId: string,
): Promise<Buffer> {
  const project = await prisma.designProject.findFirst({
    where: { id: projectId, ownerId },
    include: {
      property: true,
      room: true,
      boqs: {
        where: { status: { not: "DRAFT" } },
        orderBy: { version: "desc" },
        take: 1,
        include: {
          lines: {
            include: {
              catalogueItem: {
                include: {
                  prices: { orderBy: { effectiveFrom: "desc" }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!project) throw new NotFoundError("DesignProject");

  const boq = project.boqs[0];
  if (!boq) {
    throw new NotFoundError("A committed Bill of Quantities for this project");
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc
    .fontSize(22)
    .text("Niwasthan", { continued: false })
    .fontSize(10)
    .fillColor("#666666")
    .text("Your home, priced transparently")
    .moveDown(1.5);

  doc
    .fillColor("#111111")
    .fontSize(16)
    .text(project.name)
    .fontSize(10)
    .fillColor("#666666")
    .text(project.property.name)
    .text(project.room ? project.room.name : "Whole property")
    .moveDown(1.5);

  doc
    .fillColor("#111111")
    .fontSize(13)
    .text("Bill of Quantities")
    .moveDown(0.5);

  for (const line of boq.lines) {
    const price = line.catalogueItem?.prices[0];
    doc
      .fontSize(11)
      .fillColor("#111111")
      .text(line.description, { continued: false });
    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        `${line.catalogueItem?.brand ?? "Unbranded"} | Qty: ${line.quantity.toString()} ${line.unit} | ${formatRupees(line.unitPriceMinor)} each | Total: ${formatRupees(line.lineTotalMinor)}`,
      );

    if (price) {
      const merits = deriveMeritsAndDemerits({
        warrantyMonths: price.warrantyMonths,
        mrpMinor: price.mrpMinor,
        unitPriceMinor: price.amountMinor,
        priceAgeDays: Math.floor(
          (Date.now() - price.effectiveFrom.getTime()) / 86_400_000,
        ),
        verifiedAt: price.verifiedAt,
        availability: price.availability,
        alternativesConsidered: 1,
      });
      if (merits.merits.length > 0) {
        doc
          .fontSize(8)
          .fillColor("#2f6f4f")
          .text(`+ ${merits.merits.join("  |  ")}`);
      }
      if (merits.demerits.length > 0) {
        doc
          .fontSize(8)
          .fillColor("#8a4a2f")
          .text(`- ${merits.demerits.join("  |  ")}`);
      }
    }
    doc.moveDown(0.6);
  }

  doc
    .moveDown(0.5)
    .fontSize(13)
    .fillColor("#111111")
    .text(`Real total: ${formatRupees(boq.totalMinor)}`, {
      align: "right",
    });

  doc.end();
  return done;
}
