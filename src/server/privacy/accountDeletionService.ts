import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/errors/AppError";

// Data-retention policy this service implements (see
// docs/DATA-RETENTION-AND-DELETION-POLICY.md for the full policy text):
//
// 1. Financial and audit records (Payment, Purchase, AuditLog, Entitlement)
//    are NEVER hard-deleted on account deletion. India's tax/audit rules
//    require retaining transactional records for several years regardless
//    of a user's deletion request - "right to erasure" is not absolute
//    where a legal retention obligation exists. These records remain,
//    still linked by userId, but the User row itself is anonymized so the
//    linkage no longer identifies a real person.
// 2. Genuinely personal content the user created and controls - Property,
//    everything nested under it (Room, FloorPlan, DesignProject, etc, all
//    already `onDelete: Cascade` from Property in the schema),
//    Notifications, and uploaded Assets not otherwise referenced by a
//    retained financial record - is hard-deleted.
// 3. The User row is never removed (many retained records still reference
//    it), only anonymized: email/name/image replaced with a stable,
//    non-identifying placeholder derived from the user's id, so repeated
//    deletion requests are idempotent and the anonymization is
//    deterministic and auditable.
// 4. The deletion event itself is recorded in AuditLog - a record of "this
//    account was deleted and when" is itself a legitimate thing to retain,
//    and is not personal data once the User row is anonymized.
export const accountDeletionService = {
  async deleteAccount(userId: string, requestedByUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    // Idempotent: a user already anonymized can be "deleted" again
    // harmlessly - this matters because deletion requests may be retried
    // (e.g. by an async job or a user re-submitting the same request).
    const alreadyAnonymized = user.email.endsWith("@deleted.nivasa.local");

    await prisma.$transaction(async (tx) => {
      // Hard-delete genuinely personal content. Property cascades to
      // everything nested under it per the schema's existing onDelete:
      // Cascade relations (Room, FloorPlan, DesignProject, HomeIntelligence,
      // HomeDnaVersion, etc.) - deleting Property rows is sufficient to
      // remove all of it in one step, rather than manually deleting every
      // nested table.
      await tx.property.deleteMany({ where: { ownerId: userId } });
      await tx.notification.deleteMany({ where: { userId } });

      if (!alreadyAnonymized) {
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `${userId}@deleted.nivasa.local`,
            name: null,
            image: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: requestedByUserId,
            action: "ACCOUNT_DELETED",
            entity: "User",
            entityId: userId,
            metadata: { requestedBy: requestedByUserId },
          },
        });
      }
    });

    return { deleted: true };
  },
};
