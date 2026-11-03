import { clientIp, isRateLimited } from '../../lib/rate-limit';
import { requireConciergeTool } from '../../lib/concierge-tool-auth';
import { matchesAllTokens, normalizeText, tokenize } from '../../lib/concierge-text';
import type { VenueMenuItem } from '../../../shared/dograh/types';

interface Env {
  CONCIERGE_TOOL_SECRET?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const clampInt = (value: string | null, fallback: number, min: number, max: number): number => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};

function present(item: VenueMenuItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description.slice(0, 240),
    price: item.price,
    category: item.categoryName,
    category_key: item.categoryKey,
    available: item.available,
    featured: item.featured,
    tags: item.tags.slice(0, 8),
    allergens: item.allergens.slice(0, 8),
    dietary: item.dietary.slice(0, 8),
  };
}

/**
 * GET /api/concierge/menu
 * Tenant-scoped menu search for the Dograh agent. Without filters it returns
 * the category list plus featured dishes instead of the whole carta.
 */
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const auth = await requireConciergeTool(request, env, 'menu');
  if (auth instanceof Response) return auth;

  const rateKey = `concierge-menu:${auth.claims.vid}:${clientIp(request)}`;
  if (isRateLimited(rateKey, 60, 60 * 1000)) {
    return json({ error: 'Demasiadas búsquedas. Esperá un momento.' }, 429);
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get('query') || '').trim().slice(0, 120);
  const categoryFilter = normalizeText((url.searchParams.get('category') || '').slice(0, 60));
  const featuredOnly = ['true', '1', 'si', 'sí'].includes(
    (url.searchParams.get('featured_only') || '').toLowerCase()
  );
  const maxPriceRaw = Number(url.searchParams.get('max_price'));
  const maxPrice = Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? maxPriceRaw : null;
  const limit = clampInt(url.searchParams.get('limit'), 20, 1, 50);
  const tokens = tokenize(query);

  const matchesCategory = (item: VenueMenuItem) => {
    if (!categoryFilter) return true;
    return (
      normalizeText(item.categoryKey) === categoryFilter ||
      normalizeText(item.categoryName) === categoryFilter ||
      normalizeText(item.categoryName).includes(categoryFilter)
    );
  };

  const matchesQuery = (item: VenueMenuItem) => {
    if (!tokens.length) return true;
    const haystack = normalizeText(
      [item.name, item.description, item.categoryName, ...item.tags, ...item.allergens, ...item.dietary].join(' ')
    );
    return matchesAllTokens(haystack, tokens);
  };

  const isSearch = Boolean(tokens.length || categoryFilter || featuredOnly || maxPrice);

  let items = auth.venue.items
    .filter((item) => item.available && matchesCategory(item) && matchesQuery(item))
    .filter((item) => (featuredOnly ? item.featured : true))
    .filter((item) => (maxPrice === null ? true : item.price <= maxPrice));

  if (!isSearch) {
    const featured = items.filter((item) => item.featured);
    items = (featured.length ? featured : items).slice(0, 8);
  }

  const totalMatches = isSearch ? items.length : auth.venue.items.filter((item) => item.available).length;
  const limited = items.slice(0, limit);

  return json({
    venue: { slug: auth.venue.slug, name: auth.venue.name, currency: auth.venue.currency },
    mode: isSearch ? 'search' : 'overview',
    query: query || null,
    category: categoryFilter || null,
    categories: auth.venue.categories,
    items: limited.map(present),
    count: limited.length,
    total_matches: totalMatches,
    truncated: totalMatches > limited.length,
  });
};
