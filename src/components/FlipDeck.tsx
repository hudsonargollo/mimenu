import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Sparkles, Star, X } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { MenuItemDetail } from '@/types/mimenu';
import { pickLocalText } from '@/lib/venueContext';
import type { Lang } from '@/i18n/translations';
import { toast } from 'sonner';

interface FlipDeckProps {
  items: MenuItemDetail[];
  currentLang: Lang;
  onAddToCart: (item: MenuItemDetail) => void;
}

const CARD_STYLE = { width: 'min(300px, 100%)', height: 'min(460px, 68vh)' } as const;

const getRating = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return 4 + (hash % 11) / 10;
};

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center justify-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => {
      const filled = rating >= i + 1;
      const half = !filled && rating > i;
      return (
        <Star key={i} className={`w-3.5 h-3.5 ${filled ? 'fill-amber-500 text-amber-600' : half ? 'fill-amber-500/50 text-amber-600' : 'fill-transparent text-amber-800/30'}`} />
      );
    })}
    <span className="ml-1.5 text-[10px] text-amber-900/60 font-semibold tracking-wide">{rating.toFixed(1)}</span>
  </div>
);

const CornerFlourish = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none">
    <path d="M3 3 Q3 26 26 26" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 3 Q26 3 26 26" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="3" cy="3" r="2.2" fill="currentColor" />
  </svg>
);

const flipVariants = {
  enter: (dir: number) => ({ rotateY: dir >= 0 ? 78 : -78, opacity: 0, scale: 0.92 }),
  center: { rotateY: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ rotateY: dir >= 0 ? -78 : 78, opacity: 0, scale: 0.92 }),
};

interface FlipCardProps {
  item: MenuItemDetail;
  direction: number;
  imageUrl: string | null;
  categoryLabel: string;
  itemName: string;
  itemDesc: string;
  currency: string;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  onAddToCart: () => void;
}

