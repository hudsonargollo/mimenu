// KV helpers for the WebAR / AI 3D generation pipeline (mimenu.clubemkt.digital)
//
// Adapted from the original PRD (which assumed @vercel/kv + Redis). This stack is
// Cloudflare Workers KV bound as `MIMENU_KV` (see functions/lib/kv-storage.ts).
//
// Keys (same schema as the PRD):
//   menu_item:{id}  -> JSON { menu_item_id, ar_status, task_id, glb_url, usdz_url, thumbnail_url, updatedAt }
//   ar_task:{taskId} -> JSON { taskId, menuItemId, imageUrl, status, createdAt, updatedAt, ... }

import { createKVStorage, type KVStorage } from './kv-storage';

export type ARStatus = 'none' | 'generating' | 'ready' | 'failed';
export type ARTaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';

export interface ARMenuItemRecord {
  menu_item_id: string;
  ar_status: ARStatus;
  task_id?: string;
  glb_url?: string;
  usdz_url?: string;
  thumbnail_url?: string;
  error?: string;
  updatedAt: number;
}

export interface ARTaskRecord {
  taskId: string;
  menuItemId: string;
  imageUrl: string;
  itemName?: string;
  status: ARTaskStatus;
  createdAt: number;
  updatedAt?: number;
  claimedAt?: number;
  glb_url?: string;
  usdz_url?: string;
  thumbnail_url?: string;
  error?: string;
}

export const menuItemKey = (menuItemId: string) => `menu_item:${menuItemId}`;
export const arTaskKey = (taskId: string) => `ar_task:${taskId}`;

function storage(env: { MIMENU_KV?: Parameters<typeof createKVStorage>[0]['MIMENU_KV'] }): KVStorage {
  return createKVStorage(env as { MIMENU_KV?: KVNamespace });
}

/** Read the AR metadata block for a menu item. Returns null when none exists. */
export async function getMenuItemAR(env: Parameters<typeof storage>[0], menuItemId: string): Promise<ARMenuItemRecord | null> {
  const kv = storage(env);
  const raw = await kv_.get(kv, menuItemKey(menuItemId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ARMenuItemRecord;
  } catch {
    return null;
  }
}

/** Merge-AR fields onto the `menu_item:{id}` record. */
export async function updateMenuItemAR(
  env: Parameters<typeof storage>[0],
  menuItemId: string,
  data: Partial<ARMenuItemRecord>
): Promise<ARMenuItemRecord> {
  const kv = storage(env);
  const existing = await getMenuItemAR(env, menuItemId);
  const updated: ARMenuItemRecord = {
    ...existing,
    menu_item_id: menuItemId,
    ar_status: existing?.ar_status ?? 'none',
    ...data,
    updatedAt: Date.now(),
  };
  await kv.put(menuItemKey(menuItemId), JSON.stringify(updated));
  return updated;
}

/** Create/overwrite an AR task record (the worker's queue entry). */
export async function setARTask(
  env: Parameters<typeof storage>[0],
  taskId: string,
  data: Omit<Partial<ARTaskRecord>, 'taskId'> & { menuItemId: string; imageUrl: string }
): Promise<ARTaskRecord> {
  const kv = storage(env);
  const record: ARTaskRecord = {
    status: 'pending',
    ...data,
    taskId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await kv.put(arTaskKey(taskId), JSON.stringify(record));
  return record;
}

export async function getARTask(env: Parameters<typeof storage>[0], taskId: string): Promise<ARTaskRecord | null> {
  const kv = storage(env);
  const raw = await kv.get(arTaskKey(taskId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ARTaskRecord;
  } catch {
    return null;
  }
}

/** List every AR task record (used by the VPS worker pull/self-heal endpoint). */
export async function listARTasks(env: Parameters<typeof storage>[0]): Promise<ARTaskRecord[]> {
  const kv = storage(env);
  const keys = await listKeysWith(kv, 'ar_task:');
  const tasks: ARTaskRecord[] = [];
  for (const key of keys) {
    const raw = await kv.get(key);
    if (!raw) continue;
    try {
      tasks.push(JSON.parse(raw) as ARTaskRecord);
    } catch {
      /* ignore malformed records */
    }
  }
  return tasks;
}

/** Mark a task as claimed by the worker (prevents double processing after queue re-pull). */
export async function claimARTask(env: Parameters<typeof storage>[0], taskId: string): Promise<ARTaskRecord | null> {
  const task = await getARTask(env, taskId);
  if (!task) return null;
  task.status = 'processing';
  task.claimedAt = Date.now();
  task.updatedAt = task.claimedAt;
  const kv = storage(env);
  await kv.put(arTaskKey(taskId), JSON.stringify(task));
  await updateMenuItemAR(env, task.menuItemId, { ar_status: 'generating', task_id: taskId });
  return task;
}

// Small helpers on top of the existing adapter -------------------------------

async function kv_get(kv: KVStorage, key: string): Promise<string | null> {
  return await kv.get(key);
}

async function listKeysWith(kv: KVStorage, prefix: string): Promise<string[]> {
  const names = await kv.list(prefix);
  return names;
}

// Named re-exports so call sites read naturally ------------------------------
const kv_ = { get: kv_get };

/** Shared bearer-token guard for worker/admin-protected AR endpoints. */
export function checkWorkerToken(request: Request, env: { AR_WORKER_TOKEN?: string }): Response | null {
  if (!env.AR_WORKER_TOKEN) {
    return json({ error: 'AR_WORKER_TOKEN is not configured in environment variables.' }, 500);
  }
  const header = request.headers.get('authorization') || '';
  const expected = `Bearer ${env.AR_WORKER_TOKEN}`;
  if (header !== expected) {
    return json({ error: 'Unauthorized' }, 401);
  }
  return null;
}

export function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
