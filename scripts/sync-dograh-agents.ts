#!/usr/bin/env node
/**
 * Render the shared concierge template for every enabled tenant and push it
 * to Dograh.
 *
 *   DOGRAH_API_TOKEN=... CONCIERGE_SYNC_SECRET=... node scripts/sync-dograh-agents.ts
 *
 * Optional:
 *   DOGRAH_API_URL           default https://voice.clubemkt.digital
 *   MIMENU_URL               default https://mimenu.clubemkt.digital
 *   DOGRAH_VENUES            comma-separated slugs; defaults to all enabled venues
 *   DOGRAH_EMBED_DOMAINS     comma-separated; defaults to the MIMENU_URL host + localhost
 *   DOGRAH_WIDGET_TYPE       chat | voice (default chat)
 *   DOGRAH_EMBED_MODE        floating | inline | headless (default floating)
 *   --force                  republish even when the config hash matches
 *   --dry-run                print the plan without calling Dograh
 */

import { renderConcierge } from '../shared/dograh/render.ts';
import { buildTenantTools, buildWorkflowDefinition } from '../shared/dograh/template.ts';
import { stableHash } from '../shared/dograh/template-version.ts';
import type {
  ConciergeAgentRecord,
  ConciergeSettings,
  DograhHttpToolSpec,
  DograhWorkflowDefinition,
  VenueSnapshot,
} from '../shared/dograh/types.ts';

type WidgetType = 'chat' | 'voice';
type EmbedMode = 'floating' | 'inline' | 'headless';

interface SyncVenueConfig {
  templateVersion: string;
  publicBaseUrl: string;
  venue: VenueSnapshot;
  settings: ConciergeSettings;
  agent: ConciergeAgentRecord | null;
  toolToken: string;
}

interface SyncVenueSummary {
  slug: string;
  name: string;
  enabled: boolean;
  agent: { workflowId: number } | null;
}

interface DograhCredential {
  uuid: string;
  name: string;
}

interface DograhTool {
  id: number;
  tool_uuid: string;
  name: string;
  description: string | null;
  definition: unknown;
  status?: string;
}

interface DograhWorkflowSummary {
  id: number;
  name: string;
  status: string;
  workflow_uuid: string;
}

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const FORCE = args.has('--force');

const DOGRAH_API_URL = (process.env.DOGRAH_API_URL || 'https://voice.clubemkt.digital').replace(/\/+$/, '');
const DOGRAH_API_TOKEN = (process.env.DOGRAH_API_TOKEN || '').trim();
const MIMENU_URL = (process.env.MIMENU_URL || 'https://mimenu.clubemkt.digital').replace(/\/+$/, '');
const SYNC_SECRET = (process.env.CONCIERGE_SYNC_SECRET || '').trim();
const ONLY_VENUES = (process.env.DOGRAH_VENUES || '')
  .split(',')
  .map((slug) => slug.trim().toLowerCase())
  .filter(Boolean);
const WIDGET_TYPE: WidgetType = process.env.DOGRAH_WIDGET_TYPE === 'voice' ? 'voice' : 'chat';
const EMBED_MODE: EmbedMode =
  process.env.DOGRAH_EMBED_MODE === 'inline'
    ? 'inline'
    : process.env.DOGRAH_EMBED_MODE === 'headless'
      ? 'headless'
      : 'floating';
const EMBED_DOMAINS = (process.env.DOGRAH_EMBED_DOMAINS || '')
  .split(',')
  .map((domain) => domain.trim())
  .filter(Boolean);

function embedDomains(): string[] {
  if (EMBED_DOMAINS.length) return EMBED_DOMAINS;
  try {
    return [new URL(MIMENU_URL).host, 'localhost'];
  } catch {
    return ['localhost'];
  }
}

function requireEnv(): void {
  if (!DRY_RUN && !DOGRAH_API_TOKEN) throw new Error('DOGRAH_API_TOKEN is required');
  if (!SYNC_SECRET) throw new Error('CONCIERGE_SYNC_SECRET is required');
}

function log(message: string): void {
  console.log(`[dograh:sync] ${message}`);
}

async function requestJson<T>(
  base: string,
  path: string,
  init: RequestInit = {},
  timeoutMs = 30_000
): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`${init.method || 'GET'} ${path} → ${response.status}: ${raw.slice(0, 400)}`);
  }
  return (raw ? JSON.parse(raw) : null) as T;
}

