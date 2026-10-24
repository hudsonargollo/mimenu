// KV Storage utility for session and data persistence
// Replaces Supabase for session storage

interface KVStorage {
  put: (key: string, value: string | object, expirationTtl?: number) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  delete: (key: string) => Promise<void>;
  list: (prefix?: string) => Promise<string[]>;
}

/**
 * KV Storage adapter for Cloudflare Workers KV namespace
 * Available as env.MIMENU_KV in Cloudflare Functions
 */
declare interface KVNamespace {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: Array<{ name: string }>; cursor?: string }>;
}

declare const KVNamespace: {
  prototype: KVNamespace;
  new(): KVNamespace;
};

export function createKVStorage(env: { MIMENU_KV?: KVNamespace }): KVStorage {
  if (!env.MIMENU_KV) {
    throw new Error('MIMENU_KV namespace not bound');
  }

  const kv = env.MIMENU_KV;

  return {
    async put(key: string, value: string | object, expirationTtl?: number) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (expirationTtl) {
        await kv.put(key, stringValue, { expirationTtl });
      } else {
        await kv.put(key, stringValue);
      }
    },

    async get(key: string): Promise<string | null> {
      return await kv.get(key);
    },

    async delete(key: string): Promise<void> {
      await kv.delete(key);
    },

    async list(prefix?: string): Promise<string[]> {
      const result = await kv.list({ prefix });
      return result.keys.map(k => k.name);
    }
  };
}

// Session storage keys
const SESSION_KEYS = {
  WHATSAPP: 'session_whatsapp_',
  ORDERS: 'data_orders_',
  WAITERS: 'data_waiters_',
  USERS: 'data_users_',
  EMAIL_LINK: 'email_link_',
} as const;

// Session management for WhatsApp connections
export class WhatsAppSessionManager {
  private storage: KVStorage;

  constructor(env: { MIMENU_KV?: KVNamespace }) {
    this.storage = createKVStorage(env);
  }

  async saveSession(sessionId: string, sessionData: any, phoneNumber?: string): Promise<void> {
    const key = `${SESSION_KEYS.WHATSAPP}${sessionId}`;
    const data = {
      sessionData,
      phoneNumber,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    await this.storage.put(key, data, 7 * 24 * 60 * 60); // 7 days TTL
  }

  async loadSession(sessionId: string): Promise<any> {
    const key = `${SESSION_KEYS.WHATSAPP}${sessionId}`;
    const data = await this.storage.get(key);
    return data ? JSON.parse(data) : null;
  }

  async clearSession(sessionId: string): Promise<void> {
    const key = `${SESSION_KEYS.WHATSAPP}${sessionId}`;
    await this.storage.delete(key);
  }

  async listActiveSessions(): Promise<any[]> {
    const keys = await this.storage.list(SESSION_KEYS.WHATSAPP);
    const sessions = [];
    for (const key of keys) {
      const data = await this.storage.get(key);
      if (data) {
        sessions.push(JSON.parse(data));
      }
    }
    return sessions;
  }
}

// Email-based magic link storage
export class EmailLinkStore {
  private storage: KVStorage;

  constructor(env: { MIMENU_KV?: KVNamespace }) {
    this.storage = createKVStorage(env);
  }

  async storeMagicLink(email: string, token: string, expirationMinutes: number = 10): Promise<void> {
    const key = `${SESSION_KEYS.EMAIL_LINK}${token}`;
    const data = {
      email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString()
    };
    await this.storage.put(key, data, expirationMinutes * 60);
  }

  async verifyMagicLink(token: string): Promise<{ email: string; valid: boolean; expiresAt?: string } | null> {
    const key = `${SESSION_KEYS.EMAIL_LINK}${token}`;
    const data = await this.storage.get(key);
    
    if (!data) {
      return { email: '', valid: false };
    }

    const parsed = JSON.parse(data);
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      await this.storage.delete(key);
      return { email: '', valid: false };
    }

    return {
      email: parsed.email,
      valid: true,
      expiresAt: parsed.expiresAt
    };
  }

  async cleanupExpiredLinks(): Promise<void> {
    const keys = await this.storage.list(SESSION_KEYS.EMAIL_LINK);
    const now = Date.now();
    for (const key of keys) {
      const data = await this.storage.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          await this.storage.delete(key);
        }
      }
    }
  }
}

// Order data storage (for webhook order updates)
export class OrderStore {
  private storage: KVStorage;

  constructor(env: { MIMENU_KV?: KVNamespace }) {
    this.storage = createKVStorage(env);
  }

  async saveOrder(order: any): Promise<void> {
    const key = `${SESSION_KEYS.ORDERS}${order.id}`;
    const existing = await this.loadOrder(order.id);
    const orderWithTimestamps = {
      ...existing,
      ...order,
      updatedAt: new Date().toISOString()
    };
    await this.storage.put(key, orderWithTimestamps, 7 * 24 * 60 * 60); // 7 days
  }

  async loadOrder(orderId: string): Promise<any> {
    const key = `${SESSION_KEYS.ORDERS}${orderId}`;
    const data = await this.storage.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getOrdersByStatus(status: string): Promise<any[]> {
    // Note: This is inefficient for large datasets
    // For production, consider maintaining an index in KV
    const keys = await this.storage.list(SESSION_KEYS.ORDERS);
    const orders = [];
    for (const key of keys) {
      const data = await this.storage.get(key);
      if (data) {
        const order = JSON.parse(data);
        if (order.status === status) {
          orders.push(order);
        }
      }
    }
    return orders;
  }

  async deleteOrder(orderId: string): Promise<void> {
    const key = `${SESSION_KEYS.ORDERS}${orderId}`;
    await this.storage.delete(key);
  }
}