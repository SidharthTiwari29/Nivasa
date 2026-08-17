import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  OBJECT_STORAGE_PROVIDER: z.enum(['s3', 'gcs', 'azure', 'local']).default('s3'),
  OBJECT_STORAGE_BUCKET: z.string().optional(),
  AI_PROVIDER: z.string().optional(),
  PAYMENT_PROVIDER: z.enum(['disabled', 'razorpay', 'stripe']).default('disabled'),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;
export const parseEnv = (input: NodeJS.ProcessEnv): AppEnv => envSchema.parse(input);
