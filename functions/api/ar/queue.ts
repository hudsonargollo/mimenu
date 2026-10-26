// /api/ar/queue — VPS worker queue interface.
//
// GET  (Bearer AR_WORKER_TOKEN)   -> lists pending tasks (self-heal pull).
// POST (Bearer AR_WORKER_TOKEN)   -> { action: 'claim', taskId } marks the task
//   as 'processing' in KV so other pulls skip it.

import {
  listARTasks,
  getARTask,
  claimARTask,
  checkWorkerToken,
  json,
} from '../../lib/kv-ar';

interface Env {
  MIMENU_KV?: KVNamespace;
  AR_WORKER_TOKEN?: string;
}

// Tasks older than this never leave the pending list after claim (refresh UI).
const MAX_TASK_AGE_MS = 12 * 60 * 60 * 1000;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const authError = checkWorkerToken(request, env);
  if (authError) return authError;
  if (!env.MIMENU_KV) return json({ error: 'MIMENU_KV namespace not bound.' }, 500);

  let tasks;
  try {
    tasks = await listARTasks(env);
  } catch {
    return json({ error: 'Failed to list tasks from KV.' }, 500);
  }

  const now = Date.now();
  const pending = tasks
    .filter(
      (t) =>
        (t.status === 'pending' || (t.status === 'processing' && t.updatedAt && now - t.updatedAt > 15 * 60 * 1000)) &&
        now - t.createdAt < MAX_TASK_AGE_MS
    )
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, 25);

  return json({ tasks: pending });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const authError = checkWorkerToken(request, env);
  if (authError) return authError;
  if (!env.MIMENU_KV) return json({ error: 'MIMENU_KV namespace not bound.' }, 500);

  let body: { action?: string; taskId?: string; menuItemId?: string; imageUrl?: string; itemName?: string; provider?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  if (body.action === 'claim') {
    if (!body.taskId) return json({ error: 'taskId required for claim.' }, 400);
    const claimed = await claimARTask(env, body.taskId);
    if (!claimed && body.menuItemId && body.imageUrl) {
      // Orphan claim (task key missing, e.g. KV eviction): re-register it.
      await setTaskPending(env, body.taskId, body.menuItemId, body.imageUrl, body.itemName, body.provider);
      return json({ claimed: false, requeued: true, taskId: body.taskId });
    }
    return json({ claimed: !!claimed, taskId: body.taskId, task: claimed });
  }

  if (body.action === 'enqueue') {
    let taskId = body.taskId?.trim() || crypto.randomUUID();
    if (!body.menuItemId || !body.imageUrl) return json({ error: 'menuItemId and imageUrl required.' }, 400);
    const existing = await getARTask(env, taskId);
    if (existing && (existing.status === 'completed' || existing.status === 'processing')) {
      return json({ success: true, taskId, alreadyRegistered: true });
    }
    await setTaskPending(env, taskId, body.menuItemId, body.imageUrl, body.itemName, body.provider);
    return json({ success: true, taskId });
  }

  return json({ error: "action must be 'claim' or 'enqueue'." }, 400);
};

async function setTaskPending(
  env: { MIMENU_KV?: KVNamespace },
  taskId: string,
  menuItemId: string,
  imageUrl: string,
  itemName?: string,
  provider?: string
) {
  const { setARTask } = await import('../../lib/kv-ar');
  await setARTask(env, taskId, {
    menuItemId,
    imageUrl,
    itemName,
    /** Provider preserved for re-registered (KV-evicted) tasks; unknown provider falls back to meshy for legacy tasks. */
    provider: provider === 'trellis2' ? 'trellis2' : provider === 'meshy' ? 'meshy' : undefined,
    status: 'pending',
  });
}

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204 });
