// GET /api/ar/menu-item/:menuItemId
// Public AR record for a single menu item (customer/admin read path).
// Returns 200 with { menuItemId, ar_status: 'none' } when nothing exists yet.

import { getMenuItemAR, json, type ARMenuItemRecord } from '../../../lib/kv-ar';

interface Env {
  MIMENU_KV?: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const menuItemId = (context.params as { menuItemId?: string }).menuItemId;
  if (!menuItemId) return json({ error: 'menuItemId path param required.' }, 400);

  let record: ARMenuItemRecord | null = null;
  try {
    record = await getMenuItemAR(env, menuItemId);
  } catch {
    return json({ error: 'MIMENU_KV namespace not bound.' }, 500);
  }

  return json({
    menuItemId,
    ...(record || { ar_status: 'none' as const, updatedAt: 0 }),
  });
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204 });
