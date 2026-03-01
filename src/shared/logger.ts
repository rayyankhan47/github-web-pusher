import { APP_NAME } from "./constants";

export type LogLevel = "debug" | "info" | "warn" | "error";

const levelToMethod: Record<LogLevel, "debug" | "info" | "warn" | "error"> = {
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error"
};

function formatPrefix(scope?: string): string {
  return scope ? `[${APP_NAME}][${scope}]` : `[${APP_NAME}]`;
}

export function log(level: LogLevel, message: string, scope?: string, meta?: unknown): void {
  const method = levelToMethod[level];
  const prefix = formatPrefix(scope);

  if (meta === undefined) {
    console[method](`${prefix} ${message}`);
    return;
  }

  console[method](`${prefix} ${message}`, meta);
}
