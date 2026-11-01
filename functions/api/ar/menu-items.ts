// GET /api/ar/menu-items?ids=a,b,c (max 50)
// Batch AR records for menu items — used by the customer menu page to render
// "View in 3D/AR" chips in a single round-trip.

import { getMenuItemAR, json, type ARMenuItemRecord } from '../../lib/kv-ar';
import { requireEntitlement, venueSlugFromRequest } from '../../lib/plans';

interface Env {
  MIMENU_KV?: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids') || '';
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 50);

  if (ids.length === 0) {
    return json({ error: 'Provide ?ids=a,b,c (max 50 UUIDs).' }, 400);
  }

  const planCheck = requireEntitlement(venueSlugFromRequest(request), 'ar_3d');
  if (!planCheck.ok) return planCheck.response;

  let items: Record<string, ARMenuItemRecord | null>;
  try {
    items = {};
    for (const id of ids) {
      items[id] = await getMenuItemAR(env, id);
    }
  } catch {
    return json({ error: 'MIMENU_KV namespace not bound.' }, 500);
  }

  return json({ items });
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204 });
