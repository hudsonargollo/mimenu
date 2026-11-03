import { canReviewVenue, json, requireConciergeAdmin } from '../../lib/concierge-auth';
import { readAgent, readSettings, writeSettings } from '../../lib/concierge-settings';
import type { KVLike } from '../../lib/concierge-settings';
import { findVenueSnapshot } from '../../lib/venue-registry';
import type { ConciergeSettings } from '../../../shared/dograh/types';

interface Env {
  MIMENU_KV?: KVLike;
  APP_SESSION_SECRET?: string;
}

function slugFrom(request: Request, body?: Record<string, unknown> | null): string {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('venue') || url.searchParams.get('v');
  const fromBody = body?.venue;
  return String(fromQuery || fromBody || '').trim().toLowerCase();
}

/** GET /api/concierge/settings?venue=<slug> — current settings + sync status. */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const admin = await requireConciergeAdmin(request, env);
  if (admin instanceof Response) return admin;

  const slug = slugFrom(request);
  const venue = findVenueSnapshot(slug);
  if (!venue) return json({ error: 'Sede inválida.' }, 400);
  if (!canReviewVenue(admin, venue.id)) return json({ error: 'No podés administrar otra sede.' }, 403);

  const [settings, agent] = await Promise.all([readSettings(env, venue), readAgent(env, venue.id)]);

  return json({
    venue: { id: venue.id, slug: venue.slug, name: venue.name },
    settings,
    agent: agent
      ? {
          workflowId: agent.workflowId,
          templateVersion: agent.templateVersion,
          configHash: agent.configHash,
          syncedAt: agent.syncedAt,
          syncStatus: agent.syncStatus,
          enabled: agent.enabled,
          widgetType: agent.widgetType,
          embedMode: agent.embedMode,
        }
      : null,
  });
};

/** PUT /api/concierge/settings?venue=<slug> — save tenant concierge settings. */
export const onRequestPut = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.MIMENU_KV) return json({ error: 'El almacenamiento del conserje no está configurado.' }, 503);

  const admin = await requireConciergeAdmin(request, env);
  if (admin instanceof Response) return admin;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Solicitud inválida.' }, 400);

  const slug = slugFrom(request, body);
  const venue = findVenueSnapshot(slug);
  if (!venue) return json({ error: 'Sede inválida.' }, 400);
  if (!canReviewVenue(admin, venue.id)) return json({ error: 'No podés administrar otra sede.' }, 403);

  const settingsInput = body.settings;
  if (!settingsInput || typeof settingsInput !== 'object' || Array.isArray(settingsInput)) {
    return json({ error: 'Faltan los ajustes del concierge.' }, 400);
  }

  const settings = await writeSettings(
    env,
    venue,
    settingsInput as Partial<ConciergeSettings>,
    admin.email
  );

  return json({
    ok: true,
    venue: { id: venue.id, slug: venue.slug, name: venue.name },
    settings,
    needs_sync: true,
  });
};
