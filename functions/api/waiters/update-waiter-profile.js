/**
 * Update waiter profile
 * POST /api/waiters/update-waiter-profile
 */

import { requireAdmin } from '../../lib/app-session';
import { EMAIL_PATTERN } from '../../lib/rate-limit';
import {
  canManage,
  findWaiterByEmail,
  getWaiter,
  saveWaiter,
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
    const body = await request.json();
    const waiterId = typeof body.waiterId === 'string' ? body.waiterId : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const phoneNumber =
      typeof body.phone_number === 'string' && body.phone_number.trim()
        ? body.phone_number.trim()
        : null;

    if (!waiterId || !EMAIL_PATTERN.test(email) || !fullName) {
      return json({ error: 'Completá el nombre y un email válido.' }, 400);
    }

    const record = await getWaiter(env, waiterId);
    if (!record || !canManage(tenantSlugForAdmin(admin.email), record)) {
      return json({ error: 'Mesero no encontrado.' }, 404);
    }

    const duplicate = await findWaiterByEmail(env, email);
    if (duplicate && duplicate.id !== record.id) {
      return json({ error: 'Este correo ya está registrado.' }, 409);
    }

    const updated = {
      ...record,
      email,
      full_name: fullName,
      phone_number: phoneNumber,
    };

    await saveWaiter(env, updated);

    return json({ success: true, waiter: toPublicWaiter(updated) });
  } catch (error) {
    console.error('Error in update-waiter-profile:', error);
    return json({ error: 'No se pudo actualizar el mesero.' }, 500);
  }
}
