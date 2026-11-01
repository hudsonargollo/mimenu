import type { ReactNode } from 'react';
import { useMimenu } from '@/lib/mimenuContext';
import { resolveVenueAccess, type Entitlement, type PlanAccess } from '@/lib/plans';
import PlanRequired from '@/pages/public/PlanRequired';

interface PlanGateProps {
  feature: Entitlement;
  children: ReactNode;
}

/**
 * Route/section guard. Access is derived from the active venue's plan, so a
 * venue that lapses to Basic loses Pro/Premium screens without losing its
 * public QR menu.
 */
const PlanGate = ({ feature, children }: PlanGateProps) => {
  const { venue } = useMimenu();
  const access: PlanAccess = resolveVenueAccess(venue?.slug, feature);

  if (access.allowed) return <>{children}</>;

  return <PlanRequired access={access} />;
};

export default PlanGate;
