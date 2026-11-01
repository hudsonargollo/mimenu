/**
 * MIMENU KV Storage Engine
 * Cloudflare Workers KV compatible client-side & edge storage layer.
 * Provides a KV-driven multi-tenant storage layer for local and edge environments.
 */

export interface KVMetadata {
  updatedAt: string;
  venueId?: string;
  type?: string;
  version?: number;
}

export interface KVEntry<T = any> {
  key: string;
  value: T;
  metadata?: KVMetadata;
}

class MimenuKVStorage {
  private prefix = 'mimenu_kv:';

  /**
   * Get an item by key from KV storage
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;
      const parsed: KVEntry<T> = JSON.parse(raw);
      return parsed.value;
    } catch (err) {
      console.error(`[KV] Error getting key "${key}":`, err);
      return null;
    }
  }

  /**
   * Get an item with its metadata
   */
  async getWithMetadata<T = any>(key: string): Promise<KVEntry<T> | null> {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`[KV] Error getting with metadata for "${key}":`, err);
      return null;
    }
  }

  /**
   * Put/Save an item to KV storage
   */
  async put<T = any>(key: string, value: T, metadata?: Partial<KVMetadata>): Promise<void> {
    try {
      const entry: KVEntry<T> = {
        key,
        value,
        metadata: {
          updatedAt: new Date().toISOString(),
          version: 1,
          ...metadata,
        },
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (err) {
      console.error(`[KV] Error putting key "${key}":`, err);
      throw err;
    }
  }

  /**
   * Delete an item by key
   */
  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (err) {
      console.error(`[KV] Error deleting key "${key}":`, err);
    }
  }

  /**
   * List keys matching a prefix
   */
  async list(prefixFilter: string = ''): Promise<string[]> {
    const keys: string[] = [];
    const fullPrefix = this.prefix + prefixFilter;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) {
        keys.push(k.slice(this.prefix.length));
      }
    }
    return keys;
  }

  /**
   * Export all KV data as a single JSON object (for backups and cloud sync)
   */
  async exportAll(): Promise<Record<string, any>> {
    const dump: Record<string, any> = {};
    const allKeys = await this.list('');
    for (const k of allKeys) {
      dump[k] = await this.get(k);
    }
    return dump;
  }

  /**
   * Import data into KV storage
   */
  async importAll(dump: Record<string, any>): Promise<void> {
    for (const [k, v] of Object.entries(dump)) {
      await this.put(k, v);
    }
  }
}

export const kv = new MimenuKVStorage();

/**
 * Pre-defined KV Namespace key helpers for MIMENU SaaS:
 */
export const KV_KEYS = {
  venue: (venueId: string) => `venue:${venueId}`,
  categories: (venueId: string) => `menu:${venueId}:categories`,
  items: (venueId: string) => `menu:${venueId}:items`,
  offers: (venueId: string) => `offers:${venueId}:cycling`,
  tables: (venueId: string) => `tables:${venueId}`,
  reviews: (venueId: string) => `reviews:${venueId}`,
  orders: (venueId: string) => `orders:${venueId}`,
  aiMemory: (venueId: string) => `ai:memory:${venueId}`,
  aiInsights: (venueId: string) => `ai:insights:${venueId}`,
};
