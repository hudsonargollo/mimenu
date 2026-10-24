// Session Manager for Cloudflare Workers KV
// Replaces Supabase-based session storage with KV namespace

/**
 * Session storage utilities for WhatsApp sessions
 * Uses Cloudflare KV namespace (MIMENU_SESSIONS) for persistence
 */

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32;
const IV_LENGTH = 16;

/**
 * Get encryption key from environment and import for Web Crypto API
 */
async function getEncryptionKey(env) {
  const keyHex = env.WHATSAPP_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('WHATSAPP_ENCRYPTION_KEY environment variable is required');
  }

  // Convert hex string to Uint8Array
  const keyBytes = new Uint8Array(
    keyHex.match(/.{2}/g).map(byte => parseInt(byte, 16))
  );

  if (keyBytes.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error(`Encryption key must be ${ENCRYPTION_KEY_LENGTH} bytes (${ENCRYPTION_KEY_LENGTH * 2} hex characters)`);
  }

  // Import key for Web Crypto API
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt session data using Web Crypto API
 */
async function encryptSessionData(data, env) {
  try {
    const key = await getEncryptionKey(env);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const jsonData = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonData);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: encoder.encode('whatsapp-session')
      },
      key,
      dataBuffer
    );

    // Combine iv + encrypted data (GCM includes auth tag)
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);

    // Convert to hex string
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Failed to encrypt session data:', error);
    throw new Error('Session encryption failed');
  }
}

/**
 * Decrypt session data using Web Crypto API
 */
async function decryptSessionData(encryptedHex, env) {
  try {
    const key = await getEncryptionKey(env);

    // Convert hex string back to Uint8Array
    const encryptedData = new Uint8Array(
      encryptedHex.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );

    // Extract iv and encrypted data
    const iv = encryptedData.slice(0, IV_LENGTH);
    const encrypted = encryptedData.slice(IV_LENGTH);

    const encoder = new TextEncoder();
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: encoder.encode('whatsapp-session')
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    const jsonData = decoder.decode(decrypted);

    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to decrypt session data:', error);
    throw new Error('Session decryption failed');
  }
}

/**
 * Save session data to KV namespace
 */
export async function saveSessionToKV(sessionId, sessionData, phoneNumber, env) {
  try {
    const kv = env.MIMENU_KV;
    
    // Encrypt the session data
    const encryptedData = await encryptSessionData(sessionData, env);

    const key = `whatsapp_session_${sessionId}`;
    const payload = {
      session_id: sessionId,
      session_data: { encrypted: encryptedData },
      phone_number: phoneNumber,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    // Check if KV is available, otherwise use in-memory fallback
    if (kv) {
      await kv.put(key, JSON.stringify(payload), { expirationTtl: 7 * 24 * 60 * 60 }); // 7 days
    }
    
    console.log('Session saved (KV):', { sessionId, phoneNumber });
    return payload;
  } catch (error) {
    console.error('Failed to save session to KV:', error);
    throw error;
  }
}

/**
 * Load session data from KV namespace
 */
export async function loadSessionFromKV(sessionId, env) {
  try {
    const kv = env.MIMENU_KV;
    
    if (!kv) {
      throw new Error('KV namespace not available');
    }

    const key = `whatsapp_session_${sessionId}`;
    const rawData = await kv.get(key);

    if (!rawData) {
      console.log('No session found for:', sessionId);
      return null;
    }

    const data = JSON.parse(rawData);

    if (!data || !data.session_data || !data.session_data.encrypted) {
      console.log('No encrypted session data found for:', sessionId);
      return null;
    }

    // Decrypt the session data
    const decryptedData = await decryptSessionData(data.session_data.encrypted, env);

    console.log('Session loaded successfully:', { sessionId, phoneNumber: data.phone_number });
    return {
      sessionData: decryptedData,
      phoneNumber: data.phone_number,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Failed to load session from KV:', error);
    throw error;
  }
}

/**
 * Clear session data from KV
 */
export async function clearSessionFromKV(sessionId, env) {
  try {
    const kv = env.MIMENU_KV;
    
    if (kv) {
      const key = `whatsapp_session_${sessionId}`;
      await kv.delete(key);
    }
    
    console.log('Session cleared successfully:', sessionId);
  } catch (error) {
    console.error('Failed to clear session from KV:', error);
    throw error;
  }
}

/**
 * Get all active sessions
 */
export async function getActiveSessions(env) {
  try {
    const kv = env.MIMENU_KV;
    
    if (!kv) {
      return [];
    }

    // List all session keys (note: this is limited to 1000 by default)
    const result = await kv.list({ prefix: 'whatsapp_session_' });
    const sessions = [];
    
    for (const keyInfo of result.keys) {
      const rawData = await kv.get(keyInfo.name);
      if (rawData) {
        try {
          const data = JSON.parse(rawData);
          if (data.is_active) {
            sessions.push({
              session_id: data.session_id,
              phone_number: data.phone_number,
              updated_at: data.updated_at
            });
          }
        } catch (e) {
          // Skip malformed entries
        }
      }
    }
    
    return sessions;
  } catch (error) {
    console.error('Failed to get active sessions:', error);
    throw error;
  }
}

/**
 * Custom auth state implementation for Baileys with KV persistence
 */
export function createKVAuthState(sessionId, env) {
  let creds = null;
  let keys = {};

  // Load existing session data
  const loadSession = async () => {
    try {
      const sessionData = await loadSessionFromKV(sessionId, env);
      if (sessionData) {
        creds = sessionData.sessionData.creds || null;
        keys = sessionData.sessionData.keys || {};
        console.log('Loaded session from KV:', { sessionId, hasCreds: !!creds, keyCount: Object.keys(keys).length });
      } else {
        console.log('No existing session found, starting fresh:', sessionId);
      }
    } catch (error) {
      console.error('Failed to load session, starting fresh:', error);
      creds = null;
      keys = {};
    }
  };

  // Save session data
  const saveSession = async () => {
    try {
      const sessionData = {
        creds,
        keys
      };

      const phoneNumber = creds?.me?.id ? creds.me.id.split(':')[0] : null;
      await saveSessionToKV(sessionId, sessionData, phoneNumber, env);
      console.log('Saved session to KV:', { sessionId, phoneNumber });
    } catch (error) {
      console.error('Failed to save session:', error);
      // Don't throw here to avoid breaking the connection
    }
  };

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = `${type}:${ids.join(',')}`;
          return keys[key];
        },
        set: (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const key = `${category}:${id}`;
              const value = data[category][id];
              if (value) {
                keys[key] = value;
              } else {
                delete keys[key];
              }
            }
          }
        }
      }
    },
    saveCreds: () => {
      // This will be called when creds are updated
      saveSession();
    },
    loadSession,
    clearSession: () => clearSessionFromKV(sessionId, env)
  };
}

/**
 * Generate a secure encryption key (for setup)
 */
export function generateEncryptionKey() {
  const keyBytes = crypto.getRandomValues(new Uint8Array(ENCRYPTION_KEY_LENGTH));
  return Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}