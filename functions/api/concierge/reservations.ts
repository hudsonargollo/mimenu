import { clientIp, isRateLimited } from '../../lib/rate-limit';
import { requireConciergeTool } from '../../lib/concierge-tool-auth';
import { canReviewVenue, requireConciergeAdmin } from '../../lib/concierge-auth';
import { findVenueSnapshot } from '../../lib/venue-registry';
import { readSettings, reservationIdempotencyKey, storeReservation } from '../../lib/concierge-settings';
import type { KVLike } from '../../lib/concierge-settings';
import { renderEmailLayout, sendEmail } from '../../lib/email';
import type { ConciergeLang, ConciergeReservation } from '../../../shared/dograh/types';

interface ConciergeKV extends KVLike {
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    cursor?: string;
  }>;
}

interface Env {
  APP_SESSION_SECRET?: string;
  CONCIERGE_TOOL_SECRET?: string;
  MIMENU_KV?: ConciergeKV;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const clean = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_PATTERN = /^[+()\d\s.-]{5,30}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9._:-]{8,80}$/;

function todayInVenueTimezone(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function addDays(isoDate: string, days: number): string {
  const base = Date.parse(`${isoDate}T12:00:00Z`);
  if (!Number.isFinite(base)) return isoDate;
  return new Date(base + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * POST /api/concierge/reservations
 * Stores a reservation request and (when configured) notifies the venue.
 * The reservation is always `pending`: staff confirm it out of band.
 */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const auth = await requireConciergeTool(request, env, 'reservation');
  if (auth instanceof Response) return auth;
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  const ip = clientIp(request);
  if (isRateLimited(`concierge-res-ip:${auth.claims.vid}:${ip}`, 8, 60 * 60 * 1000)) {
    return json({ error: 'Demasiadas solicitudes de reserva desde esta conexión.' }, 429);
  }
  if (isRateLimited(`concierge-res-token:${auth.claims.vid}`, 30, 60 * 60 * 1000)) {
    return json({ error: 'Demasiadas solicitudes de reserva. Probá más tarde.' }, 429);
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Solicitud inválida.' }, 400);

  const settings = await readSettings(env, auth.venue);
  if (!settings.reservationEnabled) {
    return json(
      {
        error: 'Las reservas no están habilitadas por este canal.',
        handoff_message: settings.handoffMessage,
      },
      409
    );
  }

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 30);
  const notes = clean(body.notes, 300);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const partySize = Number(body.party_size);
  const langRaw = clean(body.lang, 2).toLowerCase();
  const lang: ConciergeLang = langRaw === 'en' || langRaw === 'pt' ? langRaw : 'es';
  const idempotencyKey = clean(body.idempotency_key, 80);

  if (name.length < 2) return json({ error: 'Falta el nombre del cliente.' }, 400);
  if (!PHONE_PATTERN.test(phone)) return json({ error: 'Teléfono inválido.' }, 400);
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > settings.maxPartySize) {
    return json({ error: `La cantidad de personas debe ser entre 1 y ${settings.maxPartySize}.` }, 400);
  }
  if (!DATE_PATTERN.test(date)) return json({ error: 'La fecha debe tener formato YYYY-MM-DD.' }, 400);
  if (!TIME_PATTERN.test(time)) return json({ error: 'La hora debe tener formato HH:MM.' }, 400);

  const today = todayInVenueTimezone();
  if (date < today) return json({ error: 'La fecha de la reserva ya pasó.' }, 400);
  if (date > addDays(today, 180)) return json({ error: 'Solo se aceptan reservas hasta 180 días adelante.' }, 400);
  if (idempotencyKey && !IDEMPOTENCY_PATTERN.test(idempotencyKey)) {
    return json({ error: 'Clave de idempotencia inválida.' }, 400);
  }

  if (idempotencyKey) {
    const existing = await env.MIMENU_KV.get(reservationIdempotencyKey(auth.venue.id, idempotencyKey));
    if (existing) {
      try {
        const parsed = JSON.parse(existing) as { id: string; summary: string };
        return json({ ok: true, duplicate: true, id: parsed.id, status: 'pending', summary: parsed.summary });
      } catch {
        /* stale/broken key: fall through and create a fresh request */
      }
    }
  }

  const id = `res_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const summary = `Reserva solicitada para ${partySize} personas el ${date} a las ${time} a nombre de ${name}. Queda pendiente de confirmación del local.`;

  const reservation: ConciergeReservation = {
    id,
    venueId: auth.venue.id,
    venueSlug: auth.venue.slug,
    name,
    phone,
    partySize,
    date,
    time,
    notes,
    lang,
    status: 'pending',
    source: 'dograh',
    createdAt,
  };

  await storeReservation(env, reservation);
  if (idempotencyKey) {
    await env.MIMENU_KV.put(
      reservationIdempotencyKey(auth.venue.id, idempotencyKey),
      JSON.stringify({ id, summary }),
      { expirationTtl: 24 * 60 * 60 }
    );
  }

  let emailSent = false;
  if (settings.reservationEmail && env.RESEND_API_KEY) {
    const rows: Array<[string, string]> = [
      ['Cliente', name],
      ['Teléfono', phone],
      ['Personas', String(partySize)],
      ['Fecha', date],
      ['Hora', time],
      ['Notas', notes || '—'],
      ['Idioma', lang],
    ];
    const contentHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 16px;">${rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:120px;">${escapeHtml(
            label
          )}</td><td style="padding:6px 0;color:#0f172a;font-size:14px;">${escapeHtml(value)}</td></tr>`
      )
      .join('')}</table>`;

    try {
      await sendEmail(env, {
        to: settings.reservationEmail,
        subject: `Nueva reserva — ${auth.venue.name} · ${date} ${time}`,
        html: renderEmailLayout({
          heading: 'Nueva solicitud de reserva',
          intro: summary,
          contentHtml,
          note: 'Solicitud generada por el concierge virtual. Confirmala con el cliente por teléfono o WhatsApp.',
        }),
        text: `${summary}\n\nCliente: ${name}\nTeléfono: ${phone}\nPersonas: ${partySize}\nFecha: ${date} ${time}\nNotas: ${
          notes || '—'
        }`,
      });
      emailSent = true;
    } catch (error) {
      console.error('Reservation email failed:', error);
    }
  }

  return json({
    ok: true,
    id,
    status: 'pending',
    summary,
    email_sent: emailSent,
    handoff_message: settings.handoffMessage,
  });
};

const RESERVATION_ID_PATTERN = /^res_[0-9]{10,16}_[a-z0-9]{6,16}$/i;

async function listAllKeys(kv: ConciergeKV, prefix: string): Promise<string[]> {
  const names: string[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 20; page += 1) {
    const result = await kv.list({ prefix, limit: 1000, cursor });
    for (const key of result.keys) names.push(key.name);
    if (!result.cursor) break;
    cursor = result.cursor;
  }
  return names;
}

/**
 * DELETE /api/concierge/reservations?venue=<slug>&id=<res_id>
 * Admin-only purge of one reservation and any idempotency keys pointing at it.
 */
export const onRequestDelete = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  const admin = await requireConciergeAdmin(request, env);
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const slug = (url.searchParams.get('venue') || '').trim().toLowerCase();
  const id = (url.searchParams.get('id') || '').trim();

  const venue = findVenueSnapshot(slug);
  if (!venue) return json({ error: 'Sede inválida.' }, 400);
  if (!canReviewVenue(admin, venue.id)) return json({ error: 'No podés administrar otra sede.' }, 403);
  if (!RESERVATION_ID_PATTERN.test(id)) return json({ error: 'Falta el id de la reserva.' }, 400);

  let deleted = 0;
  for (const name of await listAllKeys(env.MIMENU_KV, `concierge:reservation:${venue.id}:`)) {
    if (!name.endsWith(`:${id}`)) continue;
    await env.MIMENU_KV.delete(name);
    deleted += 1;
  }

  for (const name of await listAllKeys(env.MIMENU_KV, `concierge:reservation:idem:${venue.id}:`)) {
    const raw = await env.MIMENU_KV.get(name);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as { id?: unknown };
      if (parsed.id === id) {
        await env.MIMENU_KV.delete(name);
        deleted += 1;
      }
    } catch {
      /* ignore malformed idempotency entries */
    }
  }

  if (!deleted) return json({ error: 'Reserva no encontrada.' }, 404);
  return json({ ok: true, id, deleted });
};
