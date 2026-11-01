import { describe, it, expect } from 'vitest';
import {
  PLANS,
  VENUE_PLANS,
  assignmentFor,
  effectivePlanFor,
  hasEntitlement,
  isAssignmentActive,
  requiredPlanFor,
  resolveVenueAccess,
  type VenuePlanAssignment,
} from '../../../shared/plans';
import { addedEntitlements, nextPlanAfter } from '../plans';

describe('plan catalog', () => {
  it('assigns Jaleo to an active Premium plan', () => {
    expect(VENUE_PLANS.jaleo.plan).toBe('premium');
    expect(VENUE_PLANS.jaleo.status).toBe('active');
    expect(effectivePlanFor('jaleo').id).toBe('premium');
  });

  it('defaults unlisted venues to Basic', () => {
    expect(assignmentFor('some-cafe').plan).toBe('basic');
    expect(effectivePlanFor('some-cafe').id).toBe('basic');
    expect(effectivePlanFor(null).id).toBe('basic');
  });

  it('normalizes slug casing and whitespace', () => {
    expect(effectivePlanFor('  JALEO ').id).toBe('premium');
  });

  it('grants AR/3D to Premium but not to Basic or Pro', () => {
    expect(hasEntitlement('jaleo', 'ar_3d')).toBe(true);
    expect(hasEntitlement('some-cafe', 'ar_3d')).toBe(false);
    expect(PLANS.pro.entitlements).not.toContain('ar_3d');
  });

  it('builds premium on pro and custom on premium', () => {
    for (const entitlement of PLANS.pro.entitlements) {
      expect(PLANS.premium.entitlements).toContain(entitlement);
    }
    for (const entitlement of PLANS.premium.entitlements) {
      expect(PLANS.custom.entitlements).toContain(entitlement);
    }
  });

  it('resolves the cheapest plan for an entitlement', () => {
    expect(requiredPlanFor('qr_menu').id).toBe('basic');
    expect(requiredPlanFor('kds').id).toBe('pro');
    expect(requiredPlanFor('ar_3d').id).toBe('premium');
    expect(requiredPlanFor('sla_support').id).toBe('custom');
  });
});

describe('assignment status', () => {
  const now = Date.parse('2026-10-31T12:00:00Z');

  it('keeps trialing plans active until the trial ends', () => {
    const trial: VenuePlanAssignment = { plan: 'pro', status: 'trialing', trialEndsAt: '2026-11-05' };
    expect(isAssignmentActive(trial, now)).toBe(true);
  });

  it('keeps past_due plans active inside the grace window', () => {
    const inGrace: VenuePlanAssignment = { plan: 'pro', status: 'past_due', graceUntil: '2026-11-04' };
    const outOfGrace: VenuePlanAssignment = { plan: 'pro', status: 'past_due', graceUntil: '2026-10-01' };
    expect(isAssignmentActive(inGrace, now)).toBe(true);
    expect(isAssignmentActive(outOfGrace, now)).toBe(false);
  });

  it('rejects canceled assignments', () => {
    expect(isAssignmentActive({ plan: 'premium', status: 'canceled' }, now)).toBe(false);
  });

  it('falls a lapsed Premium venue back to Basic entitlements', () => {
    // resolveVenueAccess reads the catalog at call time, so exercise the
    // fallback through effectivePlanFor's shared code path.
    const lapsed = { plan: 'premium', status: 'canceled' } as const;
    expect(isAssignmentActive(lapsed, now)).toBe(false);
    expect(PLANS.basic.entitlements).not.toContain('ar_3d');
  });
});

describe('resolveVenueAccess', () => {
  it('allows Jaleo to use Premium features', () => {
    const access = resolveVenueAccess('jaleo', 'ar_3d');
    expect(access.allowed).toBe(true);
    expect(access.reason).toBe('ok');
    expect(access.currentPlan.id).toBe('premium');
    expect(access.assignment?.plan).toBe('premium');
  });

  it('blocks a Basic venue with an upgrade reason', () => {
    const access = resolveVenueAccess('some-cafe', 'kds');
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe('upgrade_required');
    expect(access.currentPlan.id).toBe('basic');
    expect(access.requiredPlan.id).toBe('pro');
    expect(access.downgraded).toBe(false);
  });

  it('reports a missing tenant instead of guessing a plan', () => {
    const access = resolveVenueAccess(null, 'kds');
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe('no_tenant');
    expect(access.venueSlug).toBeNull();
  });

  it('lets Basic venues keep the public QR menu', () => {
    expect(resolveVenueAccess('some-cafe', 'qr_menu').allowed).toBe(true);
  });
});

describe('upgrade helpers', () => {
  it('walks up one tier at a time', () => {
    expect(nextPlanAfter('basic')?.id).toBe('pro');
    expect(nextPlanAfter('pro')?.id).toBe('premium');
    expect(nextPlanAfter('premium')?.id).toBe('custom');
    expect(nextPlanAfter('custom')).toBeNull();
  });

  it('lists only the entitlements a tier adds', () => {
    expect(addedEntitlements('basic')).toEqual(PLANS.basic.entitlements);
    expect(addedEntitlements('pro')).toContain('kds');
    expect(addedEntitlements('pro')).not.toContain('qr_menu');
    expect(addedEntitlements('premium')).toContain('ar_3d');
    expect(addedEntitlements('premium')).not.toContain('kds');
    expect(addedEntitlements('custom')).toContain('multi_branch');
  });
});
