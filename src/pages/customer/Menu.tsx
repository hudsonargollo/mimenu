import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Star, 
  Plus, 
  Minus, 
  Sparkles, 
  ShoppingBag, 
  UtensilsCrossed, 
  ChevronRight,
  MapPin,
  Clock,
  Leaf,
  AlertCircle
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { MenuItemDetail } from '@/types/mimenu';
import { MimenuHeader } from '@/components/MimenuHeader';
import { HotnessIndicator } from '@/components/HotnessIndicator';
import { ItemReviewDialog } from '@/components/ItemReviewDialog';
import { CyclingOffersBanner } from '@/components/CyclingOffersBanner';
import { CartDrawerExpress } from '@/components/CartDrawerExpress';
import { MenuChatbot } from '@/components/chatbot/MenuChatbot';
import { pickLocalText } from '@/lib/venueContext';
import type { Lang } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Menu: React.FC = () => {
  const { venue, categories, selectedTable, fulfillmentType } = useMimenu();
  const { addItem, removeItem, getItemQuantity, getTotalItems, getTotalPrice } = useCart();

  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('all');
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyHot, setOnlyHot] = useState<boolean>(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<MenuItemDetail | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Lang>('es');

  useEffect(() => {
    document.title = `${venueName} — Menú Digital`;
  }, [venueName]);

  // Flatten and filter items
  const allItems = useMemo(() => {
    return categories.flatMap(cat => cat.items);
  }, [categories]);

  // Localized display fields for the current UI language (falls back to the
  // plain Spanish field when the tenant has no translation).
  const itemName = (item: MenuItemDetail) => pickLocalText(item.name_i18n, currentLang) || item.name;
  const itemDesc = (item: MenuItemDetail) =>
    pickLocalText(item.description_i18n, currentLang) || item.description || '';
  const catName = (cat: { name: string; name_i18n?: Record<Lang, string> }) =>
    pickLocalText(cat.name_i18n, currentLang) || cat.name;
  const venueName = pickLocalText(venue.name_i18n, currentLang) || venue.name;
  const venueDesc = pickLocalText(venue.description_i18n, currentLang) || venue.description;

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Category filter
      if (activeCategoryKey !== 'all' && item.category_id !== activeCategoryKey) {
        return false;
      }
      // Hot filter
      if (onlyHot && item.hotness_score < 4) {
        return false;
      }
      // Dietary filter
      if (activeDietaryFilter !== 'all') {
        const matchesDiet = item.dietary?.includes(activeDietaryFilter);
        const matchesAllergens = !item.allergens?.includes(activeDietaryFilter.replace('Sin ', ''));
        if (!matchesDiet && !matchesAllergens) return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = itemName(item).toLowerCase().includes(term);
        const matchesDesc = (itemDesc(item) || item.description || '').toLowerCase().includes(term);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(term));
        return matchesName || matchesDesc || matchesTags;
      }
      return true;
    });
  }, [allItems, activeCategoryKey, onlyHot, activeDietaryFilter, searchTerm]);

  const handleAddToCart = (item: MenuItemDetail) => {
    addItem({
      id: item.id,
      name: item.name,
      name_i18n: item.name_i18n,
      description: item.description,
      description_i18n: item.description_i18n,
      price: item.price,
      category_id: item.category_id,
      available: item.is_available,
    });
    toast.success(`Agregaste 1x ${itemName(item)}`, {
      description: `${venue.currency} ${item.price}`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-500 selection:text-white pb-24">
      {/* Dynamic Header */}
      <MimenuHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        {/* Venue Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-950 text-white p-6 md:p-8 mb-8 border border-slate-800 shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{venue.city || 'Santa Cruz de la Sierra'} • {venue.tagline}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {venueName}
            </h1>
            
            <p className="text-xs md:text-sm text-slate-300 font-normal leading-relaxed">
              {venueDesc}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                {venue.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                {venue.opening_hours}
              </span>
            </div>
          </div>
        </div>

        {/* Intelligent Cycling Offers Banner */}
        <CyclingOffersBanner />

        {/* Category Navigation Bar & Hotness Filter */}
        <div className="sticky top-24 z-30 bg-background/95 backdrop-blur-md py-3 mb-6 border-b border-border flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategoryKey('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategoryKey === 'all'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos ({allItems.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryKey(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategoryKey === cat.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {catName(cat)} ({cat.items.length})
              </button>
            ))}
          </div>

          {/* Hotness Filter Toggle */}
          <button
            onClick={() => setOnlyHot(!onlyHot)}
            aria-pressed={onlyHot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              onlyHot
                ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlyHot ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} aria-hidden="true" />
            <span>Más Pedidos</span>
          </button>
        </div>

        {/* Dietary & Allergen Filters Row */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap mr-1">Filtros:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'Sin Gluten', label: 'Sin Gluten' },
            { id: 'Vegetariano', label: 'Vegetariano' },
            { id: 'Picante', label: 'Picante' },
            { id: 'Sin Lácteos', label: 'Sin Lácteos' }
          ].map((df) => (
            <button
              key={df.id}
              onClick={() => setActiveDietaryFilter(df.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                activeDietaryFilter === df.id
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-muted/30 text-muted-foreground border-border hover:border-slate-400 hover:text-foreground'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
            <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" aria-hidden="true" />
            <h3 className="text-base font-bold text-foreground">No encontramos platos con esos filtros</h3>
            <p className="text-xs text-muted-foreground mt-1">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-xs"
              onClick={() => {
                setActiveCategoryKey('all');
                setSearchTerm('');
                setOnlyHot(false);
              }}
            >
              Restablecer Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const qtyInCart = getItemQuantity(item.id);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="group relative flex flex-col justify-between bg-card hover:bg-card/90 border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
                >
                  {/* Product Image & Badges */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                    <img
                      src={item.image_url}
                      alt={itemName(item)}
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {item.is_best_seller && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                            <span>MÁS VENDIDO</span>
                          </span>
                        )}
                        {item.original_price && (
                          <span className="bg-rose-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                            PROMO
                          </span>
                        )}
                      </div>

                      {/* Hotness Score Tag */}
                      <HotnessIndicator score={item.hotness_score} compact />
                    </div>

                    {/* Bottom Price in Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        {item.original_price && (
                          <span className="text-xs text-white/70 line-through mr-2 font-medium tabular-nums">
                            {venue.currency} {item.original_price}
                          </span>
                        )}
                        <span className="text-lg font-black text-amber-400 drop-shadow-xs tabular-nums">
                          {venue.currency} {item.price}
                        </span>
                      </div>

                      {/* Review Star Button */}
                      <button
                        onClick={() => setSelectedReviewItem(item)}
                        aria-label={`Ver opiniones de ${itemName(item)}`}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20 transition-all"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                        <span className="tabular-nums">{item.average_rating || 5.0}</span>
                        <span className="text-[10px] text-white/70 tabular-nums">({item.reviews_count})</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug group-hover:text-amber-500 transition-colors">
                        {itemName(item)}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {itemDesc(item) || 'Preparado al momento con ingredientes seleccionados.'}
                      </p>

                      {/* Tags & Dietary Badges */}
                      {(item.tags || item.dietary || item.allergens) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.dietary?.map((diet, idx) => (
                            <span
                              key={`diet-${idx}`}
                              className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <Leaf className="w-2.5 h-2.5" aria-hidden="true" />
                              <span>{diet}</span>
                            </span>
                          ))}
                          {item.tags?.map((tag, idx) => (
                            <span
                              key={`tag-${idx}`}
                              className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.allergens && item.allergens.length > 0 && (
                            <span
                              className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1"
                              title={`Contiene: ${item.allergens.join(', ')}`}
                            >
                              <AlertCircle className="w-2.5 h-2.5" aria-hidden="true" />
                              <span>Alérgenos: {item.allergens.slice(0, 2).join(', ')}{item.allergens.length > 2 ? '...' : ''}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hotness Thermometer Bar */}
                    <div className="pt-2 border-t border-border">
                      <HotnessIndicator
                        score={item.hotness_score}
                        velocity24h={item.velocity_24h}
                        showThermometer={true}
                      />
                    </div>

                    {/* Add to Cart Actions */}
                    <div className="pt-1">
                      {qtyInCart === 0 ? (
                        <Button
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 h-9 rounded-xl"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Agregar a la Comanda</span>
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl p-1">
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Quitar uno de ${itemName(item)}`}
                            className="w-7 h-7 rounded-lg bg-background hover:bg-muted text-foreground flex items-center justify-center transition-all shadow-xs"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                              {qtyInCart} en comanda
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
                              {venue.currency} {item.price * qtyInCart}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(item)}
                            aria-label={`Agregar uno más de ${itemName(item)}`}
                            className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center transition-all shadow-xs hover:bg-amber-600"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar for Mobile (Opens Express Drawer) */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label="Ver pedido y confirmar"
            className="w-full bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800 hover:bg-slate-850 active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs tabular-nums">
                {getTotalItems()}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {fulfillmentType === 'dine_in' ? `Mesa ${selectedTable || '1'}` : 'Retiro en Barra'}
                </p>
                <p className="text-xs font-bold text-white">Ver Comanda & Pedir</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-sm text-amber-400 tabular-nums">
              <span>{venue.currency} {getTotalPrice()}</span>
              <ChevronRight className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
          </button>
        </div>
      )}

      <MenuChatbot />

      {/* Item Review Dialog */}
      <ItemReviewDialog
        item={selectedReviewItem}
        isOpen={!!selectedReviewItem}
        onClose={() => setSelectedReviewItem(null)}
      />

      {/* Express Slide-Over Cart Drawer */}
      <CartDrawerExpress
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </div>
  );
};

export default Menu;
