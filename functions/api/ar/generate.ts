// POST /api/ar/generate
// Server-action replacement (original PRD: app/actions/generate3D.js -> Next.js).
// Starts a Meshy Image-to-3D task for a menu item, records state in KV,
// and enqueues the asset download job on the VPS background worker.
//
// Body JSON: { menuItemId: string, imageUrl: string, itemName?: string }

import {
  getMenuItemAR,
  updateMenuItemAR,
  setARTask,
  getARTask,
  json,
} from '../../lib/kv-ar';

interface Env {
  MIMENU_KV?: KVNamespace;
  MESHY_API_KEY?: string;
  AR_WORKER_URL?: string;
  AR_WORKER_TOKEN?: string;
  AR_GENERATOR_PROVIDER?: string;
}

const MESHY_IMAGE_TO_3D_URL = 'https://api.meshy.ai/openapi/v1/image-to-3d';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: { menuItemId?: string; imageUrl?: string; itemName?: string };
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body.' }, 400);
  }

  const menuItemId = body.menuItemId?.trim();
  const imageUrl = body.imageUrl?.trim();

  if (!menuItemId || !imageUrl) {
    return json({ success: false, error: 'menuItemId and imageUrl are required.' }, 400);
  }
  try {
    new URL(imageUrl);
  } catch {
    return json({ success: false, error: 'imageUrl must be a valid public URL (JPG/PNG/WebP).', }, 400);
  }

  if (!env.MIMENU_KV) {
    return json({ success: false, error: 'MIMENU_KV namespace not bound. Run: wrangler kv namespace create MIMENU_KV' }, 500);
  }

  try {
    // 0. Guard: refuse to start while another generation is in flight for this item.
    const existingAR = await getMenuItemAR(env, menuItemId);
    if (existingAR?.ar_status === 'generating' && existingAR.task_id) {
      const runningTask = await getARTask(env, existingAR.task_id);
      if (runningTask && (runningTask.status === 'pending' || runningTask.status === 'processing')) {
        return json(
          { success: false, error: 'A 3D generation is already running for this item.', taskId: existingAR.task_id },
          409
        );
      }
    }

    // 1. Kick off generation with the configured backend ('meshy' or 'trellis2').
    //    trellis2: the task is purely queue-side — the VPS worker drives the
    //    TRELLIS.2 backend (Hugging Face Space, or self-hosted GPU box later)
    //    and reports back via /api/ar/report, so no external call happens here.
    const provider: 'meshy' | 'trellis2' =
      (env.AR_GENERATOR_PROVIDER || '').trim().toLowerCase() === 'trellis2' ? 'trellis2' : 'meshy';

    let taskId: string;
    if (provider === 'trellis2') {
      taskId = crypto.randomUUID();
    } else {
      if (!env.MESHY_API_KEY) {
        return json({ success: false, error: 'MESHY_API_KEY is not configured in environment variables.' }, 500);
      }
      const meshyRes = await fetch(MESHY_IMAGE_TO_3D_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.MESHY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          enable_pbr: true,
          target_formats: ['glb', 'usdz'],
        }),
      });

      if (!meshyRes.ok) {
        const errText = await meshyRes.text();
        await updateMenuItemAR(env, menuItemId, { ar_status: 'failed', error: `Meshy API error: ${errText.slice(0, 300)}` });
        return json({ success: false, error: `Meshy API error (${meshyRes.status}): ${errText.slice(0, 300)}` }, 502);
      }

      const meshyJson = (await meshyRes.json()) as { result?: string };
      taskId = meshyJson.result || '';
      if (!taskId) {
        await updateMenuItemAR(env, menuItemId, { ar_status: 'failed', error: 'Meshy did not return a task id.' });
        return json({ success: false, error: 'Meshy did not return a task id.' }, 502);
      }
    }

    // 2. Update KV store with generating state (PRD key schema: menu_item:{id})
    await updateMenuItemAR(env, menuItemId, {
      ar_status: 'generating',
      task_id: taskId,
      glb_url: undefined,
      usdz_url: undefined,
      thumbnail_url: undefined,
      error: undefined,
    });

    // 3. Register the task tracker in KV (PRD key schema: ar_task:{taskId})
    await setARTask(env, taskId, {
      menuItemId,
      imageUrl,
      itemName: body.itemName?.trim() || undefined,
      provider,
      status: 'pending',
    });

    // 4. Enqueue on the VPS worker over HTTP (best-effort). The worker also
    //    self-heals by pulling the KV queue every loop, so an enqueue miss is safe.
    let enqueued = false;
    if (env.AR_WORKER_URL && env.AR_WORKER_TOKEN) {
      try {
        const enqueueRes = await fetch(`${env.AR_WORKER_URL.replace(/\/$/, '')}/enqueue`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.AR_WORKER_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId, menuItemId, imageUrl, itemName: body.itemName, provider }),
        });
        enqueued = enqueueRes.ok;
      } catch (err) {
        console.warn('AR enqueue failed; worker will self-heal by pulling the queue:', err);
      }
    }

    return json({ success: true, taskId, enqueued, ar_status: 'generating' });
  } catch (err) {
    console.error('Failed to start 3D generation:', err);
    try {
      await updateMenuItemAR(env, menuItemId, {
        ar_status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      });
    } catch {
      /* ignore follow-up failures */
    }
    return json({ success: false, error: err instanceof Error ? err.message : 'Unexpected error.' }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204 });
