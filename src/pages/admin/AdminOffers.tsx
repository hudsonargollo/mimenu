import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Flame, 
  Calendar,
  Layers,
  Percent
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { CyclingOffer } from '@/types/mimenu';
import { toast } from 'sonner';

export const AdminOffers: React.FC = () => {
  const { venue, cyclingOffers, addCyclingOffer, updateCyclingOffer, deleteCyclingOffer } = useMimenu();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('PROMO 2x1');
  const [originalPrice, setOriginalPrice] = useState('60');
  const [discountPrice, setDiscountPrice] = useState('40');
  const [includedItems, setIncludedItems] = useState('1x Salchipapa, 2x Cervezas');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Ingresa un título para la oferta');
      return;
    }

    addCyclingOffer({
      venue_id: venue.id,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Oferta especial por tiempo limitado',
      description: description.trim() || title.trim(),
      badge: badge.trim(),
      original_price: parseFloat(originalPrice) || 50,
      discount_price: parseFloat(discountPrice) || 35,
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      is_active: true,
      priority_level: 1,
      included_item_names: includedItems.split(',').map(s => s.trim()).filter(Boolean),
      schedules: [
        { day_of_week: -1, start_time: startTime, end_time: endTime }
      ],
    });

    setTitle('');
    setSubtitle('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Ofertas Inteligentes & Cycling Promos
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Construye combos dinámicos que se activan y rotan automáticamente en el menú según horarios de Happy Hour o Late Night.
            </p>
          </div>

          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Cancelar' : 'Nueva Oferta Inteligente'}</span>
          </Button>
        </div>

        {/* Create Offer Form */}
        {isCreating && (
          <Card className="border-2 border-primary/40 bg-card p-6 shadow-xl animate-in zoom-in-95">
            <form onSubmit={handleCreate} className="space-y-4">
              <h3 className="text-base font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Configurar Nueva Promoción Cíclica</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Título de la Oferta</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. ⚡ HAPPY HOUR: Fernet Branca 2x1"
                    className="text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Etiqueta / Badge</label>
                  <Input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ej. HAPPY HOUR 2x1, BAJÓN -20%"
                    className="text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Subtítulo Corto</label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ej. 2 Jarras de 1 Litro por el precio de una"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Ítems Incluidos (separados por coma)</label>
                  <Input
                    value={includedItems}
                    onChange={(e) => setIncludedItems(e.target.value)}
                    placeholder="Ej. 1x Salchipapa Monster, 2x Huari 620ml"
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Precio Normal (Bs.)</label>
                    <Input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Precio Promo (Bs.)</label>
                    <Input
                      type="number"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="text-xs font-bold text-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Hora Inicio (HH:MM)</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Hora Fin (HH:MM)</label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Descripción para el Cliente</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles de la promo, ingredientes o condiciones..."
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-primary-foreground font-bold text-xs shadow-md"
                >
                  Guardar & Publicar Oferta
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Existing Offers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cyclingOffers.map((offer) => {
            const conversionRate = offer.analytics.impressions > 0 
              ? ((offer.analytics.conversions / offer.analytics.impressions) * 100).toFixed(1) 
              : '0.0';

            return (
              <Card
                key={offer.id}
                className="border border-border/80 bg-card overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="p-4 bg-muted/20 border-b border-border/60">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                      {offer.badge}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {offer.is_active ? 'Activa' : 'Pausada'}
                      </span>
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={(checked) => updateCyclingOffer(offer.id, { is_active: checked })}
                      />
                    </div>
                  </div>

                  <CardTitle className="text-sm font-black text-foreground mt-2">
                    {offer.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <span className="text-[11px] text-muted-foreground line-through mr-2">
                        {venue.currency} {offer.original_price}
                      </span>
                      <span className="text-base font-black text-amber-500">
                        {venue.currency} {offer.discount_price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>18:00 - 02:00</span>
                    </div>
                  </div>

                  {/* Conversion Metrics Footer */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 grid grid-cols-3 gap-1 text-center text-[10px]">
                    <div>
                      <p className="text-muted-foreground">Vistas</p>
                      <p className="font-bold text-foreground">{offer.analytics.impressions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Órdenes</p>
                      <p className="font-bold text-foreground">{offer.analytics.conversions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ingresos</p>
                      <p className="font-bold text-emerald-500">{venue.currency} {offer.analytics.revenue_generated}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => deleteCyclingOffer(offer.id)}
                      className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
