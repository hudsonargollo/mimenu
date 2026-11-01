import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { PLAN_CATALOG, ENTITLEMENT_LABELS, addedEntitlements, nextPlanAfter } from '@/lib/plans';

/**
 * Persistent upgrade prompt for the admin surfaces. Every non-Custom venue gets
 * it, so the path to a higher plan is always one click away.
 */
const AdminUpgradeBanner = () => {
  const { venue } = useMimenu();
  const current = PLAN_CATALOG[venue.plan];
  const next = nextPlanAfter(venue.plan);
  if (!next) return null;

  const lapsed = venue.plan_status !== 'active' && venue.plan_status !== 'trialing';
  const highlights = addedEntitlements(next.id)
    .slice(0, 3)
    .map((feature) => ENTITLEMENT_LABELS[feature]);

  return (
    <div className="mt-8 flex flex-col gap-4 border-y border-border bg-card/60 py-4 pl-4 pr-4 sm:flex-row sm:items-center sm:justify-between sm:pl-5">
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-primary/30 text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {lapsed ? 'Plan vencido' : `Plan ${current.name}`}
          </p>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
            {lapsed
              ? 'Regularizá el pago o cambiá de plan para recuperar las funciones bloqueadas.'
              : `Pasá a ${next.name}${next.priceMonthlyBob !== null ? ` por Bs. ${next.priceMonthlyBob}/mes` : ' (a cotizar)'} y desbloqueá: ${highlights.join(' · ')}.`}
          </p>
        </div>
      </div>

      <Link
        to={lapsed ? '/admin/upgrade' : `/admin/upgrade?plan=${next.id}`}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[4px] border border-foreground bg-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85"
      >
        {lapsed ? 'Reactivar plan' : 'Upgrade plan'}
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
};

export default AdminUpgradeBanner;
