/**
 * useARModels — fetches AR/3D records for menu items from the Cloudflare
 * function KV layer (`menu_item:{id}` records via /api/ar/menu-items).
 *
 * Returns a map of menuItemId -> record (null when the item has no AR data).
 */

import { useEffect, useState, useMemo } from 'react';

export type ARStatus = 'none' | 'generating' | 'ready' | 'failed';

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

const BASE = '/api/ar';

/** Memoize an item-id list on its joined value so effects don't fire per render. */
export function useARModelsIds(ids: string[] | undefined | null): string[] | null {
  const joined = ids && ids.length ? ids.join('|') : '';
  return useMemo(() => (joined ? joined.split('|') : null), [joined]);
}

/** Fetch a window of AR records. Pass null to skip (e.g. before ids are known). */
export function useARModels(menuItemIds: string[] | null): Record<string, ARMenuItemRecord | null> {
  const [records, setRecords] = useState<Record<string, ARMenuItemRecord | null>>({});
  // Stable identity across renders: only refetch when the id set changes.
  const idsKey = useMemo(() => (menuItemIds ? menuItemIds.join(',') : ''), [menuItemIds]);
  const ids = useMemo(() => (idsKey ? idsKey.split(',') : null), [idsKey]);

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setRecords({});
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`${BASE}/menu-items?ids=${encodeURIComponent(ids.slice(0, 50).join(','))}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: Record<string, ARMenuItemRecord | null> };
        if (!cancelled) setRecords(data.items || {});
      } catch (err) {
        console.warn('useARModels fetch failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ids]);

  return records;
}

/** Poll a single generation task (used by the admin 3D modal). */
export interface ARTaskStatus {
  taskId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | string;
  ar_status: ARStatus;
  progress: number;
  menuItemId?: string;
  glb_url?: string;
  usdz_url?: string;
  thumbnail_url?: string;
  meshy_glb_url?: string;
  meshy_usdz_url?: string;
  meshy_thumbnail_url?: string;
  error?: string;
}

export function fetchARTaskStatus(taskId: string, signal?: AbortSignal): Promise<ARTaskStatus> {
  return fetch(`${BASE}/status/${taskId}`, { signal }).then((r) => r.json());
}

/** Kick off AI 3D generation via the Cloudflare Function. */
export async function startARGeneration(
  menuItemId: string,
  imageUrl: string,
  itemName?: string
): Promise<{ success: boolean; taskId?: string; enqueued?: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId, imageUrl, itemName }),
    });
    return (await res.json()) as { success: boolean; taskId?: string; enqueued?: boolean; error?: string };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
