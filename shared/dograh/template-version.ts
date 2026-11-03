/**
 * Template identity and deterministic config hashing.
 *
 * Bump `TEMPLATE_VERSION` whenever the prompt structure, tool schemas or
 * workflow shape change. The sync script compares `configHash` to decide
 * whether a Dograh workflow needs a new draft + publish, so the hash must be
 * stable across processes (no timestamps, no `updatedAt`).
 */

export const TEMPLATE_VERSION = '2026-11-03.1';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item === undefined ? null : item)).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

function fnv1a(input: string, seed: number): number {
  let hash = seed;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** 16-hex-char content hash; good enough for drift detection, not security. */
export function stableHash(value: unknown): string {
  const input = stableStringify(value);
  return (
    fnv1a(input, 0x811c9dc5).toString(16).padStart(8, '0') +
    fnv1a(input, 0x01000193).toString(16).padStart(8, '0')
  );
}
