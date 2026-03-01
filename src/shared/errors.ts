/**
 * Normalized error for use across extension boundaries (content/background/UI).
 */
export class AppError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown> | undefined;

  constructor(message: string, code = "APP_ERROR", context?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
  }
}

export function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === "string") {
    return new Error(value);
  }

  return new Error("Unknown error");
}

export function errorMessage(value: unknown, fallback = "Unexpected error"): string {
  const err = toError(value);
  return err.message || fallback;
}
