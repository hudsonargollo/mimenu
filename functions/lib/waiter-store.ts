/**
 * Waiter accounts for the admin panel.
 *
 * Stored as one JSON array in the MIMENU_KV namespace (the Pages project has
 * no Supabase bindings), so the admin API and the login endpoint share one
 * source. A single key keeps reads consistent right after a write.
 */
import { APP_CREDENTIALS } from '../../shared/app-credentials';

export interface WaiterRecord {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  password_hash: string;
  tenant_slug: string | null;
  created_at: string;
}

export type PublicWaiter = Omit<WaiterRecord, 'password_hash' | 'tenant_slug'>;

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface WaiterEnv {
  MIMENU_KV?: KVNamespaceLike;
}

const STORAGE_KEY = 'waiters:all';
const encoder = new TextEncoder();
const ITERATIONS = 100_000;

function kv(env: WaiterEnv): KVNamespaceLike {
  if (!env.MIMENU_KV) {
    throw new Error('MIMENU_KV namespace not bound');
  }
  return env.MIMENU_KV;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function derive(password: string, salt: string): Promise<string> {
  const material = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    256
  );
  return toHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  return `pbkdf2$${salt}$${await derive(password, salt)}`;
}

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const [scheme, salt, expected] = (stored || '').split('$');
  if (scheme !== 'pbkdf2' || !salt || !expected) return false;

  const candidate = await derive(password, salt);
  if (candidate.length !== expected.length) return false;

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= candidate.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return diff === 0;
}

export function generateTemporaryPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const random = crypto.getRandomValues(new Uint8Array(8));
  return `Mm-${Array.from(random, (byte) => alphabet[byte % alphabet.length]).join('')}`;
}

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/** Tenant of the admin making the request; null for the platform account. */
export function tenantSlugForAdmin(email: string): string | null {
  const target = normalizeEmail(email);
  const credential = APP_CREDENTIALS.find(
    (item) => item.role === 'admin' && normalizeEmail(item.email) === target
  );
  return credential?.tenantSlug ?? null;
}

export function canManage(adminTenant: string | null, record: WaiterRecord): boolean {
  return adminTenant === null || record.tenant_slug === adminTenant;
}

export function toPublicWaiter(record: WaiterRecord): PublicWaiter {
  return {
    id: record.id,
    email: record.email,
    full_name: record.full_name,
    phone_number: record.phone_number,
    created_at: record.created_at,
  };
}

async function readAll(env: WaiterEnv): Promise<WaiterRecord[]> {
  const raw = await kv(env).get(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WaiterRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(env: WaiterEnv, records: WaiterRecord[]): Promise<void> {
  await kv(env).put(STORAGE_KEY, JSON.stringify(records));
}

export async function listWaiters(env: WaiterEnv): Promise<WaiterRecord[]> {
  const records = await readAll(env);
  return [...records].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getWaiter(env: WaiterEnv, id: string): Promise<WaiterRecord | null> {
  const records = await readAll(env);
  return records.find((record) => record.id === id) || null;
}

export async function findWaiterByEmail(
  env: WaiterEnv,
  email: string
): Promise<WaiterRecord | null> {
  const target = normalizeEmail(email);
  const records = await readAll(env);
  return records.find((record) => normalizeEmail(record.email) === target) || null;
}

export async function saveWaiter(env: WaiterEnv, record: WaiterRecord): Promise<void> {
  const records = await readAll(env);
  const index = records.findIndex((item) => item.id === record.id);

  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }

  await writeAll(env, records);
}

export async function deleteWaiter(env: WaiterEnv, id: string): Promise<void> {
  const records = await readAll(env);
  await writeAll(
    env,
    records.filter((record) => record.id !== id)
  );
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('Este correo ya está registrado.');
    this.name = 'DuplicateEmailError';
  }
}

export async function createWaiter(
  env: WaiterEnv,
  input: {
    email: string;
    password: string;
    full_name: string;
    phone_number: string | null;
    tenant_slug: string | null;
  }
): Promise<WaiterRecord> {
  const existing = await findWaiterByEmail(env, input.email);
  if (existing) throw new DuplicateEmailError();

  const record: WaiterRecord = {
    id: crypto.randomUUID(),
    email: input.email.trim(),
    full_name: input.full_name.trim(),
    phone_number: input.phone_number || null,
    password_hash: await hashPassword(input.password),
    tenant_slug: input.tenant_slug,
    created_at: new Date().toISOString(),
  };

  await saveWaiter(env, record);
  return record;
}