const FlipCard = ({ item, direction, imageUrl, categoryLabel, itemName, itemDesc, currency, onSwipeNext, onSwipePrev, onAddToCart }: FlipCardProps) => {
  const x = useMotionValue(0);
  const rotateZ = useTransform(x, [-200, 200], [-10, 10]);
  const arReady = (item as any).ar_status === 'ready';

  return (
    <motion.div
      drag="x"
      style={{ x, rotateZ, ...CARD_STYLE }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80) onSwipeNext();
        else if (info.offset.x > 80) onSwipePrev();
        x.set(0);
      }}
      className="relative cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full" style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={item.id}
            custom={direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 rounded-[26px] overflow-hidden shadow-2xl shadow-black/60 border border-amber-900/20 flex flex-col"
            style={{ background: 'linear-gradient(160deg, #f8efdc 0%, #eeddb9 45%, #e4c99a 100%)', transformStyle: 'preserve-3d' }}
          >
            <CornerFlourish className="absolute top-2.5 left-2.5 w-8 h-8 text-amber-800/60 z-10" />
            <CornerFlourish className="absolute top-2.5 right-2.5 w-8 h-8 text-amber-800/60 z-10 rotate-90" />
            <CornerFlourish className="absolute bottom-2.5 right-2.5 w-8 h-8 text-amber-800/60 z-10 rotate-180" />
            <CornerFlourish className="absolute bottom-2.5 left-2.5 w-8 h-8 text-amber-800/60 z-10 -rotate-90" />

            <div className="relative h-[52%] w-full overflow-hidden shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt={itemName} className="w-full h-full object-cover select-none" style={{ filter: 'sepia(0.12) saturate(1.3) contrast(1.06) brightness(1.03)' }} draggable={false} loading="lazy" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-100 to-amber-200/60">
                  <Sparkles className="w-8 h-8 text-amber-700/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8efdc] via-transparent to-black/10" />
              <span className="absolute top-3 left-3 bg-[#3d2b1f]/90 text-amber-100 border border-amber-500/30 text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm">
                {categoryLabel}
              </span>
              {arReady && (
                <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  AR 3D
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-between text-center px-5 pt-3.5 pb-4 min-h-0">
              <div className="min-h-0 overflow-hidden">
                <h2 className="text-xl uppercase tracking-wide text-[#3d2b1f] font-semibold leading-tight">{itemName}</h2>
                <div className="my-1.5"><StarRow rating={getRating(item.id)} /></div>
                {itemDesc && <p className="italic text-[13px] text-[#6b5638] leading-snug line-clamp-3">{itemDesc}</p>}
              </div>
              <div className="mt-2 flex items-center gap-2 shrink-0">
                <span className="inline-block bg-[#3d2b1f] text-amber-100 font-bold text-base px-5 py-1.5 rounded-full shadow-md">
                  {currency} {item.price.toFixed(2)}
                </span>
                <button
                  onClick={onAddToCart}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-600 text-amber-50 shadow-md hover:bg-amber-700 transition"
                  aria-label="Agregar al carrito"
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const FlipDeck: React.FC<FlipDeckProps> = ({ items, currentLang, onAddToCart }) => {
  const { venue, categories } = useMimenu();
  const currency = venue.currency || 'Bs.';
  const categoryNameById = useMemo(() => categories.reduce<Record<string, string>>((acc, c: any) => {
    acc[c.id] = pickLocalText(c.name_i18n, currentLang) || c.name;
    return acc;
  }, {}), [categories, currentLang]);

  const [deckIndex, setDeckIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = useMemo(() => ['all', ...categories.map((c: any) => c.id)], [categories]);

  const deckItems = useMemo(() => {
    let base = items;
    if (activeTab !== 'all') base = base.filter((i) => i.category_id === activeTab);
    const q = searchQuery.trim().toLowerCase();
    if (q) base = base.filter((i) => (pickLocalText(i.name_i18n, currentLang) || i.name).toLowerCase().includes(q));
    return base;
  }, [items, activeTab, searchQuery, currentLang]);

  useEffect(() => { setDeckIndex(0); setDirection(0); }, [activeTab]);

  useEffect(() => {
    if (searchQuery || deckItems.length <= 1) return;
    const t = setInterval(() => { setDirection(1); setDeckIndex((i) => (i + 1) % deckItems.length); }, 4500);
    return () => clearInterval(t);
  }, [searchQuery, deckItems.length]);

  const goNext = () => { if (!deckItems.length) return; setDirection(1); setDeckIndex((i) => (i + 1) % deckItems.length); };
  const goPrev = () => { if (!deckItems.length) return; setDirection(-1); setDeckIndex((i) => (i - 1 + deckItems.length) % deckItems.length); };

  const current = deckItems[deckIndex] ?? null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-6">
      <div className="relative w-full max-w-[430px] flex items-center justify-center">
        {deckItems.length > 1 && (
          <button onClick={goPrev} className="absolute left-0 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-stone-900/70 border border-amber-500/30 text-amber-300 hover:bg-stone-800/90 transition" aria-label="Anterior">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {current ? (
          <FlipCard
            item={current}
            direction={direction}
            imageUrl={current.image_url}
            categoryLabel={categoryNameById[current.category_id] ?? ''}
            itemName={pickLocalText(current.name_i18n, currentLang) || current.name}
            itemDesc={pickLocalText(current.description_i18n, currentLang) || current.description || ''}
            currency={currency}
            onSwipeNext={goNext}
            onSwipePrev={goPrev}
            onAddToCart={() => onAddToCart(current)}
          />
        ) : (
          <div className="rounded-[26px] flex flex-col items-center justify-center gap-2 border border-amber-900/20 shadow-2xl" style={{ background: 'linear-gradient(160deg, #f8efdc 0%, #eeddb9 45%, #e4c99a 100%)', ...CARD_STYLE }}>
            <Sparkles className="w-8 h-8 text-amber-700/40" />
            <p className="text-xs text-amber-800/60 italic">Sin items disponibles.</p>
          </div>
        )}
        {deckItems.length > 1 && (
          <button onClick={goNext} className="absolute right-0 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-stone-900/70 border border-amber-500/30 text-amber-300 hover:bg-stone-800/90 transition" aria-label="Siguiente">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-[430px] mt-4">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Buscar platos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900/80 border border-stone-700/60 rounded-full py-2 pl-8 pr-8 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300" aria-label="Limpiar">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 pt-2 w-full max-w-[430px]">
        {tabs.map((tabId) => {
          const label = tabId === 'all' ? 'Todos' : (categoryNameById[tabId] ?? tabId);
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 shrink-0 min-h-[30px] ${activeTab === tabId ? 'bg-amber-700 text-amber-50 font-medium shadow-sm scale-105' : 'text-stone-300 hover:text-stone-100 bg-stone-900/60'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {deckItems.length > 0 && (
        <div className="mt-3 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            {deckItems.length <= 10 ? deckItems.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === deckIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-stone-600'}`} />
            )) : (
              <span className="text-[10px] text-stone-400 tracking-widest uppercase font-medium">{deckIndex + 1} / {deckItems.length}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipDeck;