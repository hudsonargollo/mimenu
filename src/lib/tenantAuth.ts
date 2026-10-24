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
