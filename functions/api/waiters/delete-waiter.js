/**
 * Delete a waiter (garçom)
 * POST /api/waiters/delete-waiter
 */

import { requireAdmin } from '../../lib/app-session';
import { canManage, deleteWaiter, getWaiter, tenantSlugForAdmin } from '../../lib/waiter-store';

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
    const body = await request.json();
    const waiterId = typeof body.waiterId === 'string' ? body.waiterId : '';

    if (!waiterId) {
      return json({ error: 'Missing waiterId' }, 400);
    }

    const record = await getWaiter(env, waiterId);
    if (!record || !canManage(tenantSlugForAdmin(admin.email), record)) {
      return json({ error: 'Mesero no encontrado.' }, 404);
    }

    await deleteWaiter(env, waiterId);

    return json({ success: true, message: 'Waiter deleted successfully' });
  } catch (error) {
    console.error('Error in delete-waiter:', error);
    return json({ error: 'No se pudo eliminar la cuenta del mesero.' }, 500);
  }
}
