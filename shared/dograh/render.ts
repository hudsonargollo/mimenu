/**
 * Compile one venue + its settings into the exact agent configuration the
 * sync script pushes to Dograh.
 */

import { buildGreeting, buildSystemPrompt, normalizeSettings, toolNamesFor } from './persona.ts';
import { TEMPLATE_VERSION, stableHash } from './template-version.ts';
import type { ConciergeSettings, RenderedConcierge, VenueSnapshot } from './types.ts';

export interface RenderOptions {
  templateVersion?: string;
  /** Public MiMenu origin, used to make the menu link absolute. */
  publicBaseUrl?: string;
}

function absoluteMenuUrl(venue: VenueSnapshot, publicBaseUrl?: string): string {
  const raw = venue.menuUrl || `/${venue.slug}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = (publicBaseUrl || '').trim();
  if (!base) return raw;
  try {
    return new URL(raw, base.endsWith('/') ? base : `${base}/`).toString();
  } catch {
    return raw;
  }
}

export function renderConcierge(
  venue: VenueSnapshot,
  rawSettings: Partial<ConciergeSettings> | null | undefined,
  options: RenderOptions = {}
): RenderedConcierge {
  const templateVersion = options.templateVersion || TEMPLATE_VERSION;
  const settings = normalizeSettings(rawSettings, venue);
  const toolNames = toolNamesFor(venue.slug);
  const menuUrl = absoluteMenuUrl(venue, options.publicBaseUrl);
  const prompt = buildSystemPrompt(venue, settings, toolNames, menuUrl);
  const greeting = buildGreeting(settings);

  const { updatedAt: _updatedAt, updatedBy: _updatedBy, ...hashableSettings } = settings;
  const configHash = stableHash({
    templateVersion,
    prompt,
    greeting,
    menuUrl,
    toolNames,
    venue: {
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      city: venue.city,
      currency: venue.currency,
      categories: venue.categories,
    },
    settings: hashableSettings,
  });

  return {
    templateVersion,
    configHash,
    prompt,
    greeting,
    menuUrl,
    toolNames,
    venue,
    settings,
  };
}
