import { clientIp, isRateLimited } from '../../lib/rate-limit';
import { readAgent, readSettings } from '../../lib/concierge-settings';
import type { KVLike } from '../../lib/concierge-settings';
import { findVenueSnapshot } from '../../lib/venue-registry';

interface Env {
  MIMENU_KV?: KVLike;
  DOGRAH_PUBLIC_URL?: string;
  DOGRAH_ENVIRONMENT?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function widgetEndpoint(env: Env): string {
  return (env.DOGRAH_PUBLIC_URL || 'https://voice.clubemkt.digital').replace(/\/+$/, '');
}

/**
 * GET /api/concierge/agent?venue=<slug>
 * Public widget configuration. Only returns the embed token, never the prompt
 * or the internal workflow mapping.
 */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const slug = (url.searchParams.get('venue') || url.searchParams.get('v') || '').trim().toLowerCase();
  if (!slug) return json({ enabled: false, error: 'venue_required' }, 400);

  if (isRateLimited(`concierge-agent:${clientIp(request)}`, 120, 60 * 1000)) {
    return json({ enabled: false, error: 'rate_limited' }, 429);
  }

  const venue = findVenueSnapshot(slug);
  if (!venue || !venue.isActive) return json({ enabled: false, reason: 'unknown_venue' });

  const [settings, agent] = await Promise.all([readSettings(env, venue), readAgent(env, venue.id)]);
  const ready = Boolean(settings.enabled && agent && agent.syncStatus === 'synced' && agent.embedToken && agent.workflowId > 0);

  if (!ready) {
    return json({
      enabled: false,
      venue: { slug: venue.slug, name: venue.name },
      reason: settings.enabled ? 'not_synced' : 'disabled',
    });
  }

  const endpoint = widgetEndpoint(env);
  const widgetEnvironment = env.DOGRAH_ENVIRONMENT || 'production';
  const params = new URLSearchParams({
    token: agent!.embedToken,
    environment: widgetEnvironment,
    apiEndpoint: endpoint,
  });

  return json({
    enabled: true,
    venue: { slug: venue.slug, name: venue.name, city: venue.city },
    assistant: {
      name: settings.assistantName,
      greeting: settings.greeting,
      languages: settings.languages,
      tone: settings.tone,
    },
    widget: {
      type: agent!.widgetType || 'chat',
      mode: agent!.embedMode || 'floating',
      token: agent!.embedToken,
      apiEndpoint: endpoint,
      environment: widgetEnvironment,
      scriptUrl: `${endpoint}/embed/dograh-widget.js?${params.toString()}`,
    },
    updatedAt: agent!.syncedAt,
  });
};
