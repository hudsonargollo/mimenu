import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Sparkles, 
  ChefHat, 
  ShoppingBag, 
  QrCode, 
  TrendingUp, 
  Star, 
  DollarSign, 
  Clock, 
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Camera,
  Lock,
  UtensilsCrossed
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { HotnessIndicator } from '@/components/HotnessIndicator';
import { MenuPhotoIngesterModal } from '@/components/MenuPhotoIngesterModal';
import AdminUpgradeBanner from '@/components/UpgradeBanner';
import { hasEntitlement, requiredPlanFor } from '@/lib/plans';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { venue, categories, cyclingOffers, activeOffers, tables, reviews, orders, recalculateAllHotness } = useMimenu();
  const [isPhotoIngesterOpen, setIsPhotoIngesterOpen] = React.useState(false);
  const canUsePhotoIngester = hasEntitlement(venue?.slug, 'photographed_menu');

  useEffect(() => {
    document.title = `Command Center: ${venue.name} | MiMenu`;
  }, [venue.name]);

  const allItems = categories.flatMap(c => c.items);
  const hasRealOrders = orders.length > 0;
  const hotItems = hasRealOrders
    ? [...allItems].filter((i) => (i.velocity_24h ?? 0) > 0).sort((a, b) => b.hotness_score - a.hotness_score || b.velocity_24h - a.velocity_24h).slice(0, 5)
    : [];

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const occupiedTablesCount = tables.filter(t => t.is_occupied).length;

  const totalOfferRevenue = cyclingOffers.reduce((sum, o) => sum + o.analytics.revenue_generated, 0);
  const totalOfferConversions = cyclingOffers.reduce((sum, o) => sum + o.analytics.conversions, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Command Center: {venue.name}
            </h1>
            <span className="text-xs bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 rounded border border-amber-500/30">
              {venue.city}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gestión de pedidos, ofertas inteligentes y social proof.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              canUsePhotoIngester
                ? setIsPhotoIngesterOpen(true)
                : navigate('/admin/upgrade?feature=photographed_menu')
            }
            variant="outline"
            title={
              canUsePhotoIngester
                ? undefined
                : `Requiere plan ${requiredPlanFor('photographed_menu').name} — clic para mejorar`
            }
            className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-bold gap-1.5 shadow-sm"
          >
            {canUsePhotoIngester ? (
              <Camera className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>
              {canUsePhotoIngester
                ? 'Escanear Carta con Foto'
                : `Escanear Carta · Plan ${requiredPlanFor('photographed_menu').name}`}
            </span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={recalculateAllHotness}
            className="text-xs font-bold gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Recalcular Hotness</span>
          </Button>

          <Button
            size="sm"
            onClick={() => window.open('/menu', '_blank')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-sm"
          >
            <span>Ver Menú en Vivo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <AdminUpgradeBanner />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="group rounded-3xl border border-white/25 bg-white/[0.08] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.15]">
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/75">Ventas del Turno</p>
              <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <DollarSign className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-white/90">
              {venue.currency} {totalRevenue.toFixed(0)}
            </div>
            <p className="text-[11px] text-emerald-300/90 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" /> Basado en datos reales
            </p>
          </div>
        </div>

        {/* Live Orders in Kitchen */}
        <div onClick={() => navigate('/cashier')} className="cursor-pointer group rounded-3xl border border-white/25 bg-white/[0.08] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.15] hover:border-white/40">
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/75">Pedidos en Cocina / KDS</p>
              <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ChefHat className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-amber-300">
              {activeOrdersCount} activos
            </div>
            <p className="text-[11px] text-white/65 font-semibold">
              {orders.length} pedidos totales hoy
            </p>
          </div>
        </div>

        {/* Table Occupancy */}
        <div onClick={() => navigate('/admin/tables')} className="cursor-pointer group rounded-3xl border border-white/25 bg-white/[0.08] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.15] hover:border-white/40">
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/75">Ocupación de Mesas</p>
              <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <QrCode className="w-4 h-4 text-sky-300" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-white/90">
              {occupiedTablesCount} / {tables.length}
            </div>
            <p className="text-[11px] text-white/65 font-semibold">
              {Math.round((occupiedTablesCount / tables.length) * 100)}% capacidad ocupada
            </p>
          </div>
        </div>

        {/* Cycling Offers Revenue */}
        <div onClick={() => navigate('/admin/offers')} className="cursor-pointer group rounded-3xl border border-white/25 bg-white/[0.08] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.15] hover:border-white/40">
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/75">Ventas Smart Offers</p>
              <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Sparkles className="w-4 h-4 text-rose-300" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-rose-300">
              {venue.currency} {totalOfferRevenue.toFixed(0)}
            </div>
            <p className="text-[11px] text-white/65 font-semibold">
              {totalOfferConversions} combos convertidos
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Hotness Leaderboard & Active Smart Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: The "Hotness" Social Proof Leaderboard */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>Ranking de Popularidad & "Hotness"</span>
                </CardTitle>
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  Ver Algoritmo <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-border/60">
              {hotItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <Flame className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  No hay datos de ventas aún. Los platos aparecerán aquí una vez que comience el flujo de pedidos.
                </div>
              ) : (
                hotItems.map((item, idx) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {venue.currency} {item.price} • {item.velocity_24h} vendidos (24h)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <HotnessIndicator score={item.hotness_score} compact />
                    <span className="text-[10px] text-muted-foreground">
                      Base 14d: {item.baseline_14d}/día
                    </span>
                  </div>
                </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Intelligent Cycling Offers Live Status */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Ofertas Inteligentes Activas</span>
                </CardTitle>
                <button
                  onClick={() => navigate('/admin/offers')}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  Gestionar <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {activeOffers.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-6">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  No hay ofertas activas. Crea tu primera Oferta Inteligente desde aquí.
                </div>
              ) : (
              activeOffers.map((offer) => {
                const convRate = offer.analytics.impressions > 0 
                  ? ((offer.analytics.conversions / offer.analytics.impressions) * 100).toFixed(1)
                  : '0.0';

                return (
                  <div
                    key={offer.id}
                    className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                        {offer.badge}
                      </span>
                      <span className="text-xs font-black text-amber-500">
                        {venue.currency} {offer.discount_price}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground">{offer.title}</h4>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center border-t border-border/40 text-[10px]">
                      <div>
                        <p className="text-muted-foreground">Vistas</p>
                        <p className="font-bold text-foreground">{offer.analytics.impressions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Órdenes</p>
                        <p className="font-bold text-foreground">{offer.analytics.conversions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conv. %</p>
                        <p className="font-bold text-emerald-500">{convRate}%</p>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </CardContent>
          </Card>

          {/* Table QR Fast Card */}
          <Card className="border border-border/80 shadow-sm bg-gradient-to-br from-blue-500/10 via-card to-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-500" />
                <h4 className="text-xs font-bold text-foreground">Table Mapping & QRs</h4>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/tables')}
                className="text-xs h-7 px-2.5"
              >
                Imprimir Códigos
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {tables.length} mesas configuradas con hashes únicos.
            </p>
          </Card>
        </div>

      </div>

      {/* Menu Photo Ingester Modal */}
      <MenuPhotoIngesterModal
        open={isPhotoIngesterOpen}
        onOpenChange={setIsPhotoIngesterOpen}
      />
    </div>
  );
};

export default AdminDashboard;
