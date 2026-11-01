/**
 * List all waiters (garçons)
 * POST /api/waiters/list-waiters
 */

import { requireAdmin } from '../../lib/app-session';
import {
  canManage,
  listWaiters,
  tenantSlugForAdmin,
  toPublicWaiter,
} from '../../lib/waiter-store';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ error: 'Forbidden - admin session required' }, 401);
  }

  try {
    const tenant = tenantSlugForAdmin(admin.email);
    const waiters = (await listWaiters(env))
      .filter((record) => canManage(tenant, record))
      .map(toPublicWaiter);

    return json({ waiters });
  } catch (error) {
    console.error('Error in list-waiters:', error);
    return json({ error: 'No se pudo cargar la lista de meseros.' }, 500);
  }
}
