import { describe, expect, it } from 'vitest';
import { onRequestGet as menuGet } from '../../functions/api/concierge/menu';
import { onRequestGet as venueInfoGet } from '../../functions/api/concierge/venue-info';
import { onRequestGet as faqGet } from '../../functions/api/concierge/faq';
import { onRequestPost as reservationPost } from '../../functions/api/concierge/reservations';
import { onRequestGet as agentGet } from '../../functions/api/concierge/agent';
import { onRequestGet as settingsGet, onRequestPut as settingsPut } from '../../functions/api/concierge/settings';
import { onRequestGet as syncGet, onRequestPost as syncPost } from '../../functions/api/concierge/sync';
import { createConciergeToolToken } from '../../functions/lib/concierge-tool-token';
import { createAppSessionToken } from '../../functions/lib/app-session';
import { findVenueSnapshot } from '../../functions/lib/venue-registry';
import { normalizeSettings } from '../../shared/dograh/persona';
import type { ConciergeAgentRecord } from '../../shared/dograh/types';

const TOOL_SECRET = 'test-concierge-tool-secret';
const APP_SECRET = 'test-app-session-secret';
const SYNC_SECRET = 'test-sync-secret';
const BASE = 'https://mimenu.clubemkt.digital';

interface MemoryKV {
  map: Map<string, string>;
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    cursor?: string;
  }>;
}

