/**
 * Server-to-server surface used by `scripts/sync-dograh-agents.ts`.
 *
 * It hands the script the rendered inputs (venue snapshot + normalized
 * settings), a freshly signed tenant tool token, and the previous Dograh
 * mapping; then it stores the mapping after a successful sync. It is guarded
 * by CONCIERGE_SYNC_SECRET and never exposed to the browser.
 */

import { createConciergeToolToken, TOOL_SCOPES } from '../../lib/concierge-tool-token';
import { findRegistryVenueById, findVenueSnapshot, publicBaseUrl } from '../../lib/venue-registry';
import { readAgent, readSettings, writeAgent } from '../../lib/concierge-settings';
import type { KVLike } from '../../lib/concierge-settings';
import type { ConciergeAgentRecord } from '../../../shared/dograh/types';
import { TEMPLATE_VERSION } from '../../../shared/dograh/template-version';

interface KVListLike extends KVLike {
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    cursor?: string;
  }>;
}

interface Env {
  CONCIERGE_SYNC_SECRET?: string;
  CONCIERGE_TOOL_SECRET?: string;
  MIMENU_KV?: KVListLike;
  MIMENU_PUBLIC_URL?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function secureEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return diff === 0;
}

function requireSyncSecret(request: Request, env: Env): Response | null {
  if (!env.CONCIERGE_SYNC_SECRET) return json({ error: 'La sincronización no está configurada.' }, 503);
  const provided = request.headers.get('x-concierge-sync-secret') || '';
  if (!secureEqual(provided, env.CONCIERGE_SYNC_SECRET)) return json({ error: 'No autorizado.' }, 401);
  return null;
}

function slugFrom(request: Request): string {
  const url = new URL(request.url);
  return (url.searchParams.get('venue') || url.searchParams.get('v') || '').trim().toLowerCase();
}

async function listSettingsVenueIds(kv: KVListLike): Promise<string[]> {
  const ids = new Set<string>();
  let cursor: string | undefined;
  for (let page = 0; page < 10; page += 1) {
    const result = await kv.list({ prefix: 'concierge:settings:', limit: 100, cursor });
    for (const key of result.keys) {
      const id = key.name.slice('concierge:settings:'.length);
      if (id) ids.add(id);
    }
    if (!result.cursor) break;
    cursor = result.cursor;
  }
  return Array.from(ids);
}

/** GET /api/concierge/sync[?venue=<slug>] */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const denied = requireSyncSecret(request, env);
  if (denied) return denied;
  if (!env.MIMENU_KV) return json({ error: 'MIMENU_KV no está vinculado.' }, 503);

  const slug = slugFrom(request);

  if (!slug) {
    const ids = await listSettingsVenueIds(env.MIMENU_KV);
    const venues = [];
    for (const id of ids) {
      const registryVenue = findRegistryVenueById(id);
      if (!registryVenue) continue;
      const venue = findVenueSnapshot(registryVenue.slug);
      if (!venue) continue;
      const [settings, agent] = await Promise.all([readSettings(env, venue), readAgent(env, venue.id)]);
      venues.push({
        slug: venue.slug,
        name: venue.name,
        enabled: settings.enabled,
        agent: agent
          ? {
              workflowId: agent.workflowId,
              syncStatus: agent.syncStatus,
              templateVersion: agent.templateVersion,
              configHash: agent.configHash,
            }
          : null,
      });
    }
    venues.sort((a, b) => a.name.localeCompare(b.name));
    return json({ templateVersion: TEMPLATE_VERSION, venues });
  }

  const venue = findVenueSnapshot(slug);
  if (!venue || !venue.isActive) return json({ error: 'Sede inválida o inactiva.' }, 404);
  if (!env.CONCIERGE_TOOL_SECRET) return json({ error: 'CONCIERGE_TOOL_SECRET no está configurado.' }, 503);

  const [settings, agent] = await Promise.all([readSettings(env, venue), readAgent(env, venue.id)]);
  const toolToken = await createConciergeToolToken(env.CONCIERGE_TOOL_SECRET, {
    venueId: venue.id,
    venueSlug: venue.slug,
    scope: TOOL_SCOPES,
  });

  return json({
    templateVersion: TEMPLATE_VERSION,
    publicBaseUrl: publicBaseUrl(env, request),
    venue,
    settings,
    agent,
    toolToken,
  });
};

