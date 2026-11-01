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
import AdminPageHeader from '@/components/admin/AdminPageHeader';
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
import { buildUpgradeWhatsAppUrl } from '@/lib/salesContact';
import { useAuth } from '@/lib/authContext';
import { sendUpgradeRequestEmail } from '@/lib/email';
import { toast } from 'sonner';

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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { user } = useAuth();

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

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await sendUpgradeRequestEmail({
        ...contactInput,
        replyTo: user?.email,
      });
      toast.success('Solicitud enviada a ventas.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl pb-12">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Volver al panel
        </Link>

        <div className="mt-5">
          <AdminPageHeader
            index="12"
            eyebrow="Plan"
            title="Upgrade plan"
            description="Compará los planes del local y solicitá el cambio. La activación se hace al confirmar el pago."
            meta={
              <>
                <span className="noir-eyebrow">
                  Plan actual {current.name}
                  {current.priceMonthlyBob !== null ? ` · Bs. ${current.priceMonthlyBob}/mes` : ' · a cotizar'}
                </span>
                <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
                <span className={`noir-eyebrow ${lapsed ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {lapsed ? 'Vencido' : 'Activo'}
                </span>
              </>
            }
          />
        </div>

        {lapsed && (
          <div className="mb-5 flex gap-3 border-l-2 border-rose-600 bg-rose-50 px-4 py-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold text-rose-800">Tu plan está vencido</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-rose-800/75">
                El restaurante volvió al plan Basic. Regularizá el pago o elegí un plan para recuperar
                las funciones bloqueadas.
              </p>
            </div>
          </div>
        )}

        {feature && focusPlan && (
          <div className="mb-5 flex flex-wrap items-center gap-2 border-l-2 border-primary bg-accent/[0.08] px-4 py-3 text-xs text-foreground">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong className="font-semibold">{ENTITLEMENT_LABELS[feature]}</strong> está disponible
              desde el plan <strong className="font-semibold">{focusPlan.name}</strong>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 border-l border-border md:grid-cols-2">
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
                className={`relative flex h-full flex-col gap-3 border-b border-r border-border p-5 text-left transition-colors ${
                  selected
                    ? 'bg-card'
                    : selectable
                      ? 'hover:bg-card/60'
                      : 'cursor-default'
                } ${included ? 'opacity-55' : ''}`}
              >
                {selected && (
                  <span className="absolute inset-y-0 left-0 w-[2px] bg-primary" aria-hidden="true" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="font-display text-xl leading-none text-foreground">{plan.name}</h2>
                      {isCurrent && (
                        <span className="border border-border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-foreground">
                          Plan actual
                        </span>
                      )}
                      {recommended && (
                        <span className="border border-primary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-primary">
                          Recomendado
                        </span>
                      )}
                      {included && (
                        <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          Incluido
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-xl leading-none text-foreground">
                      {plan.priceMonthlyBob !== null ? `Bs. ${plan.priceMonthlyBob}` : 'A cotizar'}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {plan.priceMonthlyBob !== null ? '/mes' : 'setup + mensualidad'}
                    </p>
                  </div>
                </div>

                {lowerName && (
                  <p className="noir-eyebrow">Incluye todo lo de {lowerName}</p>
                )}

                <ul className="space-y-1.5 border-t border-border pt-2.5">
                  {addedEntitlements(plan.id).map((entitlement) => (
                    <li key={entitlement} className="flex items-start gap-2 text-[11px]">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span className="text-foreground/85">{ENTITLEMENT_LABELS[entitlement]}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
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
                      className={`flex h-3.5 w-3.5 items-center justify-center border ${
                        selected ? 'border-foreground bg-foreground' : 'border-muted-foreground/40 bg-transparent'
                      }`}
                      aria-hidden="true"
                    >
                      {selected && <Check className="h-2.5 w-2.5 text-background" />}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <section className="mt-8 border-y border-border bg-card/50 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-xl text-foreground">
                {canRequestUpgrade
                  ? `Solicitar upgrade a ${target.name}`
                  : currentId === 'custom'
                    ? 'Ya estás en el plan más alto'
                    : 'Elegí un plan superior'}
              </h2>
              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
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

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-85"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {canRequestUpgrade ? 'Solicitar por WhatsApp' : 'Hablar con ventas'}
              </a>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="inline-flex items-center justify-center gap-2 border border-foreground px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {isSendingEmail ? 'Enviando…' : 'Enviar email'}
              </button>
            </div>
          </div>

          <p className="mt-4 border-t border-border pt-3 text-[10px] leading-relaxed text-muted-foreground">
            Los planes se activan manualmente al confirmar el pago — no hay cobros automáticos. Si ya
            pagaste y el plan sigue bloqueado, contanos el número de comprobante en el mensaje.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
};

export default UpgradePlan;