function memoryKV(): MemoryKV {
  const map = new Map<string, string>();
  return {
    map,
    async get(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    async put(key, value) {
      map.set(key, value);
    },
    async list(options = {}) {
      const prefix = options.prefix || '';
      return {
        keys: Array.from(map.keys())
          .filter((key) => key.startsWith(prefix))
          .map((name) => ({ name })),
      };
    },
  };
}

const venue = findVenueSnapshot('jaleo')!;

function seedSettings(kv: MemoryKV, overrides: Record<string, unknown> = {}) {
  const settings = normalizeSettings({ enabled: true, ...overrides } as never, venue);
  kv.map.set(`concierge:settings:${venue.id}`, JSON.stringify(settings));
  return settings;
}

function seedAgent(kv: MemoryKV) {
  const agent: ConciergeAgentRecord = {
    venueId: venue.id,
    venueSlug: venue.slug,
    enabled: true,
    workflowId: 7,
    workflowUuid: 'workflow-uuid-1234',
    credentialUuid: 'credential-uuid-1',
    toolUuids: ['tool-uuid-1234'],
    embedToken: 'embed-token-12345',
    embedTokenId: 3,
    widgetType: 'chat',
    embedMode: 'floating',
    templateVersion: '2026-11-03.1',
    configHash: 'abcdef1234567890',
    syncedAt: '2026-11-03T12:00:00.000Z',
    syncStatus: 'synced',
  };
  kv.map.set(`concierge:agent:${venue.id}`, JSON.stringify(agent));
  return agent;
}

async function toolToken(
  slug = venue.slug,
  venueId = venue.id,
  scope: Array<'menu' | 'venue' | 'faq' | 'reservation'> = [
    'menu',
    'venue',
    'faq',
    'reservation',
  ]
) {
  return createConciergeToolToken(TOOL_SECRET, { venueId, venueSlug: slug, scope });
}

async function toolRequest(path: string, init: RequestInit = {}) {
  const token = await toolToken();
  return new Request(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

function jsonRequest(path: string, method: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function todayInBolivia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

describe('menu tool', () => {
  it('searches the tenant menu by category and price', async () => {
    const kv = memoryKV();
    const response = await menuGet({
      request: await toolRequest('/api/concierge/menu?category=pastas&max_price=100'),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.venue.slug).toBe('jaleo');
    expect(body.mode).toBe('search');
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item: { category_key: string; price: number }) => item.category_key === 'pastas')).toBe(true);
    expect(body.items.every((item: { price: number }) => item.price <= 100)).toBe(true);
  });

  it('returns categories plus featured dishes for an unfiltered overview', async () => {
    const kv = memoryKV();
    const response = await menuGet({
      request: await toolRequest('/api/concierge/menu'),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(body.mode).toBe('overview');
    expect(body.categories.length).toBe(venue.categories.length);
    expect(body.items.length).toBeLessThanOrEqual(8);
    expect(body.items.every((item: { featured: boolean }) => item.featured)).toBe(true);
  });

  it('rejects a token without the menu scope and a token from another venue', async () => {
    const kv = memoryKV();
    const venueOnly = await createConciergeToolToken(TOOL_SECRET, {
      venueId: venue.id,
      venueSlug: venue.slug,
      scope: ['venue'],
    });
    const wrongVenue = await createConciergeToolToken(TOOL_SECRET, {
      venueId: venue.id,
      venueSlug: 'aberdeen-alley',
    });

    const first = await menuGet({
      request: new Request(`${BASE}/api/concierge/menu`, { headers: { Authorization: `Bearer ${venueOnly}` } }),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const second = await menuGet({
      request: new Request(`${BASE}/api/concierge/menu`, { headers: { Authorization: `Bearer ${wrongVenue}` } }),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });

    expect(first.status).toBe(403);
    expect(second.status).toBe(401);
  });

  it('fails closed when the tool secret is missing', async () => {
    const response = await menuGet({
      request: await toolRequest('/api/concierge/menu'),
      env: { MIMENU_KV: memoryKV() },
    });
    expect(response.status).toBe(503);
  });
});

describe('venue-info tool', () => {
  it('returns contact data, hours and the public menu url', async () => {
    const kv = memoryKV();
    seedSettings(kv, { hours: [{ days: 'Lun-Dom', open: '12:00', close: '23:30' }] });

    const response = await venueInfoGet({
      request: await toolRequest('/api/concierge/venue-info'),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.venue.name).toBe('Jaleo');
    expect(body.venue.menu_url).toBe(`${BASE}/jaleo`);
    expect(body.venue.maps_url).toContain('google.com/maps');
    expect(body.hours_summary).toContain('Lun-Dom: 12:00–23:30');
  });
});

describe('faq tool', () => {
  it('returns a curated answer when the question matches', async () => {
    const kv = memoryKV();
    seedSettings(kv, {
      faq: [
        {
          id: 'delivery',
          question: '¿Hacen delivery?',
          answer: 'Sí, delivery propio en un radio de 5 km.',
          tags: ['delivery', 'envio'],
        },
      ],
    });

    const response = await faqGet({
      request: await toolRequest('/api/concierge/faq?query=Hacen%20delivery%20a%20mi%20zona%3F'),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(body.found).toBe(true);
    expect(body.matches[0].answer).toContain('delivery propio');
    expect(body.matches[0].source).toBe('local');
  });

  it('returns no matches instead of guessing', async () => {
    const kv = memoryKV();
    seedSettings(kv);

    const response = await faqGet({
      request: await toolRequest('/api/concierge/faq?query=aceptan%20bitcoin'),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(body.found).toBe(false);
    expect(body.matches).toEqual([]);
    expect(body.suggestion).toContain('no tenés ese dato');
  });
});

describe('reservation tool', () => {
  it('stores a pending reservation and deduplicates retries', async () => {
    const kv = memoryKV();
    seedSettings(kv);
    const body = {
      name: 'Ana Pérez',
      phone: '+591 70000001',
      party_size: 4,
      date: todayInBolivia(),
      time: '20:30',
      notes: 'Mesa junto a la ventana',
      lang: 'es',
      idempotency_key: 'conversation-abc-123',
    };

    const first = await reservationPost({
      request: await toolRequest('/api/concierge/reservations', { method: 'POST', body: JSON.stringify(body) }),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const firstBody = await first.json();

    const second = await reservationPost({
      request: await toolRequest('/api/concierge/reservations', { method: 'POST', body: JSON.stringify(body) }),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const secondBody = await second.json();

    expect(first.status).toBe(200);
    expect(firstBody.ok).toBe(true);
    expect(firstBody.status).toBe('pending');
    expect(secondBody.duplicate).toBe(true);
    expect(secondBody.id).toBe(firstBody.id);

    const stored = Array.from(kv.map.keys()).filter((key) =>
      /^concierge:reservation:venue-jaleo:\d{13}:/.test(key)
    );
    expect(stored).toHaveLength(1);
  });

  it('rejects parties above the configured maximum', async () => {
    const kv = memoryKV();
    seedSettings(kv, { maxPartySize: 6 });

    const response = await reservationPost({
      request: await toolRequest('/api/concierge/reservations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Ana Pérez',
          phone: '+591 70000001',
          party_size: 7,
          date: todayInBolivia(),
          time: '20:30',
        }),
      }),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'La cantidad de personas debe ser entre 1 y 6.' });
  });

  it('rejects a past date', async () => {
    const kv = memoryKV();
    seedSettings(kv);

    const response = await reservationPost({
      request: await toolRequest('/api/concierge/reservations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Ana Pérez',
          phone: '+591 70000001',
          party_size: 2,
          date: '2020-01-01',
          time: '20:30',
        }),
      }),
      env: { CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });

    expect(response.status).toBe(400);
  });
});

describe('public agent config', () => {
  it('stays disabled until the tenant is enabled and synced', async () => {
    const kv = memoryKV();
    const response = await agentGet({
      request: new Request(`${BASE}/api/concierge/agent?venue=jaleo`),
      env: { MIMENU_KV: kv },
    });
    const body = await response.json();
    expect(body.enabled).toBe(false);
    expect(body.reason).toBe('disabled');
  });

  it('returns the embed widget config for an enabled tenant', async () => {
    const kv = memoryKV();
    seedSettings(kv, { enabled: true });
    seedAgent(kv);

    const response = await agentGet({
      request: new Request(`${BASE}/api/concierge/agent?venue=jaleo`),
      env: { MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.enabled).toBe(true);
    expect(body.venue.slug).toBe('jaleo');
    expect(body.widget.token).toBe('embed-token-12345');
    expect(body.widget.scriptUrl).toContain('https://voice.clubemkt.digital/embed/dograh-widget.js');
    expect(body.widget.scriptUrl).toContain('token=embed-token-12345');
  });
});

describe('admin settings', () => {
  it('reads and writes settings for the admin tenant', async () => {
    const kv = memoryKV();
    const admin = await createAppSessionToken(APP_SECRET, 'admin@jaleo.com', 'admin');
    const env = { MIMENU_KV: kv, APP_SESSION_SECRET: APP_SECRET };

    const read = await settingsGet({
      request: new Request(`${BASE}/api/concierge/settings?venue=jaleo`, {
        headers: { Authorization: `Bearer ${admin}` },
      }),
      env,
    });
    const readBody = await read.json();
    expect(read.status).toBe(200);
    expect(readBody.settings.enabled).toBe(false);
    expect(readBody.agent).toBeNull();

    const write = await settingsPut({
      request: jsonRequest(
        '/api/concierge/settings?venue=jaleo',
        'PUT',
        { settings: { enabled: true, assistantName: 'Host de Jaleo', maxPartySize: 8 } },
        { Authorization: `Bearer ${admin}` }
      ),
      env,
    });
    const writeBody = await write.json();

    expect(write.status).toBe(200);
    expect(writeBody.needs_sync).toBe(true);
    expect(writeBody.settings.enabled).toBe(true);
    expect(writeBody.settings.assistantName).toBe('Host de Jaleo');
    expect(writeBody.settings.maxPartySize).toBe(8);
    expect(kv.map.has(`concierge:settings:${venue.id}`)).toBe(true);
  });

  it('rejects non-admin sessions', async () => {
    const kv = memoryKV();
    const waiter = await createAppSessionToken(APP_SECRET, 'mozo@jaleo.com', 'waiter');

    const response = await settingsGet({
      request: new Request(`${BASE}/api/concierge/settings?venue=jaleo`, {
        headers: { Authorization: `Bearer ${waiter}` },
      }),
      env: { MIMENU_KV: kv, APP_SESSION_SECRET: APP_SECRET },
    });

    expect(response.status).toBe(403);
  });
});

describe('sync endpoint', () => {
  it('requires the sync secret', async () => {
    const response = await syncGet({
      request: new Request(`${BASE}/api/concierge/sync?venue=jaleo`),
      env: { CONCIERGE_SYNC_SECRET: SYNC_SECRET, CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: memoryKV() },
    });
    expect(response.status).toBe(401);
  });

  it('hands the script a verifiable tenant token', async () => {
    const kv = memoryKV();
    const response = await syncGet({
      request: new Request(`${BASE}/api/concierge/sync?venue=jaleo`, {
        headers: { 'x-concierge-sync-secret': SYNC_SECRET },
      }),
      env: { CONCIERGE_SYNC_SECRET: SYNC_SECRET, CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.venue.slug).toBe('jaleo');
    expect(body.publicBaseUrl).toBe(BASE);
    expect(body.toolToken.split('.')).toHaveLength(3);
  });

  it('lists only venues that have a settings record', async () => {
    const kv = memoryKV();
    seedSettings(kv, { enabled: true });

    const response = await syncGet({
      request: new Request(`${BASE}/api/concierge/sync`, {
        headers: { 'x-concierge-sync-secret': SYNC_SECRET },
      }),
      env: { CONCIERGE_SYNC_SECRET: SYNC_SECRET, CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(body.venues).toHaveLength(1);
    expect(body.venues[0].slug).toBe('jaleo');
    expect(body.venues[0].enabled).toBe(true);
  });

  it('stores the Dograh mapping after a sync', async () => {
    const kv = memoryKV();
    const response = await syncPost({
      request: jsonRequest(
        '/api/concierge/sync?venue=jaleo',
        'POST',
        {
          agent: {
            workflowId: 7,
            workflowUuid: 'workflow-uuid-1234',
            credentialUuid: 'credential-uuid-1',
            toolUuids: ['tool-uuid-1234'],
            embedToken: 'embed-token-12345',
            embedTokenId: 3,
            widgetType: 'chat',
            embedMode: 'floating',
            templateVersion: '2026-11-03.1',
            configHash: 'abcdef1234567890',
            enabled: true,
            syncStatus: 'synced',
          },
        },
        { 'x-concierge-sync-secret': SYNC_SECRET }
      ),
      env: { CONCIERGE_SYNC_SECRET: SYNC_SECRET, CONCIERGE_TOOL_SECRET: TOOL_SECRET, MIMENU_KV: kv },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.agent.venueId).toBe(venue.id);
    expect(body.agent.workflowId).toBe(7);
    expect(kv.map.has(`concierge:agent:${venue.id}`)).toBe(true);
  });
});
