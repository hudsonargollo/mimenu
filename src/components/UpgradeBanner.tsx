import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { PLAN_CATALOG, addedEntitlements, nextPlanAfter } from '@/lib/plans';

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
  const highlights = addedEntitlements(next.id).slice(0, 3);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#8b5cf6]/25 bg-white/60 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-black text-[#2a1f55]">
            {lapsed ? 'Tu plan venció — volviste a Basic' : `Estás en el plan ${current.name}`}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[#5b4a9e]/80">
            {lapsed
              ? 'Regularizá el pago o cambiá de plan para recuperar las funciones bloqueadas.'
              : `Pasá a ${next.name}${next.priceMonthlyBob !== null ? ` por Bs. ${next.priceMonthlyBob}/mes` : ' (a cotizar)'} y desbloqueá: ${highlights.join(' · ')}.`}
          </p>
        </div>
      </div>

      <Link
        to={lapsed ? '/admin/upgrade' : `/admin/upgrade?plan=${next.id}`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
      >
        {lapsed ? 'Reactivar plan' : 'Mejorar plan'}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
};

export default AdminUpgradeBanner;