class DograhApi {
  private readonly base: string;
  private readonly headers: Record<string, string>;

  constructor(base: string, token: string) {
    this.base = base;
    this.headers = { Authorization: `Bearer ${token}` };
  }

  get<T>(path: string): Promise<T> {
    return requestJson<T>(this.base, path, { headers: this.headers });
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return requestJson<T>(this.base, path, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return requestJson<T>(this.base, path, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(body),
    });
  }
}

async function mimenuGet<T>(path: string): Promise<T> {
  return requestJson<T>(
    MIMENU_URL,
    path,
    { headers: { 'x-concierge-sync-secret': SYNC_SECRET } },
    15_000
  );
}

async function mimenuPost<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(
    MIMENU_URL,
    path,
    {
      method: 'POST',
      headers: { 'x-concierge-sync-secret': SYNC_SECRET },
      body: JSON.stringify(body),
    },
    15_000
  );
}

async function listEnabledVenues(): Promise<SyncVenueSummary[]> {
  if (ONLY_VENUES.length) {
    return ONLY_VENUES.map((slug) => ({ slug, name: slug, enabled: true, agent: null }));
  }
  const result = await mimenuGet<{ venues: SyncVenueSummary[] }>('/api/concierge/sync');
  return result.venues.filter((venue) => venue.enabled);
}

async function ensureCredential(
  dograh: DograhApi,
  slug: string,
  token: string,
  current: ConciergeAgentRecord | null
): Promise<string> {
  const name = `mimenu-${slug}-tools`;

  if (DRY_RUN) return current?.credentialUuid || '<new-credential>';

  const credentials = await dograh.get<DograhCredential[]>('/api/v1/credentials/');
  const existing = credentials.find((credential) => credential.name === name);

  const body = {
    name,
    description: `Tenant tool token for the ${slug} concierge (managed by MiMenu sync).`,
    credential_type: 'bearer_token',
    credential_data: { token },
  };

  if (existing) {
    await dograh.put(`/api/v1/credentials/${existing.uuid}`, body);
    return existing.uuid;
  }
  const created = await dograh.post<DograhCredential>('/api/v1/credentials/', body);
  return created.uuid;
}

async function ensureTools(
  dograh: DograhApi,
  specs: DograhHttpToolSpec[]
): Promise<string[]> {
  if (DRY_RUN) {
    for (const spec of specs) log(`  would sync tool ${spec.name}`);
    return specs.map((spec) => `<tool:${spec.name}>`);
  }

  const existing = await dograh.get<DograhTool[]>('/api/v1/tools/?status=active');
  const byName = new Map(existing.map((tool) => [tool.name, tool]));
  const uuids: string[] = [];

  for (const spec of specs) {
    const tool = byName.get(spec.name);
    const body = { name: spec.name, description: spec.description, definition: spec.definition };

    if (!tool) {
      const created = await dograh.post<DograhTool>('/api/v1/tools/', {
        ...body,
        category: 'http_api',
      });
      uuids.push(created.tool_uuid);
      continue;
    }

    const changed =
      stableHash({ description: tool.description, definition: tool.definition }) !==
      stableHash({ description: spec.description, definition: spec.definition });

    if (changed) {
      await dograh.put(`/api/v1/tools/${tool.tool_uuid}`, { ...body, status: 'active' });
    }
    uuids.push(tool.tool_uuid);
  }

  return uuids;
}

