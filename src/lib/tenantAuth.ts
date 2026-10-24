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

const JALEO_PASS = 'Jaleo2024!';
const SUPER_PASS = 'Qwertyytrewq4328@';

const CREDENTIALS: Credential[] = [
  // Platform super admin (was the old Moe's Taberna demo account).
  { identifier: 'admin@mimenu.com', password: SUPER_PASS, email: 'admin@mimenu.com', name: 'Super Admin', role: 'admin', tenantSlug: null, venueName: null },
  { identifier: 'mimenuadmin', password: SUPER_PASS, email: 'admin@mimenu.com', name: 'Super Admin', role: 'admin', tenantSlug: null, venueName: null },
  // Jaleo tenant staff.
  { identifier: 'admin@jaleo.com', password: JALEO_PASS, email: 'admin@jaleo.com', name: 'Jaleo Admin', role: 'admin', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'jaleo', password: JALEO_PASS, email: 'admin@jaleo.com', name: 'Jaleo Admin', role: 'admin', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'cocina@jaleo.com', password: JALEO_PASS, email: 'cocina@jaleo.com', name: 'Jaleo Cocina', role: 'kitchen', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'caja@jaleo.com', password: JALEO_PASS, email: 'caja@jaleo.com', name: 'Jaleo Caja', role: 'cashier', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'mozo@jaleo.com', password: JALEO_PASS, email: 'mozo@jaleo.com', name: 'Jaleo Mozo', role: 'waiter', tenantSlug: 'jaleo', venueName: 'Jaleo' },
];

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
