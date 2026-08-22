import type { ZodType } from "zod";
import { ValidationError } from "@/server/errors/AppError";

export function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.flatten());
  }
  return result.data;
}
