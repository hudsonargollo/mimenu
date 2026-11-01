/**
 * Send password reset link by email (Resend)
 * POST /api/waiters/send-password-reset
 */

import { renderEmailLayout, sendEmail } from '../../lib/email';

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

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);

    const body = await request.json();
    const { waiterId, waiterEmail, waiterName } = body;

    if (!waiterId || !waiterEmail) {
      return json({ error: 'Missing required fields' }, 400);
    }

    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(
      env.VITE_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return json({ error: 'Invalid token' }, 401);
    }

    if (user.user_metadata?.role !== 'admin') {
      return json({ error: 'Forbidden - admin access required' }, 403);
    }

    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: waiterEmail,
    });

    if (resetError) {
      console.error('Error generating reset link:', resetError);
      return json({ error: 'Failed to generate password reset link' }, 500);
    }

    const resetUrl = resetData.properties.action_link;
    const greeting = waiterName ? `Hola ${waiterName}` : 'Hola';

    const html = renderEmailLayout({
      heading: 'Restablecé tu contraseña',
      intro: `${greeting}, recibimos una solicitud para restablecer la contraseña de tu cuenta en MiMenu.`,
      cta: { label: 'Crear nueva contraseña', url: resetUrl },
      note: 'El enlace vence en 1 hora. Si no solicitaste este cambio, podés ignorar este email.',
    });

    const text = `${greeting}, recibimos una solicitud para restablecer la contraseña de tu cuenta en MiMenu.\n\nCreá una nueva contraseña acá: ${resetUrl}\n\nEl enlace vence en 1 hora. Si no solicitaste este cambio, podés ignorar este email.`;

    try {
      const result = await sendEmail(env, {
        to: waiterEmail,
        subject: 'Restablecé tu contraseña · MiMenu',
        html,
        text,
      });

      return json({ success: true, emailId: result.id });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return json({ error: 'Failed to send password reset email' }, 502);
    }
  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return json({ error: 'Internal server error', message: error.message }, 500);
  }
}
