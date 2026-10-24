// GET /api/ar/status/:taskId
// Status endpoint the admin 3D modal polls. Merges the KV task record with a
// live Meshy status lookup so progress is visible even while the VPS worker
// has not yet reported back.
//
// Response: {
//   taskId, status,            // live status: PENDING | IN_PROGRESS | SUCCEEDED | FAILED
//   ar_status,                 // menu-item status: none | generating | ready | failed
//   progress,                  // Meshy progress 0-100 (when available)
//   glb_url, usdz_url, thumbnail_url,
//   meshy_glb_url, meshy_usdz_url,  // fallback render URLs (signed, temporary)
//   error
// }

import { getARTask, updateMenuItemAR, json } from '../../../lib/kv-ar';

interface Env {
  MIMENU_KV?: KVNamespace;
  MESHY_API_KEY?: string;
}

interface MeshyTask {
  status?: string;
  progress?: number;
  task_error?: { message?: string };
  model_urls?: { glb?: string; usdz?: string };
  thumbnail_url?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const taskId = (context.params as { taskId?: string }).taskId;
  if (!taskId) return json({ error: 'Task not found.' }, 404);

  let task;
  try {
    task = await getARTask(env, taskId);
  } catch {
    return json({ error: 'MIMENU_KV namespace not bound.' }, 500);
  }
  if (!task) return json({ error: 'Task not found.' }, 404);

  // Live Meshy view while the queue entry is still open (progress bar support).
  let meshy: MeshyTask | null = null;
  if (env.MESHY_API_KEY && (task.status === 'pending' || task.status === 'processing')) {
    try {
      const res = await fetch(`https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${env.MESHY_API_KEY}` },
      });
      if (res.ok) meshy = (await res.json()) as MeshyTask;
      if (meshy?.status === 'FAILED' || meshy?.status === 'CANCELED') {
        // Persist the failure so the modal stops polling.
        task.status = 'failed';
        task.error = meshy.task_error?.message || 'Meshy task failed.';
        task.updatedAt = Date.now();
        await updateMenuItemAR(env, task.menuItemId, { ar_status: 'failed', error: task.error });
      }
    } catch (err) {
      console.warn('Meshy status proxy failed:', err);
    }
  }

  const ready = task.status === 'completed' && !!task.glb_url;
  const queueFailed = task.status === 'failed';
  const meshyFailed = meshy?.status === 'FAILED' || meshy?.status === 'CANCELED';
  const queueLive =
    task.status === 'completed' ? 'SUCCEEDED' : task.status === 'failed' ? 'FAILED' : 'IN_PROGRESS';
  const liveStatus = ready ? 'SUCCEEDED' : queueFailed || meshyFailed ? 'FAILED' : meshy?.status || queueLive;

  return json({
    taskId,
    status: liveStatus,
    ar_status: ready ? 'ready' : queueFailed || meshyFailed ? 'failed' : 'generating',
    progress: meshy?.progress ?? (ready ? 100 : 0),
    menuItemId: task.menuItemId,
    glb_url: task.glb_url,
    usdz_url: task.usdz_url,
    thumbnail_url: task.thumbnail_url,
    meshy_glb_url: meshy?.model_urls?.glb,
    meshy_usdz_url: meshy?.model_urls?.usdz,
    meshy_thumbnail_url: meshy?.thumbnail_url,
    error: task.error || (meshyFailed ? meshy?.task_error?.message : undefined),
  });
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204 });
