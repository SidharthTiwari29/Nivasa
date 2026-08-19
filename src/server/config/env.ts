import { z } from 'zod';

const optionalUrl = z.string().url().optional();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: optionalUrl,
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  EMAIL_SERVER: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),
  REDIS_URL: optionalUrl,
  OBJECT_STORAGE_PROVIDER: z.enum(['s3', 'r2']).default('s3'),
  S3_ENDPOINT: optionalUrl,
  S3_REGION: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AI_PROVIDER: z.string().min(1).optional(),
  PAYMENT_PROVIDER: z.enum(['disabled', 'razorpay', 'stripe']).default('disabled'),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export class ConfigurationError extends Error {
  readonly code = 'NOT_CONFIGURED';
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export const parseEnv = (input: NodeJS.ProcessEnv = process.env): AppEnv => {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    throw new ConfigurationError(`INVALID_ENVIRONMENT: ${result.error.message}`);
  }
  return result.data;
};

export function requireConfigured(value: string | undefined, name: string): string {
  if (!value) throw new ConfigurationError(`${name}: NOT_CONFIGURED`);
  return value;
}
