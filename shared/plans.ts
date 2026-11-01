/**
 * MiMenu plan catalog and tenant entitlements.
 *
 * This file is the single source of truth shared by the SPA (`src/`) and the
 * Cloudflare Pages Functions (`functions/`). Keep it dependency-free so both
 * bundlers can consume it.
 *
 * Enforcement model:
 * - A venue gets an assignment in `VENUE_PLANS`; unlisted venues default to
 *   `basic`.
 * - An assignment only grants its plan while `status` is `active`/`trialing`
 *   (or `past_due` inside a grace window). Otherwise the venue falls back to
 *   `basic`, which keeps the public QR menu alive.
 * - Route guards and edge endpoints call `resolveVenueAccess()`; never read
 *   `PLANS` directly to decide access.
 */

export const PLAN_ORDER = ['basic', 'pro', 'premium', 'custom'] as const;

export type PlanId = (typeof PLAN_ORDER)[number];

export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'canceled';

export type Entitlement =
  | 'qr_menu'
  | 'kds'
  | 'waiter_app'
  | 'whatsapp_concierge'
  | 'analytics'
  | 'crm'
  | 'smart_offers'
  | 'printing'
  | 'ar_3d'
  | 'custom_website'
  | 'photographed_menu'
  | 'guided_onboarding'
  | 'multi_branch'
  | 'pos_integration'
  | 'api_webhooks'
  | 'sla_support';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  /** Lower is cheaper; used to pick the minimum plan for an entitlement. */
  rank: number;
  /** Monthly price in BOB; null means quoted per contract. */
  priceMonthlyBob: number | null;
  description: string;
  entitlements: Entitlement[];
}

export interface VenuePlanAssignment {
  plan: PlanId;
  status: PlanStatus;
  /** ISO date the tenant started this plan. */
  since?: string;
  /** ISO date the current paid period ends, when known. */
  renewsAt?: string;
  /** ISO date a trial ends, used when status is `trialing`. */
  trialEndsAt?: string;
  /** ISO date through which a `past_due` venue keeps its plan. */
  graceUntil?: string;
  note?: string;
}

const BASIC_ENTITLEMENTS: Entitlement[] = ['qr_menu'];

const PRO_ENTITLEMENTS: Entitlement[] = [
  ...BASIC_ENTITLEMENTS,
  'kds',
  'waiter_app',
  'whatsapp_concierge',
  'analytics',
  'crm',
  'smart_offers',
  'printing',
];

const PREMIUM_ENTITLEMENTS: Entitlement[] = [
  ...PRO_ENTITLEMENTS,
  'ar_3d',
  'custom_website',
  'photographed_menu',
  'guided_onboarding',
];

const CUSTOM_ENTITLEMENTS: Entitlement[] = [
  ...PREMIUM_ENTITLEMENTS,
  'multi_branch',
  'pos_integration',
  'api_webhooks',
  'sla_support',
];

export const PLANS: Record<PlanId, PlanDefinition> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    rank: 0,
    priceMonthlyBob: 180,
    description: 'Menú digital QR con 0% de comisión.',
    entitlements: BASIC_ENTITLEMENTS,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    rank: 1,
    priceMonthlyBob: 340,
    description: 'Operación completa: KDS, copiloto WhatsApp, analítica y CRM.',
    entitlements: PRO_ENTITLEMENTS,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    rank: 2,
    priceMonthlyBob: 680,
    description: 'Experiencia premium: AR/3D, web personalizada y onboarding guiado.',
    entitlements: PREMIUM_ENTITLEMENTS,
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    rank: 3,
    priceMonthlyBob: null,
    description: 'Contrato a medida: multi-sucursal, POS/ERP, API y SLA.',
    entitlements: CUSTOM_ENTITLEMENTS,
  },
};

export const DEFAULT_PLAN: PlanId = 'basic';

/**
 * Tenant plan assignments.
 *
 * Only venues listed here have a non-default plan. Jaleo is the founding
 * Premium tenant; every other registry venue stays on Basic until assigned.
 */
export const VENUE_PLANS: Record<string, VenuePlanAssignment> = {
  jaleo: {
    plan: 'premium',
    status: 'active',
    since: '2026-09-24',
    note: 'Founding tenant. Premium features are enforced through this assignment.',
  },
};

