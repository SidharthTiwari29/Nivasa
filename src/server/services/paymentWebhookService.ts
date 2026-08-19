import { prisma } from '@/server/db/prisma';
import type { VerifiedWebhook } from '@/server/payments/provider';

export async function processVerifiedPaymentWebhook(event: VerifiedWebhook) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.paymentEvent.findUnique({
      where: { provider_eventId: { provider: event.provider, eventId: event.eventId } },
    });
    if (existing) return { duplicate: true, paymentEventId: existing.id };

    const payload = event.payload as Record<string, unknown>;
    const paymentEntity = (
      (payload.payload as Record<string, unknown> | undefined)?.payment as Record<string, unknown> | undefined
    )?.entity as Record<string, unknown> | undefined;
    const providerOrderId = typeof paymentEntity?.order_id === 'string' ? paymentEntity.order_id : undefined;

    const payment = providerOrderId
      ? await tx.payment.findFirst({ where: { provider: event.provider, providerOrderId } })
      : null;

    const paymentEvent = await tx.paymentEvent.create({
      data: {
        paymentId: payment?.id,
        provider: event.provider,
        eventId: event.eventId,
        eventType: event.eventType,
        payload: event.payload as object,
        processedAt: new Date(),
      },
    });

    if (payment && event.eventType === 'payment.captured') {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'CAPTURED' } });
      await tx.purchase.update({ where: { id: payment.purchaseId }, data: { status: 'ACTIVE', startsAt: new Date() } });
    }

    if (payment && event.eventType === 'payment.failed') {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
      await tx.purchase.update({ where: { id: payment.purchaseId }, data: { status: 'PAYMENT_PENDING' } });
    }

    return { duplicate: false, paymentEventId: paymentEvent.id };
  });
}
