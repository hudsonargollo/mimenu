import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, RotateCcw, Sparkles, Star } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { MenuItemDetail } from '@/types/mimenu';
import { pickLocalText } from '@/lib/venueContext';
import type { Lang } from '@/i18n/translations';

interface FlipDeckProps {
  items: MenuItemDetail[];
  currentLang: Lang;
  onAddToCart: (item: MenuItemDetail) => void;
}

const AUTOPLAY_MS = 6500;
const CARD_STYLE = { width: 'min(420px, 100%)', height: 'min(600px, 140vw, 78vh)' } as const;
const PARCHMENT = 'linear-gradient(160deg, #fbf4e4 0%, #f0dfbe 46%, #e3c795 100%)';
const PARCHMENT_DEEP = 'linear-gradient(160deg, #f3e6cc 0%, #e6cfa8 52%, #d9ba85 100%)';

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
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            filled
              ? 'fill-amber-500 text-amber-600'
              : half
                ? 'fill-amber-500/50 text-amber-600'
                : 'fill-transparent text-amber-800/30'
          }`}
        />
      );
    })}
    <span className="ml-1.5 text-[10px] font-semibold tracking-wide text-amber-900/60">
      {rating.toFixed(1)}
    </span>
  </div>
);

const CornerFlourish = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
    <path d="M3 3 Q3 26 26 26" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 3 Q26 3 26 26" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="3" cy="3" r="2.2" fill="currentColor" />
  </svg>
);

const FaceFrame = () => (
  <>
    <CornerFlourish className="absolute left-2.5 top-2.5 z-10 h-8 w-8 text-amber-800/60" />
    <CornerFlourish className="absolute right-2.5 top-2.5 z-10 h-8 w-8 rotate-90 text-amber-800/60" />
    <CornerFlourish className="absolute bottom-2.5 right-2.5 z-10 h-8 w-8 rotate-180 text-amber-800/60" />
    <CornerFlourish className="absolute bottom-2.5 left-2.5 z-10 h-8 w-8 -rotate-90 text-amber-800/60" />
  </>
);

interface FlipCardProps {
  item: MenuItemDetail;
  imageUrl: string | null;
  categoryLabel: string;
  itemName: string;
  itemDesc: string;
  currency: string;
  reducedMotion: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  onAddToCart: () => void;
}

const FlipCard = ({
  item,
  imageUrl,
  categoryLabel,
  itemName,
  itemDesc,
  currency,
  reducedMotion,
  onSwipeNext,
  onSwipePrev,
  onAddToCart,
}: FlipCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const lastDragOffset = useRef(0);
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-220, 220], [-7, 7]);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(pointerY, [0, 1], [7, -7]), {
    stiffness: 170,
    damping: 20,
  });
  const tiltY = useSpring(useTransform(pointerX, [0, 1], [-9, 9]), {
    stiffness: 170,
    damping: 20,
  });
  const glareX = useTransform(pointerX, (value) => `${value * 100}%`);
  const glareY = useTransform(pointerY, (value) => `${value * 100}%`);
  const glare = useMotionTemplate`radial-gradient(320px circle at ${glareX} ${glareY}, rgba(255,255,255,0.55), transparent 68%)`;

  const rating = getRating(item.id);
  const soldOut = item.is_available === false;
  const arReady = (item as any).ar_status === 'ready';
  const onSale = typeof item.original_price === 'number' && item.original_price > item.price;
  const dietary = item.dietary ?? [];
  const allergens = item.allergens ?? [];

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const resetTilt = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const toggleFlip = () => setFlipped((value) => !value);

  return (
    <motion.div
      drag="x"
      style={{ x: dragX, rotateZ: dragRotate, ...CARD_STYLE }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        lastDragOffset.current = info.offset.x;
        if (info.offset.x < -80) onSwipeNext();
        else if (info.offset.x > 80) onSwipePrev();
        dragX.set(0);
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className="relative cursor-grab active:cursor-grabbing"
    >
      <motion.div
        style={{ perspective: 1500, rotateX: tiltX, rotateY: tiltY }}
        className="h-full w-full"
      >
        <motion.div
          onClick={() => {
            if (Math.abs(lastDragOffset.current) > 6) {
              lastDragOffset.current = 0;
              return;
            }
            toggleFlip();
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 120, damping: 17, mass: 0.9 }
          }
          className="relative h-full w-full [transform-style:preserve-3d]"
        >
          {/* Front — photograph */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-[26px] border border-amber-950/25 shadow-[0_36px_80px_-40px_rgba(0,0,0,0.9)] [backface-visibility:hidden]"
            style={{ background: PARCHMENT }}
          >
            <FaceFrame />
            <div className="relative h-[46%] w-full shrink-0 overflow-hidden sm:h-[52%]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={itemName}
                  className="h-full w-full select-none object-cover"
                  style={{ filter: 'sepia(0.12) saturate(1.3) contrast(1.06) brightness(1.03)' }}
                  draggable={false}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-100 to-amber-200/60">
                  <Sparkles className="h-8 w-8 text-amber-700/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#fbf4e4] via-transparent to-black/15" />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: glare, opacity: reducedMotion ? 0 : 0.5 }}
              />
              <span className="absolute left-3 top-3 rounded-md border border-amber-500/30 bg-[#3d2b1f]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-amber-100 backdrop-blur-sm">
                {categoryLabel}
              </span>
              {arReady && (
                <span className="absolute right-3 top-3 rounded-md bg-primary/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                  AR 3D
                </span>
              )}
              {onSale && (
                <span className="absolute bottom-3 right-3 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                  Oferta
                </span>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-3 px-5 pb-4 pt-3.5 text-center max-sm:justify-center">
              <div className="min-h-0 overflow-hidden">
                <h2 className="text-xl font-semibold uppercase leading-tight tracking-wide text-[#3d2b1f]">
                  {itemName}
                </h2>
                <div className="my-1.5">
                  <StarRow rating={rating} />
                </div>
                {itemDesc && (
                  <p className="line-clamp-3 text-[13px] italic leading-snug text-[#6b5638]">
                    {itemDesc}
                  </p>
                )}
              </div>

              <div className="mt-2 flex shrink-0 flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  {onSale && (
                    <span className="text-[11px] font-semibold tabular-nums text-[#8a7350] line-through">
                      {currency} {item.original_price?.toFixed(2)}
                    </span>
                  )}
                  <span className="inline-block rounded-full bg-[#3d2b1f] px-5 py-1.5 text-base font-bold text-amber-100 shadow-md">
                    {currency} {item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddToCart();
                    }}
                    disabled={soldOut}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-amber-600 text-amber-50 shadow-md transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-500/60"
                    aria-label={`Agregar ${itemName} al carrito`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFlip();
                  }}
                  className="inline-flex items-center gap-1 rounded-full border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a6444] transition hover:text-[#3d2b1f]"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Ver ficha
                </button>
              </div>
            </div>
          </div>

          {/* Back — the recipe card */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-[26px] border border-amber-950/25 shadow-[0_36px_80px_-40px_rgba(0,0,0,0.9)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ background: PARCHMENT_DEEP }}
          >
            <FaceFrame />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <Sparkles className="h-40 w-40 text-amber-900/[0.05]" />
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col px-6 pb-10 pt-9 text-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#8a7350]">
                {categoryLabel || 'La casa'}
              </span>
              <h2 className="mt-1.5 font-display text-2xl leading-tight text-[#3d2b1f]">
                {itemName}
              </h2>
              <div className="my-2">
                <StarRow rating={rating} />
              </div>
              <div className="mx-6 h-px bg-[#3d2b1f]/15" aria-hidden="true" />
              <div className="mt-3 flex min-h-0 flex-1 flex-col justify-center gap-4 px-1 text-left">
                <p className="text-center text-[13px] leading-relaxed text-[#5b482e]">
                  {itemDesc || 'Preparado al momento con ingredientes frescos de la casa.'}
                </p>

                {dietary.length > 0 && (
                  <div>
                    <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a7350]">
                      Dieta
                    </p>
                    <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
                      {dietary.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-emerald-800/25 bg-emerald-700/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-900"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {allergens.length > 0 && (
                  <div>
                    <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a7350]">
                      Alérgenos
                    </p>
                    <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
                      {allergens.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-amber-900/25 bg-amber-900/5 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.hotness_score >= 4 && (
                  <p className="inline-flex items-center gap-1.5 self-center rounded-full bg-orange-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-800">
                    <Flame className="h-3 w-3" aria-hidden="true" />
                    De los más pedidos
                  </p>
                )}
              </div>

              <div className="mt-4 flex shrink-0 items-center justify-center gap-2">
                <span className="inline-block shrink-0 whitespace-nowrap rounded-full bg-[#3d2b1f] px-5 py-1.5 text-base font-bold text-amber-100 shadow-md">
                  {currency} {item.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddToCart();
                  }}
                  disabled={soldOut}
                  className="inline-flex h-9 items-center justify-center rounded-full border-0 bg-amber-600 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-50 shadow-md transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-500/60"
                >
                  {soldOut ? 'Agotado' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFlip();
                  }}
                  aria-label="Volver a la foto"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-[#3d2b1f]/10 text-[#3d2b1f] transition hover:bg-[#3d2b1f]/20"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const cardSlide = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 64 : -64, scale: 0.96 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -64 : 64, scale: 0.96 }),
};

export const FlipDeck: React.FC<FlipDeckProps> = ({ items, currentLang, onAddToCart }) => {
  const { venue, categories } = useMimenu();
  const currency = venue.currency || 'Bs.';
  const categoryNameById = useMemo(
    () =>
      categories.reduce<Record<string, string>>((acc, c: any) => {
        acc[c.id] = pickLocalText(c.name_i18n, currentLang) || c.name;
        return acc;
      }, {}),
    [categories, currentLang],
  );

  const [deckIndex, setDeckIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const deckItems = useMemo(
    () => [...items].sort((a, b) => (b.hotness_score ?? 0) - (a.hotness_score ?? 0)),
    [items],
  );

  // Filters can shrink the deck while it is open; keep the index in range.
  useEffect(() => {
    setDeckIndex((index) => (deckItems.length ? index % deckItems.length : 0));
  }, [deckItems.length]);

  useEffect(() => {
    if (deckItems.length <= 1 || prefersReducedMotion || isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setDeckIndex((index) => (index + 1) % deckItems.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [deckItems.length, prefersReducedMotion, isHovered]);

  const goNext = () => {
    if (!deckItems.length) return;
    setDirection(1);
    setDeckIndex((index) => (index + 1) % deckItems.length);
  };
  const goPrev = () => {
    if (!deckItems.length) return;
    setDirection(-1);
    setDeckIndex((index) => (index - 1 + deckItems.length) % deckItems.length);
  };

  const current = deckItems[deckIndex] ?? null;

  return (
    <div className="flex min-h-0 flex-col items-center justify-center px-0 py-6 sm:min-h-[60vh] sm:px-4">
      <div
        ref={deckRef}
        className="relative flex w-full max-w-[560px] items-center justify-center"
        role="group"
        aria-roledescription="carrusel"
        aria-label="Platos destacados"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            goNext();
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goPrev();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsHovered(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsHovered(false);
        }}
      >
        {/* Stacked depth behind the active card */}
        {deckItems.length > 1 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {deckItems.length > 2 && (
              <div
                className="absolute rounded-[26px] border border-amber-900/15 opacity-45"
                style={{
                  ...CARD_STYLE,
                  transform: 'translateY(26px) scale(0.9)',
                  background: PARCHMENT_DEEP,
                }}
              />
            )}
            <div
              className="absolute rounded-[26px] border border-amber-900/20 opacity-70 shadow-xl"
              style={{
                ...CARD_STYLE,
                transform: 'translateY(13px) scale(0.955)',
                background: PARCHMENT,
              }}
            />
          </div>
        )}

        {deckItems.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-0 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-stone-900/80 text-amber-300 transition hover:bg-stone-800 sm:flex"
            aria-label="Plato anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div className="relative" style={CARD_STYLE}>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {current ? (
              <motion.div
                key={current.id}
                custom={direction}
                variants={cardSlide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <FlipCard
                  item={current}
                  imageUrl={current.image_url}
                  categoryLabel={categoryNameById[current.category_id] ?? ''}
                  itemName={pickLocalText(current.name_i18n, currentLang) || current.name}
                  itemDesc={
                    pickLocalText(current.description_i18n, currentLang) ||
                    current.description ||
                    ''
                  }
                  currency={currency}
                  reducedMotion={prefersReducedMotion}
                  onSwipeNext={goNext}
                  onSwipePrev={goPrev}
                  onAddToCart={() => onAddToCart(current)}
                />
              </motion.div>
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[26px] border border-amber-900/20 shadow-2xl"
                style={{ background: PARCHMENT }}
              >
                <Sparkles className="h-8 w-8 text-amber-700/40" />
                <p className="text-xs italic text-amber-800/60">Sin items disponibles.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {deckItems.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-0 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-stone-900/80 text-amber-300 transition hover:bg-stone-800 sm:flex"
            aria-label="Plato siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {deckItems.length > 0 && (
        <div className="mt-5 flex w-full flex-col items-center gap-2 px-4 text-center">
          <p className="hidden max-w-full text-[10px] uppercase leading-relaxed tracking-[0.2em] text-amber-100/40 sm:block">
            Toca la tarjeta para ver la ficha
          </p>
          <div className="flex items-center gap-1.5">
            {deckItems.length <= 10 ? (
              deckItems.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDirection(i > deckIndex ? 1 : -1);
                    setDeckIndex(i);
                  }}
                  aria-label={`Ir al plato ${i + 1}`}
                  aria-current={i === deckIndex}
                  className="flex h-8 w-5 items-center justify-center border-0 bg-transparent p-0"
                >
                  <span
                    className={`rounded-full transition-all duration-300 ${
                      i === deckIndex ? 'h-1.5 w-5 bg-amber-400' : 'h-1.5 w-1.5 bg-stone-600'
                    }`}
                  />
                </button>
              ))
            ) : (
              <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400">
                {deckIndex + 1} / {deckItems.length}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipDeck;
