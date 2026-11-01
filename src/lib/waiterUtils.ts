import { adminFetch, AppSessionError } from "@/lib/appSession";

export interface WaiterInfo {
  id: string;
  full_name: string;
  email: string;
  display_name?: string;
}

interface PublicWaiter {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  created_at?: string;
}

// Cache for waiter information to avoid repeated API calls
const waiterCache = new Map<string, WaiterInfo>();

/**
 * Fetch waiter information by ID, falling back to the shared registry.
 * Uses caching to minimize API calls.
 */
export async function fetchWaiterInfo(waiterId: string): Promise<WaiterInfo | null> {
  if (waiterCache.has(waiterId)) {
    return waiterCache.get(waiterId)!;
  }

  await fetchAllWaiters();
  return waiterCache.get(waiterId) ?? null;
}

/**
 * Fetch the waiter registry from the Pages API and cache the result.
 * Returns an empty list when the current session cannot read the registry.
 */
export async function fetchAllWaiters(): Promise<WaiterInfo[]> {
  try {
    const response = await adminFetch("/api/waiters/list-waiters", {
      method: "POST",
    });
    if (!response.ok) return [];

    const data = (await response.json()) as { waiters?: PublicWaiter[] };
    const waiters = (data.waiters ?? []).map((waiter) => ({
      id: waiter.id,
      full_name: waiter.full_name,
      email: waiter.email,
    }));

    waiters.forEach((waiter) => waiterCache.set(waiter.id, waiter));
    return waiters;
  } catch (error) {
    if (!(error instanceof AppSessionError)) {
      console.error("Error fetching waiters:", error);
    }
    return [];
  }
}

/**
 * Clear the waiter cache
 */
export function clearWaiterCache(): void {
  waiterCache.clear();
}

/**
 * Get waiter name from cache or return a placeholder
 */
export function getWaiterName(waiterId: string | null): string {
  if (!waiterId) {
    return "Cliente";
  }

  const waiter = waiterCache.get(waiterId);
  return waiter?.display_name || waiter?.full_name || "Mesero";
}
