/**
 * Guard for the HTTP tools Dograh calls. Tenant identity comes from the
 * signed token, never from the request body or query string.
 */

import type { ConciergeToolClaims, ConciergeToolScope, VenueSnapshot } from '../../shared/dograh/types';
import { verifyConciergeToolToken } from './concierge-tool-token';
import { findVenueSnapshot } from './venue-registry';

export interface ToolAuthEnv {
  CONCIERGE_TOOL_SECRET?: string;
}

export interface ToolAuth {
  claims: ConciergeToolClaims;
  venue: VenueSnapshot;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function requireConciergeTool(
  request: Request,
  env: ToolAuthEnv,
  scope: ConciergeToolScope
): Promise<ToolAuth | Response> {
  if (!env.CONCIERGE_TOOL_SECRET) {
    return json({ error: 'La autenticación del concierge no está configurada.' }, 503);
  }

  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return json({ error: 'Token del concierge requerido.' }, 401);

  const claims = await verifyConciergeToolToken(env.CONCIERGE_TOOL_SECRET, token);
  if (!claims) return json({ error: 'Token del concierge inválido o expirado.' }, 401);
  if (!claims.scope.includes(scope)) return json({ error: 'El token no permite esta acción.' }, 403);

  const venue = findVenueSnapshot(claims.slug);
  if (!venue || !venue.isActive) return json({ error: 'Sede no disponible.' }, 401);
  if (venue.id !== claims.vid) return json({ error: 'Token de otra sede.' }, 401);

  return { claims, venue };
}

export function toolTokenFingerprint(claims: ConciergeToolClaims): string {
  return `${claims.slug}:${claims.vid}`;
}

export { json };
