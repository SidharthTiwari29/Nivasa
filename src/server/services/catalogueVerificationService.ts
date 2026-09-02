import { NotFoundError } from "@/server/errors/AppError";
import { catalogueVerificationRepository } from "@/server/repositories/catalogueVerificationRepository";

export const catalogueVerificationService = {
  // The real, honest "verified" status: an explicit admin action, not a
  // computed score or a default. This is deliberately an ADMIN-only
  // action (see requireAdmin at the route level) - a genuine "Niwasthan
  // checked this" attestation must come from an accountable person on
  // the team, never a customer, an automated script, or a self-reported
  // claim from a source feed.
  async verifyCurrentPrice(catalogueItemId: string, adminUserId: string) {
    const price =
      await catalogueVerificationRepository.findCurrentPrice(catalogueItemId);
    if (!price) throw new NotFoundError("Current price for this item");

    return catalogueVerificationRepository.verify(price.id, adminUserId);
  },
};
