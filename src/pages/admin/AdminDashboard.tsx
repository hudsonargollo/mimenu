import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  ChefHat,
  QrCode,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Camera,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { HotnessIndicator } from '@/components/HotnessIndicator';
import { MenuPhotoIngesterModal } from '@/components/MenuPhotoIngesterModal';
import AdminUpgradeBanner from '@/components/UpgradeBanner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { hasEntitlement, requiredPlanFor } from '@/lib/plans';

const cleanTitle = (title: string) =>
  title.replace(/^[^\p{L}\p{N}]+/u, '').replace(/^destacado:\s*/i, '').trim() || title;

const metricButton =
  'group flex flex-col justify-between gap-7 border-0 bg-transparent p-5 text-left transition-colors hover:bg-card sm:p-6';

const ActionLink: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  solid?: boolean;
  title?: string;
}> = ({ onClick, children, solid, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-[4px] border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors [&>svg]:shrink-0 ${
      solid
        ? 'border-foreground bg-foreground text-background hover:bg-foreground/85'
        : 'border-border bg-card text-foreground hover:border-foreground/40'
    }`}
  >
    {children}
  </button>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { venue, categories, cyclingOffers, activeOffers, tables, orders, recalculateAllHotness } = useMimenu();
  const [isPhotoIngesterOpen, setIsPhotoIngesterOpen] = React.useState(false);
  const canUsePhotoIngester = hasEntitlement(venue?.slug, 'photographed_menu');

  useEffect(() => {
    document.title = `Panel: ${venue.name} | MiMenu`;
  }, [venue.name]);

  const allItems = useMemo(() => categories.flatMap((c) => c.items), [categories]);
  const hotItems = useMemo(
    () =>
      [...allItems]
        .filter((i) => (i.velocity_24h ?? 0) > 0)
        .sort((a, b) => b.hotness_score - a.hotness_score || b.velocity_24h - a.velocity_24h)
        .slice(0, 5),
    [allItems]
  );

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const occupiedTablesCount = tables.filter((t) => t.is_occupied).length;
  const totalOfferRevenue = cyclingOffers.reduce((sum, o) => sum + o.analytics.revenue_generated, 0);
  const totalOfferConversions = cyclingOffers.reduce((sum, o) => sum + o.analytics.conversions, 0);

  const today = new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const kpis = [
    {
      label: 'Ventas del turno',
      value: `${venue.currency} ${totalRevenue.toFixed(0)}`,
      note: 'Basado en pedidos reales',
      icon: TrendingUp,
      onClick: () => navigate('/cashier'),
      accent: 'text-foreground',
    },
    {
      label: 'En cocina',
      value: String(activeOrdersCount),
      note: `${orders.length} pedidos hoy`,
      icon: ChefHat,
      onClick: () => navigate('/cashier'),
      accent: activeOrdersCount > 0 ? 'text-primary' : 'text-foreground',
    },
    {
      label: 'Mesas ocupadas',
      value: `${occupiedTablesCount}/${tables.length}`,
      note: `${tables.length ? Math.round((occupiedTablesCount / tables.length) * 100) : 0}% de capacidad`,
      icon: QrCode,
      onClick: () => navigate('/admin/tables'),
      accent: 'text-foreground',
    },
    {
      label: 'Smart offers',
      value: `${venue.currency} ${totalOfferRevenue.toFixed(0)}`,
      note: `${totalOfferConversions} combos convertidos`,
      icon: Sparkles,
      onClick: () => navigate('/admin/offers'),
      accent: 'text-foreground',
    },
  ];

  return (
    <div className="pb-16">
      <AdminPageHeader
        index="01"
        eyebrow="Panel de control"
        title={venue.name}
        description="Pedidos, ofertas y prueba social en una sola vista editorial."
        meta={
          <>
            <span className="noir-num text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {today}
            </span>
            <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{venue.city}</span>
            <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-primary">
              Plan {venue.plan_name ?? 'Basic'}
            </span>
          </>
        }
        actions={
          <>
            <ActionLink
              onClick={() =>
                canUsePhotoIngester
                  ? setIsPhotoIngesterOpen(true)
                  : navigate('/admin/upgrade?feature=photographed_menu')
              }
              title={
                canUsePhotoIngester
                  ? undefined
                  : `Requiere plan ${requiredPlanFor('photographed_menu').name}`
              }
            >
              {canUsePhotoIngester ? <Camera className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              Escanear carta
            </ActionLink>
            <ActionLink onClick={recalculateAllHotness} title="Recalcular el ranking de popularidad">
              <Flame className="h-3.5 w-3.5" />
              Hotness
            </ActionLink>
            <ActionLink onClick={() => window.open('/menu', '_blank')} solid>
              Ver menú
              <ExternalLink className="h-3 w-3" />
            </ActionLink>
          </>
        }
      />

      <AdminUpgradeBanner />

      {/* Metric band — hairlines instead of cards */}
      <section className="my-8 grid grid-cols-2 divide-x divide-y divide-border border-y border-border lg:grid-cols-4 lg:divide-y-0">
        {kpis.map(({ label, value, note, icon: Icon, onClick, accent }) => (
          <button key={label} type="button" onClick={onClick} className={metricButton}>
            <span className="flex items-start justify-between gap-2">
              <span className="noir-eyebrow">{label}</span>
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className={`noir-num block truncate font-display text-[2rem] leading-none tracking-[-0.03em] sm:text-[2.4rem] ${accent}`}>
                {value}
              </span>
              <span className="mt-2 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                {note}
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </span>
            </span>
          </button>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Hotness leaderboard */}
        <section className="lg:col-span-7">
          <div className="mb-1 flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="flex items-center gap-2 font-display text-[1.35rem] leading-none text-foreground">
              <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
              Ranking de popularidad
            </h2>
            <button
              type="button"
              onClick={() => navigate('/admin/analytics')}
              className="noir-link-underline flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
            >
              Ver algoritmo
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          {hotItems.length === 0 ? (
            <div className="flex flex-col items-start gap-3 border-b border-border py-10">
              <ShoppingBag className="h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
              <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                Todavía no hay ventas registradas. Los platos aparecen acá en cuanto entra el primer pedido.
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary noir-link-underline"
              >
                Revisar la carta
              </button>
            </div>
          ) : (
            <ol>
              {hotItems.map((item, idx) => (
                <li
                  key={item.id}
                  className="group flex items-center gap-4 border-b border-border py-3.5 transition-colors hover:bg-card/60"
                >
                  <span className="noir-num w-6 shrink-0 font-display text-[13px] text-muted-foreground/60">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-[3px] border border-border object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{item.name}</p>
                    <p className="noir-num mt-1 text-[11px] text-muted-foreground">
                      {venue.currency} {item.price} · {item.velocity_24h} vendidos (24 h)
                    </p>
                  </div>
                  <HotnessIndicator score={item.hotness_score} compact />
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Offers + tables */}
        <section className="space-y-8 lg:col-span-5">
          <div>
            <div className="mb-1 flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="flex items-center gap-2 font-display text-[1.35rem] leading-none text-foreground">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Ofertas activas
              </h2>
              <button
                type="button"
                onClick={() => navigate('/admin/offers')}
                className="noir-link-underline flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
              >
                Gestionar
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>

            {activeOffers.length === 0 ? (
              <p className="border-b border-border py-8 text-[13px] leading-relaxed text-muted-foreground">
                Sin ofertas activas. Creá un combo por tiempo limitado desde Ofertas.
              </p>
            ) : (
              activeOffers.map((offer) => {
                const convRate =
                  offer.analytics.impressions > 0
                    ? (offer.analytics.conversions / offer.analytics.impressions) * 100
                    : 0;

                return (
                  <div key={offer.id} className="border-b border-border py-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
                        {offer.badge}
                      </span>
                      <span className="noir-num font-display text-[15px] text-foreground">
                        {venue.currency} {offer.discount_price}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[13px] font-semibold text-foreground">{cleanTitle(offer.title)}</p>
                    <div className="noir-num mt-1.5 flex items-center gap-3 text-[10.5px] text-muted-foreground">
                      <span>{offer.analytics.impressions} vistas</span>
                      <span className="h-2.5 w-px bg-border" aria-hidden="true" />
                      <span>{offer.analytics.conversions} órdenes</span>
                      <span className="h-2.5 w-px bg-border" aria-hidden="true" />
                      <span className="text-foreground">{convRate.toFixed(1)}% conv.</span>
                    </div>
                    <div className="mt-2 h-[2px] w-full bg-muted" aria-hidden="true">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, Math.max(2, convRate))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border border-border bg-card/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="noir-eyebrow">Mesas y QR</p>
                <p className="noir-num mt-2 font-display text-[1.8rem] leading-none text-foreground">
                  {tables.length}
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  mesas con hash único · {occupiedTablesCount} ocupadas
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/tables')}
                className="shrink-0 border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground/40"
              >
                Imprimir
              </button>
            </div>
          </div>
        </section>
      </div>

      <MenuPhotoIngesterModal open={isPhotoIngesterOpen} onOpenChange={setIsPhotoIngesterOpen} />
    </div>
  );
};

export default AdminDashboard;
