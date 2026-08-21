import { Prisma, ReservationStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

function assertPositiveCredits(credits: number) {
  if (!Number.isInteger(credits) || credits <= 0) {
    throw new Error("INVALID_CREDITS");
  }
}

/**
 * Holds credits against an active entitlement. The idempotency key identifies the
 * reservation itself, so retries return the original reservation without changing
 * the entitlement balance a second time.
 */
export async function reserveCredits(
  userId: string,
  credits: number,
  idempotencyKey: string,
) {
  assertPositiveCredits(credits);

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.creditReservation.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return existing;

      const entitlements = await tx.entitlement.findMany({
        where: { userId, status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      });
      const entitlement = entitlements.find(
        (candidate) =>
          candidate.creditsTotal -
            candidate.creditsReserved -
            candidate.creditsConsumed >=
          credits,
      );
      if (!entitlement) throw new Error("INSUFFICIENT_CREDITS");

      // Include the observed balances in the predicate: only one concurrent hold
      // can consume this exact snapshot.
      const updated = await tx.entitlement.updateMany({
        where: {
          id: entitlement.id,
          status: "ACTIVE",
          creditsReserved: entitlement.creditsReserved,
          creditsConsumed: entitlement.creditsConsumed,
        },
        data: { creditsReserved: { increment: credits } },
      });
      if (updated.count !== 1)
        throw new Error("CONCURRENT_RESERVATION_CONFLICT");

      return tx.creditReservation.create({
        data: { entitlementId: entitlement.id, credits, idempotencyKey },
      });
    });
  } catch (error) {
    // A concurrent retry can lose the unique-key race after its transaction has
    // made the same decision. Return the reservation that won that race.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.creditReservation.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return existing;
    }
    throw error;
  }
}

export async function confirmReservation(reservationId: string) {
  return transitionReservation(
    reservationId,
    "CONFIRMED",
    "CREDIT_RESERVATION_CONFIRMED",
  );
}

export async function releaseReservation(reservationId: string) {
  return transitionReservation(
    reservationId,
    "RELEASED",
    "CREDIT_RESERVATION_RELEASED",
  );
}

async function transitionReservation(
  reservationId: string,
  status: ReservationStatus,
  action: string,
) {
  return prisma.$transaction(async (tx) => {
    const transition = await tx.creditReservation.updateMany({
      where: { id: reservationId, status: "RESERVED" },
      data: { status },
    });

    if (transition.count === 0) {
      const existing = await tx.creditReservation.findUniqueOrThrow({
        where: { id: reservationId },
      });
      // A completed transition is idempotent; attempting the opposite transition
      // exposes a caller bug instead of silently changing already-final credits.
      if (existing.status === status) return existing;
      throw new Error("RESERVATION_ALREADY_FINALIZED");
    }

    const reservation = await tx.creditReservation.findUniqueOrThrow({
      where: { id: reservationId },
    });
    const entitlementUpdate =
      status === "CONFIRMED"
        ? {
            creditsReserved: { decrement: reservation.credits },
            creditsConsumed: { increment: reservation.credits },
          }
        : { creditsReserved: { decrement: reservation.credits } };

    const entitlement = await tx.entitlement.updateMany({
      where: {
        id: reservation.entitlementId,
        creditsReserved: { gte: reservation.credits },
      },
      data: entitlementUpdate,
    });
    if (entitlement.count !== 1) throw new Error("INVALID_RESERVATION");

    await tx.auditLog.create({
      data: {
        userId: (
          await tx.entitlement.findUniqueOrThrow({
            where: { id: reservation.entitlementId },
          })
        ).userId,
        action,
        entity: "CreditReservation",
        entityId: reservation.id,
        metadata: { credits: reservation.credits, status },
      },
    });

    return reservation;
  });
}
