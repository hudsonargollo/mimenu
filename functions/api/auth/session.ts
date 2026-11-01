import { APP_CREDENTIALS } from '../../../shared/app-credentials';
import { createAppSessionToken, SESSION_TTL_SECONDS } from '../../lib/app-session';
import { clientIp, EMAIL_PATTERN, isRateLimited } from '../../lib/rate-limit';
import { findWaiterByEmail, verifyPassword } from '../../lib/waiter-store';

interface Env {
  APP_SESSION_SECRET?: string;
  MIMENU_KV?: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * POST /api/auth/session
 * Exchanges staff credentials for a signed session token. Static staff
 * credentials come from shared/app-credentials.ts; waiters added from the
 * admin panel come from the MIMENU_KV store.
 */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.APP_SESSION_SECRET) {
    return json({ error: 'La sesión de administración no está configurada.' }, 503);
  }

  if (isRateLimited(`session:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return json({ error: 'Demasiados intentos. Esperá unos minutos.' }, 429);
  }

  let body: { identifier?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Credenciales inválidas.' }, 400);
  }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const credential = APP_CREDENTIALS.find(
    (item) => item.identifier === identifier && item.password === password
  );

  if (credential) {
    const token = await createAppSessionToken(
      env.APP_SESSION_SECRET,
      credential.email,
      credential.role
    );

    return json({
      token,
      email: credential.email,
      role: credential.role,
      name: credential.name,
      tenantSlug: credential.tenantSlug,
      venueName: credential.venueName,
      expiresIn: SESSION_TTL_SECONDS,
    });
  }

  if (EMAIL_PATTERN.test(identifier)) {
    try {
      const waiter = await findWaiterByEmail(env, identifier);

      if (waiter && (await verifyPassword(waiter.password_hash, password))) {
        const token = await createAppSessionToken(
          env.APP_SESSION_SECRET,
          waiter.email,
          'waiter'
        );

        return json({
          token,
          email: waiter.email,
          role: 'waiter',
          name: waiter.full_name,
          tenantSlug: waiter.tenant_slug,
          venueName: null,
          expiresIn: SESSION_TTL_SECONDS,
        });
      }
    } catch (error) {
      console.error('Waiter login lookup failed:', error);
    }
  }

  return json({ error: 'Credenciales inválidas.' }, 401);
};
