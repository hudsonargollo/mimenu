import type { AppRole } from '../../shared/app-credentials';

interface AuthEnv {
  APP_SESSION_SECRET?: string;
}

export interface AppSessionClaims {
  email: string;
  role: AppRole;
  exp: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const TOKEN_PREFIX = 'v1';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

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

export async function createAppSessionToken(
  secret: string,
  email: string,
  role: AppRole
): Promise<string> {
  const payload = base64UrlEncode(
    encoder.encode(
      JSON.stringify({ email, role, exp: Date.now() + SESSION_TTL_SECONDS * 1000 })
    )
  );
  const signature = base64UrlEncode(await sign(secret, `${TOKEN_PREFIX}.${payload}`));
  return `${TOKEN_PREFIX}.${payload}.${signature}`;
}

export async function verifyAppSessionToken(
  secret: string,
  token: string
): Promise<AppSessionClaims | null> {
  const [prefix, payload, signature] = token.split('.');
  if (prefix !== TOKEN_PREFIX || !payload || !signature) return null;

  const expected = await sign(secret, `${TOKEN_PREFIX}.${payload}`);
  const provided = base64UrlDecode(signature);
  if (provided.length !== expected.length) return null;

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected[index] ^ provided[index];
  }
  if (diff !== 0) return null;

  try {
    const claims = JSON.parse(decoder.decode(base64UrlDecode(payload))) as AppSessionClaims;
    if (!claims?.exp || claims.exp < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

/**
 * Accepts the app's signed session token (minted via /api/auth/session) and
 * requires the admin role.
 */
export async function requireAdmin(
  request: Request,
  env: AuthEnv
): Promise<{ email: string } | null> {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice(7);
  if (!env.APP_SESSION_SECRET) return null;

  const claims = await verifyAppSessionToken(env.APP_SESSION_SECRET, token);
  return claims?.role === 'admin' ? { email: claims.email } : null;
}