async function ensureWorkflow(
  dograh: DograhApi,
  variantName: string,
  definition: DograhWorkflowDefinition,
  agent: ConciergeAgentRecord | null,
  configHash: string
): Promise<{ id: number; uuid: string; published: boolean }> {
  if (DRY_RUN) {
    return {
      id: agent?.workflowId || 0,
      uuid: agent?.workflowUuid || '<new-workflow>',
      published: false,
    };
  }

  let workflowId = agent?.workflowId && agent.workflowId > 0 ? agent.workflowId : 0;
  let workflowUuid = agent?.workflowUuid || '';
  let published = false;

  if (!workflowId) {
    const workflows = await dograh.get<DograhWorkflowSummary[]>('/api/v1/workflow/fetch');
    const existing = workflows.find((workflow) => workflow.name === variantName);
    if (existing) {
      workflowId = existing.id;
      workflowUuid = existing.workflow_uuid;
    }
  }

  if (!workflowId) {
    const created = await dograh.post<{ id: number; workflow_uuid: string }>(
      '/api/v1/workflow/create/definition',
      { name: variantName, workflow_definition: definition }
    );
    workflowId = created.id;
    workflowUuid = created.workflow_uuid;
  } else if (FORCE || agent?.configHash !== configHash || !agent) {
    await dograh.put(`/api/v1/workflow/${workflowId}`, {
      name: variantName,
      workflow_definition: definition,
    });
    try {
      await dograh.post(`/api/v1/workflow/${workflowId}/publish`, {});
      published = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('No draft to publish')) throw error;
    }
  }

  await dograh.put(`/api/v1/workflow/${workflowId}/status`, { status: 'active' });

  return { id: workflowId, uuid: workflowUuid, published };
}

async function ensureEmbedToken(
  dograh: DograhApi,
  workflowId: number
): Promise<{ id: number; token: string }> {
  if (DRY_RUN) return { id: 0, token: '<embed-token>' };
  return dograh.post<{ id: number; token: string }>(`/api/v1/workflow/${workflowId}/embed-token`, {
    allowed_domains: embedDomains(),
    settings: { widgetType: WIDGET_TYPE, embedMode: EMBED_MODE },
    expires_in_days: 3650,
  });
}

async function syncVenue(dograh: DograhApi, slug: string): Promise<void> {
  log(`venue ${slug}: fetching tenant config`);
  const config = await mimenuGet<SyncVenueConfig>(`/api/concierge/sync?venue=${encodeURIComponent(slug)}`);

  const rendered = renderConcierge(config.venue, config.settings, {
    templateVersion: config.templateVersion,
    publicBaseUrl: config.publicBaseUrl,
  });

  const credentialUuid = await ensureCredential(dograh, slug, config.toolToken, config.agent);
  const toolSpecs = buildTenantTools(rendered, config.publicBaseUrl, credentialUuid);
  const toolUuids = await ensureTools(dograh, toolSpecs);
  const definition = buildWorkflowDefinition(rendered, toolUuids);
  const configHash = stableHash({ config: rendered.configHash, tools: toolSpecs });

  const variantName = `${rendered.venue.name} — Concierge`;
  const workflow = await ensureWorkflow(dograh, variantName, definition, config.agent, configHash);
  const embed = await ensureEmbedToken(dograh, workflow.id);

  if (DRY_RUN) {
    log(`  ${variantName}: config ${configHash}, ${toolUuids.length} tools, credential ${credentialUuid}`);
    return;
  }

  await mimenuPost(`/api/concierge/sync?venue=${encodeURIComponent(slug)}`, {
    agent: {
      workflowId: workflow.id,
      workflowUuid: workflow.uuid,
      credentialUuid,
      toolUuids,
      embedToken: embed.token,
      embedTokenId: embed.id,
      widgetType: WIDGET_TYPE,
      embedMode: EMBED_MODE,
      templateVersion: rendered.templateVersion,
      configHash,
      enabled: config.settings.enabled,
      syncStatus: 'synced',
    },
  });

  log(
    `  ${variantName}: synced (workflow ${workflow.id}, ${toolUuids.length} tools${
      workflow.published ? ', republished' : ''
    })`
  );
}

async function main(): Promise<void> {
  if (DRY_RUN) {
    log(`dry-run against ${DOGRAH_API_URL} / ${MIMENU_URL}`);
  }
  requireEnv();

  const dograh = new DograhApi(DOGRAH_API_URL, DOGRAH_API_TOKEN);
  if (!DRY_RUN) {
    await dograh.get('/api/v1/workflow/fetch');
  }

  const venues = await listEnabledVenues();
  if (!venues.length) {
    log('no enabled venues to sync');
    return;
  }

  let failures = 0;
  for (const venue of venues) {
    try {
      await syncVenue(dograh, venue.slug);
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[dograh:sync] venue ${venue.slug} failed: ${message}`);
    }
  }

  log(`done: ${venues.length - failures}/${venues.length} venues synced`);
  if (failures) process.exitCode = 1;
}

main().catch((error) => {
  console.error('[dograh:sync] fatal:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
