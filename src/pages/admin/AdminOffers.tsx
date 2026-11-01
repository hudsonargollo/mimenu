import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Plus, Trash2, Clock } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { CyclingOffer } from '@/types/mimenu';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
        <AdminPageHeader
          index="04"
          eyebrow="Ofertas"
          title="Ofertas inteligentes"
          description="Combos dinámicos que se activan y rotan solos en el menú según horarios de Happy Hour o Late Night."
          actions={
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground bg-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {isCreating ? 'Cancelar' : 'Nueva oferta'}
            </button>
          }
          meta={
            <>
              <span className="noir-eyebrow">{cyclingOffers.length} ofertas cíclicas</span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-eyebrow">{cyclingOffers.filter((o) => o.is_active).length} activas</span>
            </>
          }
        />

        {/* Create Offer Form */}
        {isCreating && (
          <Card className="mb-8 bg-card p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <h3 className="noir-eyebrow flex items-center gap-2 text-primary">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Configurar nueva promoción cíclica
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
                  className="rounded-[4px] border border-foreground bg-foreground px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-background shadow-none hover:bg-foreground/85"
                >
                  Guardar y publicar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Existing Offers List */}
        <div className="grid grid-cols-1 border-l border-border md:grid-cols-2 lg:grid-cols-3">
          {cyclingOffers.map((offer) => {
            const conversionRate = offer.analytics.impressions > 0
              ? ((offer.analytics.conversions / offer.analytics.impressions) * 100).toFixed(1)
              : '0.0';
            const title = offer.title.replace(/^[^\p{L}\p{N}]+/u, '').replace(/^destacado:\s*/i, '').trim() || offer.title;

            return (
              <article
                key={offer.id}
                className="flex flex-col justify-between border-b border-r border-border p-5 transition-colors hover:bg-card/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="border border-primary/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
                      {offer.badge}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="noir-eyebrow">{offer.is_active ? 'Activa' : 'Pausada'}</span>
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={(checked) => updateCyclingOffer(offer.id, { is_active: checked })}
                      />
                    </div>
                  </div>

                  <h3 className="mt-3 font-display text-lg leading-tight tracking-[-0.01em] text-foreground">
                    {title}
                  </h3>
                </div>

                <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                  {offer.description}
                </p>

                <div className="mt-4 flex items-end justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="noir-num text-[11px] text-muted-foreground line-through">
                      {venue.currency} {offer.original_price}
                    </span>
                    <span className="noir-num font-display text-xl leading-none text-primary">
                      {venue.currency} {offer.discount_price}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    18:00 – 02:00
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 divide-x divide-border border border-border text-center">
                  <div className="px-2 py-2">
                    <p className="noir-eyebrow text-[8px]">Vistas</p>
                    <p className="noir-num mt-0.5 text-[12px] font-bold text-foreground">{offer.analytics.impressions}</p>
                  </div>
                  <div className="px-2 py-2">
                    <p className="noir-eyebrow text-[8px]">Órdenes</p>
                    <p className="noir-num mt-0.5 text-[12px] font-bold text-foreground">{offer.analytics.conversions}</p>
                  </div>
                  <div className="px-2 py-2">
                    <p className="noir-eyebrow text-[8px]">Ingresos</p>
                    <p className="noir-num mt-0.5 text-[12px] font-bold text-emerald-700">{venue.currency} {offer.analytics.revenue_generated}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="noir-num text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {conversionRate}% conversión
                  </span>
                  <button
                    onClick={() => deleteCyclingOffer(offer.id)}
                    className="inline-flex items-center gap-1 border-0 border-b border-transparent bg-transparent pb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" /> Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
