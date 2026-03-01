export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function hasKey<T extends string>(
  value: unknown,
  key: T
): value is Record<T, unknown> & Record<string, unknown> {
  return isObject(value) && key in value;
}
