import { supabase } from "@/integrations/supabase/client";

export interface WaiterInfo {
  id: string;
  full_name: string;
  email: string;
  display_name?: string;
}

// Cache for waiter information to avoid repeated API calls
const waiterCache = new Map<string, WaiterInfo>();

/**
 * Fetch waiter information by ID
 * Uses caching to minimize API calls
 */
export async function fetchWaiterInfo(waiterId: string): Promise<WaiterInfo | null> {
  // Check cache first
  if (waiterCache.has(waiterId)) {
    return waiterCache.get(waiterId)!;
  }

  try {
    // Get user from auth to get waiter info from metadata
    const { data: { user }, error } = await supabase.auth.admin.getUserById(waiterId);

    if (error || !user) {
      console.error('Error fetching waiter info:', error);
      return null;
    }

    if (user && user.user_metadata?.role === 'waiter') {
      const waiter: WaiterInfo = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email || 'Mesero',
        email: user.email || '',
        display_name: user.user_metadata?.display_name
      };
      
      // Cache the result
      waiterCache.set(waiterId, waiter);
      return waiter;
    }

    return null;
  } catch (error) {
    console.error('Error fetching waiter info:', error);
    return null;
  }
}

/**
 * Fetch multiple waiters at once and cache them
 */
export async function fetchAllWaiters(): Promise<WaiterInfo[]> {
  try {
    // Get current session to check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return [];
    }

    // For now, return empty array - waiters are managed through edge functions
    // This function is optional for cashier functionality
    return [];
  } catch (error) {
    // Silently handle errors - waiter list is optional for cashier
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
 * Prefers display_name over full_name for better identification
 */
export function getWaiterName(waiterId: string | null): string {
  if (!waiterId) {
    return 'Cliente';
  }

  const waiter = waiterCache.get(waiterId);
  // Fallback chain: display_name → full_name → 'Mesero'
  return waiter?.display_name || waiter?.full_name || 'Mesero';
}
