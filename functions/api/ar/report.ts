// POST /api/ar/report
// Called by the VPS background worker (vps-worker/index.js) when a task's
// .glb/.usdz files have been downloaded and hosted, or when the pipeline fails.
//
// Auth: Authorization: Bearer <AR_WORKER_TOKEN>
// Body: { taskId, status: 'completed' | 'failed', menuItemId?, glbUrl?, usdzUrl?, thumbnailUrl?, error? }

import {
  getARTask,
  updateMenuItemAR,
  checkWorkerToken,
  json,
  arTaskKey,
  type ARTaskRecord,
} from '../../lib/kv-ar';

interface Env {
  MIMENU_KV?: KVNamespace;
  AR_WORKER_TOKEN?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const authError = checkWorkerToken(request, env);
  if (authError) return authError;
  if (!env.MIMENU_KV) return json({ success: true, orphan: true, error: 'MIMENU_KV not bound; nothing to update.' }, 500);

  let body: {
    taskId?: string;
    menuItemId?: string;
    status?: string;
    glbUrl?: string;
    usdzUrl?: string;
    thumbnailUrl?: string;
    error?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const taskId = body.taskId?.trim();
  const rawStatus = body.status?.trim();
  if (rawStatus !== 'completed' && rawStatus !== 'failed') {
    return json({ error: "taskId and status ('completed' | 'failed') are required." }, 400);
  }
  const status: ARTaskStatus = rawStatus;

  if (status === 'completed' && !body.glbUrl) {
    return json({ error: "status 'completed' requires glbUrl." }, 400);
  }

  const task: ARTaskRecord | null = await getARTask(env, taskId);
  if (task && task.status === 'completed') {
    return json({ success: true, alreadyHandled: true, taskId });
  }

  // 1. Update the queue record (ar_task:{taskId}).
  if (task) {
    task.status = status;
    if (body.glbUrl) task.glb_url = body.glbUrl;
    if (body.usdzUrl) task.usdz_url = body.usdzUrl;
    if (body.thumbnailUrl) task.thumbnail_url = body.thumbnailUrl;
    if (body.error) task.error = body.error;
    task.updatedAt = Date.now();
    await env.MIMENU_KV.put(arTaskKey(taskId), JSON.stringify(task));
  }

  // 2. Update the menu item record (menu_item:{id}).
  const menuItemId = task?.menuItemId || body.menuItemId?.trim();
  if (menuItemId) {
    if (status === 'completed') {
      await updateMenuItemAR(env, menuItemId, {
        ar_status: 'ready',
        task_id: taskId,
        glb_url: body.glbUrl,
        usdz_url: body.usdzUrl,
        thumbnail_url: body.thumbnailUrl,
        error: undefined,
      });
    } else {
      await updateMenuItemAR(env, menuItemId, {
        ar_status: 'failed',
        task_id: taskId,
        error: body.error || 'Asset pipeline failed on VPS worker.',
      });
    }
  }

  return json({ success: true, taskId, ar_status: status === 'completed' ? 'ready' : 'failed' });
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204 });
