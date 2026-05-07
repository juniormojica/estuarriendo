export function safeParseDraft<T extends object>(raw: string | null, fallback: T | null): T | null {
  if (!raw) return fallback;

  try {
    const parsed: unknown = JSON.parse(raw);
    const isValidObject = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

    if (!isValidObject) return fallback;

    return parsed as T;
  } catch {
    return fallback;
  }
}
