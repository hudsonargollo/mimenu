/**
 * Reset a waiter password and email the new temporary password (Resend)
 * POST /api/waiters/send-password-reset
 */

import { requireAdmin } from '../../lib/app-session';
import { renderEmailLayout, sendEmail } from '../../lib/email';
import {
  canManage,
  generateTemporaryPassword,
  getWaiter,
  hashPassword,
  saveWaiter,
  tenantSlugForAdmin,
} from '../../lib/waiter-store';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

    const temporaryPassword = generateTemporaryPassword();
    const previousHash = record.password_hash;

    await saveWaiter(env, {
      ...record,
      password_hash: await hashPassword(temporaryPassword),
    });

    const name = escapeHtml(record.full_name);
    const email = escapeHtml(record.email);

    const html = renderEmailLayout({
      heading: 'Restablecimos tu contraseña',
      intro: `Hola ${name}, un administrador restableció tu contraseña de acceso a MiMenu.`,
      contentHtml: `<div style="background:#f4f1fb;border-radius:12px;padding:18px 20px;margin:0 0 20px;">
        <p style="margin:0 0 6px;color:#64748b;font-size:13px;">Usuario</p>
        <p style="margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:600;">${email}</p>
        <p style="margin:0 0 6px;color:#64748b;font-size:13px;">Contraseña temporal</p>
        <p style="margin:0;color:#0f172a;font-size:18px;font-weight:700;letter-spacing:0.08em;">${temporaryPassword}</p>
      </div>`,
      note: 'Ingresá a MiMenu con esta contraseña temporal. Si no esperabas este cambio, avisá al administrador de tu restaurante.',
    });

    const text = [
      `Hola ${record.full_name}, un administrador restableció tu contraseña de acceso a MiMenu.`,
      '',
      `Usuario: ${record.email}`,
      `Contraseña temporal: ${temporaryPassword}`,
      '',
      'Ingresá a MiMenu con esta contraseña temporal. Si no esperabas este cambio, avisá al administrador de tu restaurante.',
    ].join('\n');

    try {
      const result = await sendEmail(env, {
        to: record.email,
        subject: 'Tu nueva contraseña de acceso · MiMenu',
        html,
        text,
      });

      return json({ success: true, emailId: result.id });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      await saveWaiter(env, { ...record, password_hash: previousHash });
      return json({ error: 'No se pudo enviar el email de restablecimiento.' }, 502);
    }
  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return json({ error: 'No se pudo restablecer la contraseña.' }, 500);
  }
}
