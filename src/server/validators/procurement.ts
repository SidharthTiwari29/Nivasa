import { z } from "zod";

export const propertyIdParamSchema = z.object({ id: z.string().cuid() });

export const createProcurementRequestSchema = z.object({
  budgetPlanId: z.string().uuid(),
  lockedBudgetVersion: z.number().int().positive(),
  idempotencyKey: z.string().trim().min(1).max(200),
});
export type CreateProcurementRequestInput = z.infer<
  typeof createProcurementRequestSchema
>;

export const procurementRequestIdParamSchema = z.object({
  procurementRequestId: z.string().cuid(),
});

const minorUnitAmount = z.number().int().nonnegative();

export const submitQuoteSchema = z.object({
  supplierName: z.string().trim().min(1).max(200),
  totalAmountMinor: minorUnitAmount,
  currency: z.string().trim().length(3).default("INR"),
  validUntil: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type SubmitQuoteInput = z.infer<typeof submitQuoteSchema>;

export const quoteIdParamSchema = z.object({
  procurementRequestId: z.string().cuid(),
  quoteId: z.string().cuid(),
});

export const orderIdParamSchema = z.object({
  orderId: z.string().cuid(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"]),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const scheduleExecutionSchema = z.object({
  scheduledDate: z.coerce.date(),
});
export type ScheduleExecutionInput = z.infer<typeof scheduleExecutionSchema>;

export const updateExecutionStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED", "SNAGGED", "RESOLVED"]),
  snagNotes: z.string().trim().max(2000).optional(),
});
export type UpdateExecutionStatusInput = z.infer<
  typeof updateExecutionStatusSchema
>;

export const executionIdParamSchema = z.object({
  executionId: z.string().cuid(),
});
