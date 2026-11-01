import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, MessageCircle, Sparkles } from 'lucide-react';
import { ENTITLEMENT_LABELS, type PlanAccess } from '@/lib/plans';
import { buildUpgradeWhatsAppUrl } from '@/lib/salesContact';

interface PlanRequiredProps {
  access: PlanAccess;
}

const PlanRequired = ({ access }: PlanRequiredProps) => {
  const featureLabel = ENTITLEMENT_LABELS[access.entitlement];
  const noTenant = access.reason === 'no_tenant';
  const lapsed = access.downgraded;

  const whatsappUrl = buildUpgradeWhatsAppUrl({
    venueSlug: noTenant ? null : access.venueSlug,
    currentPlanName: noTenant ? null : access.currentPlan.name,
    targetPlanName: noTenant ? null : access.requiredPlan.name,
    featureLabel: noTenant ? null : featureLabel,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--brand-violet))] text-[hsl(var(--brand-violet-foreground))]">
          <Lock className="h-6 w-6" />
        </div>

        {noTenant ? (
          <>
            <h1 className="text-2xl font-black text-foreground">Sin restaurante activo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No hay un restaurante seleccionado, así que no podemos verificar tu plan. Abre el menú
              con <code className="rounded bg-muted px-1">?v=tu-slug</code> o completa el onboarding.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black text-foreground">
              {featureLabel} está en el plan {access.requiredPlan.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {lapsed
                ? 'Tu plan venció y el restaurante volvió a Básico. Regulariza el pago para recuperar esta función.'
                : `El restaurante ${access.venueSlug} está en el plan ${access.currentPlan.name}, que no incluye esta función.`}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-muted px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Plan actual</dt>
                <dd className="mt-1 font-bold text-foreground">{access.currentPlan.name}</dd>
              </div>
              <div className="rounded-xl bg-[hsl(var(--brand-violet))]/10 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Plan necesario</dt>
                <dd className="mt-1 font-bold text-foreground">{access.requiredPlan.name}</dd>
              </div>
            </dl>

            {access.requiredPlan.priceMonthlyBob !== null && (
              <p className="mt-3 text-sm text-muted-foreground">
                Desde Bs. {access.requiredPlan.priceMonthlyBob}/mes · {access.requiredPlan.description}
              </p>
            )}
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {noTenant ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand-orange))] px-4 py-3 text-sm font-bold text-[hsl(var(--brand-orange-foreground))] transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Activar MiMenu
            </a>
          ) : (
            <>
              <Link
                to={`/admin/upgrade?feature=${access.entitlement}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand-violet))] px-4 py-3 text-sm font-bold text-[hsl(var(--brand-violet-foreground))] transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                Ver opciones de upgrade
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" />
                Escribir a ventas
              </a>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
          {noTenant && (
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="h-4 w-4" />
              Ver planes
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanRequired;
