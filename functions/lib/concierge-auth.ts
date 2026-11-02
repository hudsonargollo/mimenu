import { APP_CREDENTIALS } from '../../shared/app-credentials';
import { verifyAppSessionToken } from './app-session';

interface AuthEnv {
  APP_SESSION_SECRET?: string;
}

export interface ConciergeAdmin {
  email: string;
  /** null means the superadmin, who can review every venue. */
  tenantSlug: string | null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** Verifies the admin session and returns the venues the caller may review. */
export async function requireConciergeAdmin(
  request: Request,
  env: AuthEnv
): Promise<ConciergeAdmin | Response> {
  if (!env.APP_SESSION_SECRET) {
    return json({ error: 'La sesión de administración no está configurada.' }, 503);
  }

  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return json({ error: 'Se requiere sesión de administración.' }, 401);

  const claims = await verifyAppSessionToken(env.APP_SESSION_SECRET, token);
  if (!claims) return json({ error: 'Sesión inválida o expirada.' }, 401);
  if (claims.role !== 'admin') return json({ error: 'Tu cuenta no es administradora.' }, 403);

  const credential = APP_CREDENTIALS.find((item) => item.email === claims.email);
  const tenantSlug = credential?.tenantSlug ?? null;

  return { email: claims.email, tenantSlug };
}

export function canReviewVenue(admin: ConciergeAdmin, venueId: string): boolean {
  if (admin.tenantSlug === null) return true;
  // Turns are logged against the registry id (`venue-jaleo`), credentials use the slug.
  const slug = venueId.toLowerCase().replace(/^venue-/, '');
  return admin.tenantSlug === venueId || admin.tenantSlug === slug;
}

export { json };
