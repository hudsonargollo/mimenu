export type AppRole = 'admin' | 'waiter' | 'kitchen' | 'cashier';

export interface AppCredential {
  identifier: string;
  password: string;
  email: string;
  name: string;
  role: AppRole;
  tenantSlug: string | null;
  venueName: string | null;
}

const JALEO_PASS = 'Jaleo2024!';
const SUPER_PASS = 'Qwertyytrewq4328@';

/**
 * Staff credential store shared by the SPA login and the Pages Functions.
 * Client-side by design in this demo build; the session endpoint only uses it
 * to mint a short-lived signed token for admin-only server operations.
 */
export const APP_CREDENTIALS: AppCredential[] = [
  { identifier: 'admin@mimenu.com', password: SUPER_PASS, email: 'admin@mimenu.com', name: 'Super Admin', role: 'admin', tenantSlug: null, venueName: null },
  { identifier: 'mimenuadmin', password: SUPER_PASS, email: 'admin@mimenu.com', name: 'Super Admin', role: 'admin', tenantSlug: null, venueName: null },
  { identifier: 'admin@jaleo.com', password: JALEO_PASS, email: 'admin@jaleo.com', name: 'Jaleo Admin', role: 'admin', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'jaleo', password: JALEO_PASS, email: 'admin@jaleo.com', name: 'Jaleo Admin', role: 'admin', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'cocina@jaleo.com', password: JALEO_PASS, email: 'cocina@jaleo.com', name: 'Jaleo Cocina', role: 'kitchen', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'caja@jaleo.com', password: JALEO_PASS, email: 'caja@jaleo.com', name: 'Jaleo Caja', role: 'cashier', tenantSlug: 'jaleo', venueName: 'Jaleo' },
  { identifier: 'mozo@jaleo.com', password: JALEO_PASS, email: 'mozo@jaleo.com', name: 'Jaleo Mozo', role: 'waiter', tenantSlug: 'jaleo', venueName: 'Jaleo' },
];
