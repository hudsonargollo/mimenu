import { clientIp, isRateLimited } from '../../lib/rate-limit';
import type { ConciergeTurn } from '../../../shared/concierge';

interface KVNamespace {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  get(key: string): Promise<string | null>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    cursor?: string;
  }>;
}

interface Env {
  MIMENU_KV?: KVNamespace;
}

const TURN_TTL_SECONDS = 90 * 24 * 60 * 60;
const LANGS = new Set(['es', 'en', 'pt', 'de']);
const VENUE_PATTERN = /^[a-z0-9-]{2,64}$/i;
const SESSION_PATTERN = /^[A-Za-z0-9._:-]{4,80}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/**
 * POST /api/concierge/log
 * Records one guest turn so admins can review the assistant later.
 */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  if (isRateLimited(`concierge-log:${clientIp(request)}`, 120, 10 * 60 * 1000)) {
    return json({ error: 'Demasiadas conversaciones desde esta conexión.' }, 429);
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Solicitud inválida.' }, 400);

  const venueId = clean(body.venueId, 64);
  const sessionId = clean(body.sessionId, 80);
  const message = clean(body.message, 2000);
  const reply = clean(body.reply, 4000);
  const lang = clean(body.lang, 2);
  const userName = clean(body.userName, 80);

  if (!VENUE_PATTERN.test(venueId)) return json({ error: 'Sede inválida.' }, 400);
  if (!SESSION_PATTERN.test(sessionId)) return json({ error: 'Sesión inválida.' }, 400);
  if (!message || !reply) return json({ error: 'Falta el mensaje o la respuesta.' }, 400);
  if (!LANGS.has(lang)) return json({ error: 'Idioma inválido.' }, 400);

  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  // Inverted timestamp keeps the KV list ordered newest-first for reviews.
  const reversedTime = String(9_999_999_999_999 - Date.now()).padStart(13, '0');
  const turn: ConciergeTurn = {
    id,
    venueId,
    sessionId,
    message,
    reply,
    lang: lang as ConciergeTurn['lang'],
    userName: userName || null,
    learnedId: clean(body.learnedId, 80) || null,
    reservationSaved: body.reservationSaved === true,
    createdAt: new Date().toISOString(),
  };

  await env.MIMENU_KV.put(
    `concierge:t:${venueId}:${reversedTime}:${sessionId}:${id}`,
    JSON.stringify(turn),
    { expirationTtl: TURN_TTL_SECONDS }
  );

  return json({ ok: true, id });
};

export const onRequestOptions = async () => json({}, 204);
