/**
 * Create a new waiter (garçom)
 * POST /api/waiters/create-waiter
 */

import { requireAdmin } from '../../lib/app-session';
import { EMAIL_PATTERN } from '../../lib/rate-limit';
import {
  createWaiter,
  DuplicateEmailError,
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
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const phoneNumber =
      typeof body.phone_number === 'string' && body.phone_number.trim()
        ? body.phone_number.trim()
        : null;

    if (!EMAIL_PATTERN.test(email) || !fullName) {
      return json({ error: 'Completá el nombre y un email válido.' }, 400);
    }

    if (password.length < 6) {
      return json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, 400);
    }

    const waiter = await createWaiter(env, {
      email,
      password,
      full_name: fullName,
      phone_number: phoneNumber,
      tenant_slug: tenantSlugForAdmin(admin.email),
    });

    return json({ success: true, waiter: toPublicWaiter(waiter) });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return json({ error: error.message }, 409);
    }

    console.error('Error in create-waiter:', error);
    return json({ error: 'No se pudo crear la cuenta del mesero.' }, 500);
  }
}
