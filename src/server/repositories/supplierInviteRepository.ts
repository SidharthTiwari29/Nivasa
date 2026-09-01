import { prisma } from "@/server/db/prisma";

export const supplierInviteRepository = {
  // Owner-facing: creating an invite requires proving ownership of the
  // procurement request first, same as every other write in this system.
  findProcurementRequestForOwner(
    procurementRequestId: string,
    ownerId: string,
  ) {
    return prisma.procurementRequest.findFirst({
      where: { id: procurementRequestId, ownerId },
    });
  },

  create(
    procurementRequestId: string,
    supplierName: string,
    tokenHash: string,
    expiresAt: Date,
    createdByUserId: string,
  ) {
    return prisma.supplierInvite.create({
      data: {
        procurementRequestId,
        supplierName,
        tokenHash,
        expiresAt,
        createdByUserId,
      },
    });
  },

  // Public-facing lookup: the ONLY thing that grants access here is
  // knowledge of the exact token hash - there is no owner/session concept
  // on this path at all, by design, since the caller is an external
  // supplier with no platform account.
  findByTokenHash(tokenHash: string) {
    return prisma.supplierInvite.findUnique({
      where: { tokenHash },
      include: {
        procurementRequest: {
          include: { property: { select: { name: true, address: true } } },
        },
      },
    });
  },

  // Marking an invite used and creating its quote happen in one
  // transaction, conditioned on usedAt still being null - the same
  // conditional-update-not-read-then-write pattern used for quote
  // acceptance, so a token can never be used twice even if two requests
  // race using the same link.
  async markUsedAndSubmitQuote(
    inviteId: string,
    supplierName: string,
    totalAmountMinor: bigint,
    notes: string | undefined,
    procurementRequestId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.supplierInvite.updateMany({
        where: { id: inviteId, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (updated.count === 0) return null;

      const quote = await tx.quote.create({
        data: { procurementRequestId, supplierName, totalAmountMinor, notes },
      });

      await tx.supplierInvite.update({
        where: { id: inviteId },
        data: { quoteId: quote.id },
      });

      return quote;
    });
  },
};
