// POST /api/ar/manual
// Manually register externally-hosted .glb/.usdz assets for a menu item
// (Admin 3D Modal "Manual upload" tab — direct upload to the VPS static
// folder is not possible from the browser, so URLs are recorded in KV).
//
// Body: { menuItemId, glbUrl, usdzUrl?, thumbnailUrl? }
// NOTE: follows the project's existing open-endpoint pattern; tighten with
// session auth if/when a shared middleware lands.

import { updateMenuItemAR, getMenuItemAR, json } from '../../lib/kv-ar';

interface Env {
  MIMENU_KV?: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!env.MIMENU_KV) return json({ success: false, error: 'MIMENU_KV namespace not bound.' }, 500);

  let body: { menuItemId?: string; glbUrl?: string; usdzUrl?: string; thumbnailUrl?: string };
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body.' }, 400);
  }

  const menuItemId = body.menuItemId?.trim();
  const glbUrl = body.glbUrl?.trim();
  if (!menuItemId || !glbUrl) {
    return json({ success: false, error: 'menuItemId and glbUrl are required.' }, 400);
  }

  // Abort if an AI generation is still running.
  const existing = await getMenuItemAR(env, menuItemId);
  if (existing?.ar_status === 'generating') {
    return json({ success: false, error: 'An AI generation is in progress — wait for it to finish.' }, 409);
  }

  await updateMenuItemAR(env, menuItemId, {
    ar_status: 'ready',
    glb_url: glbUrl,
    usdz_url: body.usdzUrl?.trim() || undefined,
    thumbnail_url: body.thumbnailUrl?.trim() || undefined,
    task_id: undefined,
    error: undefined,
  });

  return json({ success: true, ar_status: 'ready' });
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204 });
