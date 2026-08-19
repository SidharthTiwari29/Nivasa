export type ApiSuccess<T> = { ok: true; data: T; requestId?: string };
export type ApiFailure = { ok: false; error: { code: string; message: string; details?: unknown }; requestId?: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const ok = <T>(data: T, init?: ResponseInit) => Response.json({ ok: true, data } satisfies ApiSuccess<T>, init);
export const fail = (code: string, message: string, status = 400, details?: unknown) =>
  Response.json({ ok: false, error: { code, message, details } } satisfies ApiFailure, { status });
