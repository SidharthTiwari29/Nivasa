import type { RenderProvider } from './provider';

export class RenderProviderNotConfiguredError extends Error {
  readonly code = 'NOT_CONFIGURED';
}

export function getRenderProvider(): RenderProvider {
  throw new RenderProviderNotConfiguredError(
    'RENDER_PROVIDER: NOT_CONFIGURED; configure a concrete renderer before creating render jobs',
  );
}