export const ENTITLEMENT_LABELS: Record<Entitlement, string> = {
  qr_menu: 'Menú digital QR',
  kds: 'KDS y operación de cocina',
  waiter_app: 'App de mozos',
  whatsapp_concierge: 'Copiloto IA por WhatsApp',
  analytics: 'Analítica y reportes',
  crm: 'CRM y fidelización',
  smart_offers: 'Ofertas inteligentes',
  printing: 'Impresión automática',
  ar_3d: 'Menú AR / 3D',
  custom_website: 'Web personalizada / white-label',
  photographed_menu: 'Digitalización de carta con fotos',
  guided_onboarding: 'Onboarding guiado',
  multi_branch: 'Multi-sucursal',
  pos_integration: 'Integración POS / ERP',
  api_webhooks: 'API y webhooks',
  sla_support: 'Soporte con SLA',
};

export function normalizePlanId(value: unknown): PlanId {
  return typeof value === 'string' && (PLAN_ORDER as readonly string[]).includes(value)
    ? (value as PlanId)
    : DEFAULT_PLAN;
}

export function normalizeVenueSlug(slug: string | null | undefined): string | null {
  const normalized = (slug || '').trim().toLowerCase();
  return normalized || null;
}

/** The raw assignment for a venue. Unlisted venues get Basic/active. */
export function assignmentFor(slug: string | null | undefined): VenuePlanAssignment {
  const key = normalizeVenueSlug(slug);
  return key && VENUE_PLANS[key] ? { ...VENUE_PLANS[key] } : { plan: DEFAULT_PLAN, status: 'active' };
}

/** Whether an assignment currently grants its plan. */
export function isAssignmentActive(assignment: VenuePlanAssignment, now: number = Date.now()): boolean {
  if (assignment.status === 'active') return true;
  if (assignment.status === 'trialing') {
    if (!assignment.trialEndsAt) return true;
    const endsAt = Date.parse(assignment.trialEndsAt);
    return Number.isFinite(endsAt) ? endsAt > now : true;
  }
  if (assignment.status === 'past_due' && assignment.graceUntil) {
    const graceUntil = Date.parse(assignment.graceUntil);
    return Number.isFinite(graceUntil) ? graceUntil > now : false;
  }
  return false;
}

/**
 * The plan a venue can actually use right now. Inactive assignments fall back
 * to Basic so the public menu keeps working after a lapse.
 */
export function effectivePlanFor(slug: string | null | undefined, now: number = Date.now()): PlanDefinition {
  const assignment = assignmentFor(slug);
  return isAssignmentActive(assignment, now) ? PLANS[normalizePlanId(assignment.plan)] : PLANS[DEFAULT_PLAN];
}

export function hasEntitlement(
  slug: string | null | undefined,
  entitlement: Entitlement,
  now: number = Date.now()
): boolean {
  return effectivePlanFor(slug, now).entitlements.includes(entitlement);
}

/** The cheapest plan that includes an entitlement. */
export function requiredPlanFor(entitlement: Entitlement): PlanDefinition {
  for (const id of PLAN_ORDER) {
    if (PLANS[id].entitlements.includes(entitlement)) return PLANS[id];
  }
  return PLANS.custom;
}

export type AccessReason = 'ok' | 'no_tenant' | 'inactive' | 'upgrade_required';

export interface PlanAccess {
  allowed: boolean;
  reason: AccessReason;
  venueSlug: string | null;
  entitlement: Entitlement;
  assignment: VenuePlanAssignment | null;
  /** Plan the venue can actually use (falls back to Basic when inactive). */
  currentPlan: PlanDefinition;
  /** Cheapest plan that grants the requested entitlement. */
  requiredPlan: PlanDefinition;
  /** True when a non-Basic assignment lapsed and the venue was downgraded. */
  downgraded: boolean;
}

/**
 * Decide whether a venue may use an entitlement. This is the only function
 * route guards and edge endpoints should call.
 */
export function resolveVenueAccess(
  slug: string | null | undefined,
  entitlement: Entitlement,
  now: number = Date.now()
): PlanAccess {
  const requiredPlan = requiredPlanFor(entitlement);
  const venueSlug = normalizeVenueSlug(slug);

  if (!venueSlug) {
    return {
      allowed: false,
      reason: 'no_tenant',
      venueSlug: null,
      entitlement,
      assignment: null,
      currentPlan: PLANS[DEFAULT_PLAN],
      requiredPlan,
      downgraded: false,
    };
  }

  const assignment = assignmentFor(venueSlug);
  const active = isAssignmentActive(assignment, now);
  const currentPlan = active ? PLANS[normalizePlanId(assignment.plan)] : PLANS[DEFAULT_PLAN];
  const downgraded = !active && normalizePlanId(assignment.plan) !== DEFAULT_PLAN;
  const allowed = currentPlan.entitlements.includes(entitlement);

  return {
    allowed,
    reason: allowed ? 'ok' : downgraded ? 'inactive' : 'upgrade_required',
    venueSlug,
    entitlement,
    assignment,
    currentPlan,
    requiredPlan,
    downgraded,
  };
}
