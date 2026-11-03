/**
 * Tenant tokens for Dograh's HTTP tools.
 *
 * Each venue gets a long-lived HMAC token (minted server-side and stored in a
 * Dograh credential). Tool endpoints derive the tenant from the token, so a
 * model calling `get_menu` can never read another restaurant's data, even if
 * it sends a different `venue` value.
 */

import type { ConciergeToolClaims, ConciergeToolScope } from '../../shared/dograh/types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const TOKEN_PREFIX = 'c1';
export const TOOL_TOKEN_TTL_DAYS = 365;
export const TOOL_SCOPES: ConciergeToolScope[] = ['menu', 'venue', 'faq', 'reservation'];

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sign(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

export interface CreateToolTokenOptions {
  venueId: string;
  venueSlug: string;
  scope?: ConciergeToolScope[];
  ttlDays?: number;
}

export async function createConciergeToolToken(
  secret: string,
  options: CreateToolTokenOptions
): Promise<string> {
  const ttlDays = Math.min(730, Math.max(1, options.ttlDays ?? TOOL_TOKEN_TTL_DAYS));
  const claims: ConciergeToolClaims = {
    v: 1,
    slug: options.venueSlug,
    vid: options.venueId,
    scope: options.scope?.length ? options.scope : TOOL_SCOPES,
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const signature = base64UrlEncode(await sign(secret, `${TOKEN_PREFIX}.${payload}`));
  return `${TOKEN_PREFIX}.${payload}.${signature}`;
}

export async function verifyConciergeToolToken(
  secret: string,
  token: string
): Promise<ConciergeToolClaims | null> {
  const [prefix, payload, signature] = token.split('.');
  if (prefix !== TOKEN_PREFIX || !payload || !signature) return null;

  const expected = await sign(secret, `${TOKEN_PREFIX}.${payload}`);
  let provided: Uint8Array;
  try {
    provided = base64UrlDecode(signature);
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected[index] ^ provided[index];
  }
  if (diff !== 0) return null;

  try {
    const claims = JSON.parse(decoder.decode(base64UrlDecode(payload))) as ConciergeToolClaims;
    if (claims?.v !== 1 || !claims.slug || !claims.vid) return null;
    if (!Array.isArray(claims.scope) || !claims.scope.length) return null;
    if (!Number.isFinite(claims.exp) || claims.exp < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}
