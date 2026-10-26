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
  AlertCircle,
  Box
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { MenuItemDetail } from '@/types/mimenu';
import { MimenuHeader } from '@/components/MimenuHeader';
import { HotnessIndicator } from '@/components/HotnessIndicator';
import { ItemReviewDialog } from '@/components/ItemReviewDialog';
import { CyclingOffersBanner } from '@/components/CyclingOffersBanner';
import { CartDrawerExpress } from '@/components/CartDrawerExpress';
import { FlipDeck } from '@/components/FlipDeck';
import { MenuChatbot } from '@/components/chatbot/MenuChatbot';
import { pickLocalText } from '@/lib/venueContext';
import type { Lang } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ARMenuViewer from '@/components/ARMenuViewer';
import { useARModels, useARModelsIds } from '@/hooks/useARModels';
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
  const [arPreviewItem, setARPreviewItem] = useState<MenuItemDetail | null>(null);

  const venueName = pickLocalText(venue.name_i18n, currentLang) || venue.name;
  const venueDesc = pickLocalText(venue.description_i18n, currentLang) || venue.description;

  useEffect(() => {
    document.title = `${venueName} — Menú Digital`;
  }, [venueName]);

  // Flatten and filter items
  const allItems = useMemo(() => {
    return categories.flatMap(cat => cat.items);
  }, [categories]);

  // AR/3D records for chips ("Ver en 3D") fetched from the KV/Functions layer.
  const arIds = useARModelsIds(useMemo(() => allItems.map((i) => i.id), [allItems]));
  const arRecords = useARModels(arIds);

  // Localized display fields for the current UI language (falls back to the
  // plain Spanish field when the tenant has no translation).
  const itemName = (item: MenuItemDetail) => pickLocalText(item.name_i18n, currentLang) || item.name;
  const itemDesc = (item: MenuItemDetail) =>
    pickLocalText(item.description_i18n, currentLang) || item.description || '';
  const catName = (cat: { name: string; name_i18n?: Record<Lang, string> }) =>
    pickLocalText(cat.name_i18n, currentLang) || cat.name;

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

        {/* Flip Deck (default template) */}
        <FlipDeck
          items={filteredItems}
          currentLang={currentLang}
          onAddToCart={handleAddToCart}
        />
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

      {/* 3D / AR Preview Dialog */}
      <Dialog
        open={!!arPreviewItem}
        onOpenChange={(open) => !open && setARPreviewItem(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{arPreviewItem ? itemName(arPreviewItem) : ''}</DialogTitle>
          </DialogHeader>
          {arPreviewItem && arRecords[arPreviewItem.id]?.glb_url && (
            <ARMenuViewer
              glbSrc={arRecords[arPreviewItem.id].glb_url!}
              iosSrc={arRecords[arPreviewItem.id].usdz_url}
              altText={itemName(arPreviewItem)}
              productName={itemName(arPreviewItem)}
              height={280}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Express Slide-Over Cart Drawer */}
      <CartDrawerExpress
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </div>
  );
};

export default Menu;
