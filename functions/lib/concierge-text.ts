/** Accent-insensitive matching helpers shared by the menu and FAQ tools. */

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const STOP_WORDS = new Set([
  'a', 'al', 'algo', 'como', 'con', 'cual', 'cuando', 'cuanto', 'de', 'del', 'donde',
  'el', 'en', 'es', 'esa', 'ese', 'esta', 'este', 'hay', 'la', 'las', 'lo', 'los',
  'me', 'mi', 'no', 'o', 'para', 'pero', 'por', 'que', 'se', 'si', 'sin', 'son',
  'su', 'sus', 'tienen', 'tiene', 'un', 'una', 'uno', 'y', 'ya', 'puedo', 'puede',
  'the', 'and', 'for', 'you', 'have', 'with', 'what', 'where', 'when',
]);

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

export function matchesAllTokens(haystack: string, tokens: string[]): boolean {
  if (!tokens.length) return true;
  return tokens.every((token) => haystack.includes(token));
}
