/**
 * Edge-side adapter for `src/data/provisioned_venues.json`.
 *
 * The registry is the canonical tenant source on the public site; importing
 * it here keeps the concierge tools in lockstep with the menu the guest sees.
 */

import registry from '../../src/data/provisioned_venues.json';
import type {
  RegistryVenue,
  RegistryVenueItem,
  VenueMenuItem,
  VenueSnapshot,
} from '../../shared/dograh/types';

const VENUES = registry as unknown as RegistryVenue[];
const DEFAULT_PUBLIC_BASE_URL = 'https://mimenu.clubemkt.digital';

function normalizeSlug(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase();
}

export function findRegistryVenue(slug: string | null | undefined): RegistryVenue | null {
  const key = normalizeSlug(slug);
  if (!key) return null;
  return VENUES.find((venue) => venue.slug?.toLowerCase() === key) ?? null;
}

export function findRegistryVenueById(id: string | null | undefined): RegistryVenue | null {
  const key = (id || '').trim().toLowerCase();
  if (!key) return null;
  return VENUES.find((venue) => venue.id?.toLowerCase() === key) ?? null;
}

export function listActiveVenues(): RegistryVenue[] {
  return VENUES.filter((venue) => venue?.slug && venue.is_active !== false);
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toMenuItem(item: RegistryVenueItem, categoryKey: string, categoryName: string): VenueMenuItem | null {
  const name = typeof item?.name === 'string' ? item.name.trim() : '';
  if (!name) return null;
  const price = Number(item.price);
  return {
    id: item.id,
    name,
    description: typeof item.description === 'string' ? item.description.trim() : '',
    price: Number.isFinite(price) ? price : 0,
    categoryKey,
    categoryName,
    available: item.is_available !== false,
    featured: item.is_featured === true,
    tags: stringList(item.tags),
    allergens: stringList(item.allergens),
    dietary: stringList(item.dietary),
  };
}

export function toVenueSnapshot(item: RegistryVenue): VenueSnapshot {
  const categories: VenueSnapshot['categories'] = [];
  const menuItems: VenueMenuItem[] = [];

  for (const category of item.categories || []) {
    const key = (category.key || category.name || '').trim();
    if (!key) continue;
    const name = category.name_i18n?.es || category.name || key;
    const items = (category.items || [])
      .map((menuItem) => toMenuItem(menuItem, key, name))
      .filter((menuItem): menuItem is VenueMenuItem => !!menuItem);
    categories.push({ key, name, itemCount: items.length });
    menuItems.push(...items);
  }

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    tagline: item.tagline || '',
    description: item.description || '',
    city: item.city || '',
    address: item.address || '',
    phone: item.phone || '',
    whatsapp: item.whatsapp || '',
    currency: item.currency || 'Bs.',
    isActive: item.is_active !== false,
    menuUrl: `/${item.slug}`,
    categories,
    items: menuItems,
  };
}

export function findVenueSnapshot(slug: string | null | undefined): VenueSnapshot | null {
  const venue = findRegistryVenue(slug);
  return venue ? toVenueSnapshot(venue) : null;
}

export function publicBaseUrl(
  env: { MIMENU_PUBLIC_URL?: string },
  request?: Request
): string {
  const configured = (env.MIMENU_PUBLIC_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_PUBLIC_BASE_URL;
}
