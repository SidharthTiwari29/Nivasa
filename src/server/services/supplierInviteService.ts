import { ConflictError, NotFoundError } from "@/server/errors/AppError";
import { supplierInviteRepository } from "@/server/repositories/supplierInviteRepository";
import { notificationService } from "@/server/services/notificationService";
import {
  generateSupplierToken,
  hashSupplierToken,
} from "@/server/services/supplierToken";

const INVITE_VALIDITY_DAYS = 14;

export const supplierInviteService = {
  // Returns the raw token exactly once, here, at creation time - it is
  // never retrievable again afterward, since only its hash is persisted.
  // The caller is responsible for delivering this to the actual supplier
  // (email, SMS, etc.) immediately.
  async createInvite(
    procurementRequestId: string,
    ownerId: string,
    supplierName: string,
  ) {
    const request =
      await supplierInviteRepository.findProcurementRequestForOwner(
        procurementRequestId,
        ownerId,
      );
    if (!request) throw new NotFoundError("ProcurementRequest");

    const token = generateSupplierToken();
    const expiresAt = new Date(
      Date.now() + INVITE_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
    );

    const invite = await supplierInviteRepository.create(
      procurementRequestId,
      supplierName,
      hashSupplierToken(token),
      expiresAt,
      ownerId,
    );

    return { inviteId: invite.id, token, expiresAt };
  },

  // The public, token-authenticated read - deliberately returns only the
  // minimum a supplier needs to prepare a quote (property name/address,
  // not the owner's identity, not their budget numbers, not any other
  // procurement request on the account). Never trusts the token's mere
  // presence: expiry and used-state are checked explicitly every time,
  // not assumed from the fact that the hash matched.
  async getInviteContext(token: string) {
    const invite = await supplierInviteRepository.findByTokenHash(
      hashSupplierToken(token),
    );
    if (!invite) throw new NotFoundError("Supplier invite");
    if (invite.usedAt) {
      throw new ConflictError("This invite has already been used");
    }
    if (invite.expiresAt < new Date()) {
      throw new ConflictError("This invite has expired");
    }

    return {
      supplierName: invite.supplierName,
      propertyName: invite.procurementRequest.property.name,
      propertyAddress: invite.procurementRequest.property.address,
    };
  },

  async submitQuoteViaInvite(
    token: string,
    totalAmountMinor: bigint,
    notes: string | undefined,
  ) {
    const invite = await supplierInviteRepository.findByTokenHash(
      hashSupplierToken(token),
    );
    if (!invite) throw new NotFoundError("Supplier invite");
    if (invite.usedAt) {
      throw new ConflictError("This invite has already been used");
    }
    if (invite.expiresAt < new Date()) {
      throw new ConflictError("This invite has expired");
    }

    const quote = await supplierInviteRepository.markUsedAndSubmitQuote(
      invite.id,
      invite.supplierName,
      totalAmountMinor,
      notes,
      invite.procurementRequestId,
    );
    if (!quote) {
      // The pre-checks above passed, but the conditional update inside
      // the transaction found usedAt was no longer null - a concurrent
      // request already consumed this exact token in the gap between the
      // check and the write.
      throw new ConflictError("This invite has already been used");
    }

    await notificationService.notify({
      userId: invite.createdByUserId,
      type: "QUOTE_RECEIVED",
      title: "New quote received",
      message: `${invite.supplierName} submitted a quote via your invite link`,
      relatedEntityType: "ProcurementRequest",
      relatedEntityId: invite.procurementRequestId,
    });

    return quote;
  },
};
