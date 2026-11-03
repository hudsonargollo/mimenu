import { clientIp, isRateLimited } from '../../lib/rate-limit';
import { requireConciergeTool } from '../../lib/concierge-tool-auth';
import { readSettings } from '../../lib/concierge-settings';
import type { KVLike } from '../../lib/concierge-settings';
import { publicBaseUrl } from '../../lib/venue-registry';

interface Env {
  CONCIERGE_TOOL_SECRET?: string;
  MIMENU_KV?: KVLike;
  MIMENU_PUBLIC_URL?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** GET /api/concierge/venue-info — address, contact, hours and services. */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const auth = await requireConciergeTool(request, env, 'venue');
  if (auth instanceof Response) return auth;

  if (isRateLimited(`concierge-venue:${auth.claims.vid}:${clientIp(request)}`, 60, 60 * 1000)) {
    return json({ error: 'Demasiadas consultas. Esperá un momento.' }, 429);
  }

  const settings = await readSettings(env, auth.venue);
  const base = publicBaseUrl(env, request);
  const menuUrl = `${base}/${auth.venue.slug}`;
  const address = auth.venue.address || auth.venue.city;
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${auth.venue.name}, ${address}`)}`
    : null;

  const hoursSummary = settings.hours.length
    ? settings.hours
        .map((block) => `${block.days}: ${block.open}–${block.close}${block.note ? ` (${block.note})` : ''}`)
        .join(' | ')
    : 'Horarios no configurados. Confirmá por WhatsApp.';

  return json({
    venue: {
      slug: auth.venue.slug,
      name: auth.venue.name,
      tagline: auth.venue.tagline,
      description: auth.venue.description,
      city: auth.venue.city,
      address: auth.venue.address,
      phone: auth.venue.phone,
      whatsapp: settings.whatsapp || auth.venue.whatsapp,
      currency: auth.venue.currency,
      menu_url: menuUrl,
      maps_url: mapsUrl,
      is_active: auth.venue.isActive,
    },
    hours: settings.hours,
    hours_summary: hoursSummary,
    service_notes: settings.serviceNotes || null,
    reservation_enabled: settings.reservationEnabled,
    max_party_size: settings.maxPartySize,
    handoff_message: settings.handoffMessage,
  });
};
