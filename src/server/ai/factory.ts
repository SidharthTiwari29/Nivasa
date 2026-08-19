import type { AIProvider } from './provider';

export class AIProviderNotConfiguredError extends Error {
  readonly code = 'NOT_CONFIGURED';
}

export function getAIProvider(): AIProvider {
  throw new AIProviderNotConfiguredError(
    'AI_PROVIDER: NOT_CONFIGURED; configure a concrete provider adapter before submitting AI work',
  );
}
