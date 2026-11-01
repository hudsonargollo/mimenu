import { renderEmailLayout, sendEmail } from '../../lib/email';
import { clientIp, EMAIL_PATTERN, isRateLimited } from '../../lib/rate-limit';

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  SALES_EMAIL?: string;
  SALES_WHATSAPP?: string;
}

interface UpgradeRequestBody {
  venueName?: string;
  venueSlug?: string;
  currentPlanName?: string;
  targetPlanName?: string;
  featureLabel?: string;
  replyTo?: string;
}

const DEFAULT_SALES_EMAIL = 'contato@mimenu.clubemkt.digital';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const clean = (value: unknown, max = 160): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * POST /api/email/upgrade-request
 * Notifies the sales inbox about an upgrade request. Recipient is fixed, so
 * the endpoint is safe to expose without a session.
 */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.RESEND_API_KEY) {
    return json({ error: 'El servicio de email no está configurado.' }, 503);
  }

  if (isRateLimited(`upgrade:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return json({ error: 'Demasiadas solicitudes. Intentá más tarde.' }, 429);
  }

  let body: UpgradeRequestBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const venueName = clean(body.venueName);
  const venueSlug = clean(body.venueSlug);
  const currentPlanName = clean(body.currentPlanName, 40);
  const targetPlanName = clean(body.targetPlanName, 40);
  const featureLabel = clean(body.featureLabel, 80);
  const replyTo = clean(body.replyTo, 200);

  const who =
    venueName && venueSlug && venueName !== venueSlug
      ? `${venueName} (${venueSlug})`
      : venueName || venueSlug;

  const planPart =
    currentPlanName && targetPlanName
      ? `quiere pasar del plan ${currentPlanName} al plan ${targetPlanName}`
      : currentPlanName
        ? `quiere mejorar su plan ${currentPlanName}`
        : 'quiere activar su restaurante en MiMenu';

  const featurePart = featureLabel ? ` para usar ${featureLabel}` : '';
  const greeting = who ? `El restaurante ${who}` : 'Un restaurante';
  const message = `${greeting} ${planPart}${featurePart}.`;

  const subject = targetPlanName
    ? `Upgrade a ${targetPlanName}${who ? ` — ${who}` : ''}`
    : `Upgrade de plan${who ? ` — ${who}` : ''}`;

  const html = renderEmailLayout({
    heading: 'Solicitud de upgrade de plan',
    intro: message,
    note: replyTo
      ? `Respondé este email para coordinar la activación. Contacto: ${escapeHtml(replyTo)}`
      : 'Respondé este email para coordinar la activación con el restaurante.',
  });

  const text = `${message}\n\n${replyTo ? `Contacto: ${replyTo}\n` : ''}Respondé este email para coordinar la activación.`;

  try {
    const result = await sendEmail(env, {
      to: env.SALES_EMAIL || DEFAULT_SALES_EMAIL,
      subject,
      html,
      text,
      replyTo: EMAIL_PATTERN.test(replyTo) ? replyTo : undefined,
    });

    return json({ id: result.id });
  } catch (error) {
    console.error('Upgrade request email failed:', error);
    return json({ error: 'No se pudo enviar la solicitud.' }, 502);
  }
};
