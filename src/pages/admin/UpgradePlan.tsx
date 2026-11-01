/**
 * /admin/upgrade — the single upgrade surface for every venue.
 *
 * Plans are enforced from `shared/plans.ts`; this page lets any tenant compare
 * tiers, preselect the plan a blocked feature needs (`?feature=<entitlement>`),
 * and request the upgrade through sales. Activation happens after payment
 * confirmation, so there is no self-service plan switch.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Mail, MessageCircle, ShieldAlert, Sparkles } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useMimenu } from '@/lib/mimenuContext';
import {
  ENTITLEMENT_LABELS,
  PLAN_CATALOG,
  PLAN_ORDER,
  addedEntitlements,
  nextPlanAfter,
  requiredPlanFor,
  type Entitlement,
  type PlanId,
} from '@/lib/plans';
import { buildUpgradeMailtoUrl, buildUpgradeWhatsAppUrl } from '@/lib/salesContact';

const isPlanId = (value: string | null): value is PlanId =>
  !!value && (PLAN_ORDER as readonly string[]).includes(value);

const isEntitlement = (value: string | null): value is Entitlement =>
  !!value && Object.prototype.hasOwnProperty.call(ENTITLEMENT_LABELS, value);

const UpgradePlan = () => {
  const { venue } = useMimenu();
  const [params] = useSearchParams();

  const featureParam = params.get('feature');
  const planParam = params.get('plan');
  const feature = isEntitlement(featureParam) ? featureParam : null;

  const currentId = venue.plan;
  const current = PLAN_CATALOG[currentId];
  const nextTier = nextPlanAfter(currentId);
  const lapsed = venue.plan_status !== 'active' && venue.plan_status !== 'trialing';
  const focusPlan = feature ? requiredPlanFor(feature) : null;

  const preferredTarget = (): PlanId => {
    if (isPlanId(planParam) && PLAN_CATALOG[planParam].rank > current.rank) return planParam;
    if (focusPlan && focusPlan.rank > current.rank) return focusPlan.id;
    return nextTier?.id ?? currentId;
  };

  const [targetId, setTargetId] = useState<PlanId>(preferredTarget);

  useEffect(() => {
    setTargetId(preferredTarget());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue.slug, featureParam, planParam]);

  useEffect(() => {
    document.title = `Planes | ${venue.name} | MiMenu`;
  }, [venue.name]);

  const target = PLAN_CATALOG[targetId];
  const canRequestUpgrade = target.rank > current.rank;

  const contactInput = useMemo(
    () => ({
      venueName: venue.name,
      venueSlug: venue.slug,
      currentPlanName: current.name,
      targetPlanName: canRequestUpgrade ? target.name : null,
      featureLabel: feature ? ENTITLEMENT_LABELS[feature] : null,
    }),
    [venue.name, venue.slug, current.name, canRequestUpgrade, target.name, feature]
  );

  const whatsappUrl = buildUpgradeWhatsAppUrl(contactInput);
  const mailtoUrl = buildUpgradeMailtoUrl(contactInput);

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5b4a9e] transition-colors hover:text-[#2a1f55]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al panel
        </Link>

        <header className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-md">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8b5cf6]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#5b4a9e]">
              <Sparkles className="h-3 w-3" />
              Planes
            </span>
            <h1 className="mt-3 text-2xl font-black text-[#2a1f55] sm:text-3xl">
              Upgrade plan
            </h1>
            <p className="mt-1 text-xs text-[#5b4a9e]/80">
              Plan actual <strong>{current.name}</strong>
              {current.priceMonthlyBob !== null
                ? ` · Bs. ${current.priceMonthlyBob}/mes`
                : ' · A cotizar'}
              {lapsed ? ' · vencido' : ' · activo'}
            </p>
          </div>

          {lapsed && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
              <div>
                <p className="text-xs font-black text-rose-700">Tu plan está vencido</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-rose-700/80">
                  El restaurante volvió al plan Basic. Regularizá el pago o elegí un plan para
                  recuperar las funciones bloqueadas.
                </p>
              </div>
            </div>
          )}

          {feature && focusPlan && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                <strong>{ENTITLEMENT_LABELS[feature]}</strong> está disponible desde el plan{' '}
                <strong>{focusPlan.name}</strong>.
              </span>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PLAN_ORDER.map((planId) => {
            const plan = PLAN_CATALOG[planId];
            const isCurrent = plan.id === currentId;
            const included = plan.rank < current.rank;
            const selectable = plan.rank > current.rank;
            const selected = selectable && plan.id === targetId;
            const recommended = !!focusPlan && focusPlan.id === plan.id && selectable;
            const lowerName =
              plan.rank > 0
                ? PLAN_ORDER.map((id) => PLAN_CATALOG[id]).find((p) => p.rank === plan.rank - 1)
                    ?.name
                : null;

            return (
              <button
                key={plan.id}
                type="button"
                disabled={!selectable}
                aria-pressed={selected}
                onClick={() => setTargetId(plan.id)}
                className={`relative flex h-full flex-col gap-3 rounded-3xl border p-5 text-left transition-all ${
                  selected
                    ? 'border-[#8b5cf6] bg-white ring-2 ring-[#8b5cf6]/40 shadow-lg'
                    : 'border-white/70 bg-white/55'
                } ${selectable ? 'hover:border-[#8b5cf6]/60 hover:bg-white/80' : 'cursor-default'} ${
                  included ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-[#2a1f55]">{plan.name}</h2>
                      {isCurrent && (
                        <span className="rounded-full bg-[#8b5cf6] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                          Plan actual
                        </span>
                      )}
                      {recommended && (
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#2a1f55]">
                          Recomendado
                        </span>
                      )}
                      {included && (
                        <span className="rounded-full bg-[#2a1f55]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#5b4a9e]">
                          Incluido
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#5b4a9e]/80">
                      {plan.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-black text-[#2a1f55]">
                      {plan.priceMonthlyBob !== null ? `Bs. ${plan.priceMonthlyBob}` : 'A cotizar'}
                    </p>
                    <p className="text-[10px] text-[#5b4a9e]/60">
                      {plan.priceMonthlyBob !== null ? '/mes' : 'setup + mensualidad'}
                    </p>
                  </div>
                </div>

                {lowerName && (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#5b4a9e]/60">
                    Incluye todo lo de {lowerName}
                  </p>
                )}

                <ul className="space-y-1.5 border-t border-[#2a1f55]/10 pt-2">
                  {addedEntitlements(plan.id).map((entitlement) => (
                    <li key={entitlement} className="flex items-start gap-2 text-[11px]">
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      <span className="text-[#3a2f6b]">{ENTITLEMENT_LABELS[entitlement]}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold text-[#5b4a9e]/70">
                    {isCurrent
                      ? 'Tu plan actual'
                      : included
                        ? `Ya incluido en ${current.name}`
                        : selected
                          ? `Solicitar ${plan.name}`
                          : 'Elegir este plan'}
                  </span>
                  {selectable && (
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-[#8b5cf6] bg-[#8b5cf6]' : 'border-[#5b4a9e]/30 bg-white'
                      }`}
                      aria-hidden="true"
                    >
                      {selected && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#2a1f55]">
                {canRequestUpgrade
                  ? `Solicitar upgrade a ${target.name}`
                  : currentId === 'custom'
                    ? 'Ya estás en el plan más alto'
                    : 'Elegí un plan superior'}
              </h2>
              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[#5b4a9e]/80">
                {canRequestUpgrade
                  ? `Pasás de ${current.name} a ${target.name}${
                      target.priceMonthlyBob !== null
                        ? ` por Bs. ${target.priceMonthlyBob}/mes`
                        : ' (a cotizar)'
                    }. La activación se realiza al confirmar el pago; tu menú sigue funcionando mientras tanto.`
                  : currentId === 'custom'
                    ? 'Para cambios a medida, nuevos locales o integraciones, escribinos y armamos una propuesta.'
                    : 'Seleccioná un plan de la lista para preparar la solicitud.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {canRequestUpgrade ? 'Solicitar por WhatsApp' : 'Hablar con ventas'}
              </a>
              <a
                href={mailtoUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a1f55]/15 bg-white/80 px-4 py-3 text-xs font-bold text-[#2a1f55] transition-colors hover:bg-white"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Enviar email
              </a>
            </div>
          </div>

          <p className="mt-4 border-t border-[#2a1f55]/10 pt-3 text-[10px] leading-relaxed text-[#5b4a9e]/60">
            Los planes se activan manualmente al confirmar el pago — no hay cobros automáticos. Si
            ya pagaste y el plan sigue bloqueado, contanos el número de comprobante en el mensaje.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
};

export default UpgradePlan;
