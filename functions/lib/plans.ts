// Plan enforcement for Pages Functions.
//
// Route handlers call `requireEntitlement()` before touching KV or an external
// API. The tenant is identified by `?venue=<slug>` (or `x-venue-slug`, or a
// `venueSlug` body field); the entitlement matrix itself lives in
// `shared/plans.ts` so the SPA shows exactly the access the edge enforces.
//
// Caveat: auth is still client-side, so a caller can claim any slug. This is
// product-level enforcement; a signed tenant token is the next hardening step.

import {
  ENTITLEMENT_LABELS,
  resolveVenueAccess,
  type Entitlement,
  type PlanAccess,
} from '../../shared/plans';
import { json } from './kv-ar';

export type EntitlementCheck =
  | { ok: true; access: PlanAccess }
  | { ok: false; response: Response };

/** Resolve the tenant slug from query string, header, or JSON body. */
export function venueSlugFromRequest(
  request: Request,
  body?: Record<string, unknown> | null
): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('venue') || url.searchParams.get('v');
  if (fromQuery?.trim()) return fromQuery.trim().toLowerCase();

  const fromHeader = request.headers.get('x-venue-slug');
  if (fromHeader?.trim()) return fromHeader.trim().toLowerCase();

  const fromBody = body?.venueSlug ?? body?.venue_slug;
  if (typeof fromBody === 'string' && fromBody.trim()) return fromBody.trim().toLowerCase();

  return null;
}

/**
 * Gate a request on a plan entitlement.
 *
 * Returns 400 when the caller sent no venue context and 402 when the venue's
 * plan does not include the feature, so clients can render an upgrade prompt
 * instead of a generic error.
 */
export function requireEntitlement(
  slug: string | null | undefined,
  entitlement: Entitlement
): EntitlementCheck {
  const access = resolveVenueAccess(slug, entitlement);
  if (access.allowed) return { ok: true, access };

  const missingTenant = access.reason === 'no_tenant';
  const code = missingTenant ? 'venue_required' : access.downgraded ? 'plan_inactive' : 'plan_required';

  return {
    ok: false,
    response: json(
      {
        success: false,
        code,
        error: missingTenant
          ? 'Venue context is required (?venue=<slug>) to verify the plan.'
          : `${ENTITLEMENT_LABELS[entitlement]} requires the ${access.requiredPlan.name} plan.`,
        feature: entitlement,
        feature_label: ENTITLEMENT_LABELS[entitlement],
        venue: access.venueSlug,
        current_plan: access.currentPlan.id,
        required_plan: access.requiredPlan.id,
        plan_status: access.assignment?.status ?? 'none',
      },
      missingTenant ? 400 : 402
    ),
  };
}
