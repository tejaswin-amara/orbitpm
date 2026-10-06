export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function parseJson<T>(value: unknown): T {
  return value as T;
}
