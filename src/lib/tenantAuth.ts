/**
 * Tenant (venue) resolution for staff logins.
 *
 * A staff login maps to exactly one venue, so the admin/kitchen/cashier
 * panels operate on that tenant's data. The venue is recorded on the auth
 * record and read back on load.
 */
import type { Lang } from '@/i18n/translations';

export type StaffRole = 'admin' | 'waiter' | 'kitchen' | 'cashier';

export interface StaffLogin {
  email: string;
  name: string;
  role: StaffRole;
}

export interface TenantAccount {
  slug: string;
  venueName: string;
  login: StaffLogin;
}

interface RegistryItem {
  id?: string;
  slug: string;
  name: string;
  name_i18n?: Record<Lang, string>;
  staff?: StaffLogin[];
}

import registry from '@/data/provisioned_venues.json';
import { APP_CREDENTIALS } from '../../shared/app-credentials';

function registryItems(): RegistryItem[] {
  return Array.isArray(registry) ? (registry as unknown as RegistryItem[]) : [];
}

/** Normalize an email for comparison (trim + lowercase). */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/** Every staff login registered across tenants, flattened. */
export function listStaffLogins(): StaffLogin[] {
  const out: StaffLogin[] = [];
  for (const venue of registryItems()) {
    for (const login of venue.staff || []) {
      out.push({ ...login, email: normalizeEmail(login.email) });
    }
  }
  return out;
}

/**
 * Resolve the tenant for a login. Returns the venue that owns the email, or
 * null when the email is not a registered staff login for any tenant.
 */
export function resolveTenantForLogin(email: string): TenantAccount | null {
  const target = normalizeEmail(email);
  if (!target) return null;
  for (const venue of registryItems()) {
    for (const login of venue.staff || []) {
      if (normalizeEmail(login.email) === target) {
        return {
          slug: venue.slug,
          venueName: venue.name,
          login: { ...login, email: target },
        };
      }
    }
  }
  return null;
}

/** Tenants that have at least one staff login (i.e. real customer tenants). */
export function listTenantAccounts(lang: Lang): TenantAccount[] {
  const seen = new Set<string>();
  const out: TenantAccount[] = [];
  for (const venue of registryItems()) {
    if (!venue.staff?.length || seen.has(venue.slug)) continue;
    seen.add(venue.slug);
    out.push({
      slug: venue.slug,
      venueName: venue.name_i18n?.[lang] || venue.name,
      login: venue.staff[0],
    });
  }
  return out;
}

/** Credential store for staff logins.
 *
 * Supports login by email OR by restaurant slug/username. Passwords live here
 * (client-side demo store; production would verify against a backend).
 */
export interface Credential {
  identifier: string; // email or slug/username (lowercased)
  password: string;
  email: string;
  name: string;
  role: StaffRole;
  tenantSlug: string | null; // null = platform super admin
  venueName: string | null;
}

const CREDENTIALS: Credential[] = APP_CREDENTIALS;

export function resolveCredential(identifier: string, password: string): Credential | null {
  const key = (identifier || '').trim().toLowerCase();
  const cred = CREDENTIALS.find((c) => c.identifier === key);
  if (!cred) return null;
  if (cred.password !== password) return null;
  return cred;
}

export function listTenantCredentials(): Credential[] {
  // One entry per tenant (admin) for the quick-pick buttons.
  const seen = new Set<string>();
  const out: Credential[] = [];
  for (const c of CREDENTIALS) {
    if (c.tenantSlug && c.role === 'admin' && !seen.has(c.tenantSlug)) {
      seen.add(c.tenantSlug);
      out.push(c);
    }
  }
  return out;
}
