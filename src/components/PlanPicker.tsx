import React from 'react';
import { Check } from 'lucide-react';
import { PLANS, type Plan, type PlanId, type BillingCycle, planPriceLabel } from '@/lib/plans';

interface PlanPickerProps {
  selected: PlanId;
  onSelect: (id: PlanId) => void;
  billingCycle: BillingCycle;
  onCycleChange: (c: BillingCycle) => void;
}

/**
 * Plan selection for onboarding. Tier 1 is explicitly Basic (no AI concierge,
 * no AI analytics); Tier 4 is the high-ticket custom build with a setup fee.
 */
export const PlanPicker: React.FC<PlanPickerProps> = ({
  selected,
  onSelect,
  billingCycle,
  onCycleChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground">Facturación</span>
        <div className="flex items-center bg-muted/50 border border-border rounded-full p-0.5">
          {(['monthly', 'yearly'] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => onCycleChange(cycle)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                billingCycle === cycle
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cycle === 'monthly' ? 'Mensual' : 'Anual (ahorrá)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selected === plan.id}
            billingCycle={billingCycle}
            onSelect={() => onSelect(plan.id)}
          />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        El plan Básico no incluye Copiloto IA ni Analítica IA en el menú dinámico: esas funciones
        son exclusivas de Pro y superiores. Podés cambiar de plan cuando quieras.
      </p>
    </div>
  );
};

const PlanCard: React.FC<{
  plan: Plan;
  selected: boolean;
  billingCycle: BillingCycle;
  onSelect: () => void;
}> = ({ plan, selected, billingCycle, onSelect }) => {
  const isCustom = plan.id === 'custom';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative text-left p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
        selected
          ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500'
          : 'border-border bg-card hover:border-slate-400'
      } ${isCustom ? 'sm:col-span-2' : ''}`}
    >
      {plan.badge && (
        <span
          className={`absolute -top-2.5 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isCustom
              ? 'bg-rose-500 text-white'
              : 'bg-amber-500 text-black'
          }`}
        >
          {plan.badge}
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {plan.name}
          </p>
          <h3 className="text-base font-black text-foreground">{plan.tagline}</h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black text-amber-500 tabular-nums">
            {planPriceLabel(plan, billingCycle)}
          </p>
          {plan.monthly !== null && (
            <p className="text-[10px] text-muted-foreground">/ mes</p>
          )}
          {isCustom && <p className="text-[10px] text-rose-500 font-semibold">setup + mensualidad</p>}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">{plan.audience}</p>

      <ul className="space-y-1.5 pt-2 border-t border-border/60">
        {plan.features.slice(0, 4).map((f) => (
          <li key={f.label} className="flex items-start gap-2 text-[11px]">
            <Check
              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${f.highlight ? 'text-amber-500' : 'text-emerald-500'}`}
              aria-hidden="true"
            />
            <span className={f.highlight ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
              {f.label}
            </span>
          </li>
        ))}
        {plan.features.length > 4 && (
          <li className="text-[10px] text-muted-foreground pl-5">
            +{plan.features.length - 4} beneficios más
          </li>
        )}
      </ul>

      {selected && (
        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Seleccionado
        </span>
      )}
    </button>
  );
};

export default PlanPicker;