const uuidPattern = /^[a-z0-9-]{8,64}$/i;

function boundedString(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max ? trimmed : null;
}

function toAgentRecord(
  body: Record<string, unknown>,
  fallback: ConciergeAgentRecord | null,
  venueId: string,
  venueSlug: string
): { record: ConciergeAgentRecord } | { error: string } {
  const source = (body.agent && typeof body.agent === 'object' ? body.agent : body) as Record<string, unknown>;

  const syncStatus = source.syncStatus === 'error' ? 'error' : 'synced';
  const workflowId = Number(source.workflowId ?? 0);
  const workflowUuid = boundedString(source.workflowUuid, 8, 64) || fallback?.workflowUuid || '';
  const credentialUuid = boundedString(source.credentialUuid, 8, 64) || fallback?.credentialUuid || '';
  const embedToken = boundedString(source.embedToken, 8, 300) || fallback?.embedToken || '';
  const embedTokenId = Number(source.embedTokenId ?? 0);
  const templateVersion = boundedString(source.templateVersion, 1, 40) || '';
  const configHash = boundedString(source.configHash, 8, 32) || '';
  const toolUuids = Array.isArray(source.toolUuids)
    ? source.toolUuids.filter((item): item is string => typeof item === 'string' && uuidPattern.test(item))
    : [];
  const widgetType = source.widgetType === 'voice' ? 'voice' : 'chat';
  const embedMode =
    source.embedMode === 'inline' || source.embedMode === 'headless' ? source.embedMode : 'floating';
  const enabled = source.enabled === true;
  const error = boundedString(source.error, 0, 500) || undefined;

  if (!Number.isInteger(workflowId) || workflowId < 0) return { error: 'workflowId inválido.' };
  if (!Number.isInteger(embedTokenId) || embedTokenId < 0) return { error: 'embedTokenId inválido.' };
  if (syncStatus === 'synced') {
    if (workflowId < 1) return { error: 'workflowId requerido.' };
    if (!workflowUuid || !credentialUuid) return { error: 'workflowUuid y credentialUuid son requeridos.' };
    if (!embedToken || !embedTokenId) return { error: 'embedToken requerido.' };
    if (!templateVersion || !configHash) return { error: 'templateVersion y configHash son requeridos.' };
    if (!toolUuids.length) return { error: 'toolUuids requerido.' };
  }

  return {
    record: {
      venueId,
      venueSlug,
      enabled,
      workflowId,
      workflowUuid,
      credentialUuid,
      toolUuids,
      embedToken,
      embedTokenId,
      widgetType,
      embedMode,
      templateVersion,
      configHash,
      syncedAt: new Date().toISOString(),
      syncStatus,
      ...(error ? { error } : {}),
    },
  };
}

/** POST /api/concierge/sync?venue=<slug> — store the Dograh mapping. */
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const denied = requireSyncSecret(request, env);
  if (denied) return denied;
  if (!env.MIMENU_KV) return json({ error: 'MIMENU_KV no está vinculado.' }, 503);

  const slug = slugFrom(request);
  const venue = findVenueSnapshot(slug);
  if (!venue || !venue.isActive) return json({ error: 'Sede inválida o inactiva.' }, 404);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'Solicitud inválida.' }, 400);

  const existing = await readAgent(env, venue.id);
  const result = toAgentRecord(body, existing, venue.id, venue.slug);
  if ('error' in result) return json({ error: result.error }, 400);

  await writeAgent(env, result.record);
  return json({ ok: true, agent: result.record });
};
