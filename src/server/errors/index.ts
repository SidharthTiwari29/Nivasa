export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status = 400,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotConfiguredError extends AppError {
  constructor(component: string) {
    super(`${component}: NOT_CONFIGURED`, 'NOT_CONFIGURED', 503);
  }
}
