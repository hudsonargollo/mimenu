import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Sparkles, Plus, Flame, ImageOff } from 'lucide-react';
import { CyclingOffer } from '@/types/mimenu';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const slideVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const displayTitle = (title: string) =>
  title.replace(/^[^\p{L}\p{N}]+/u, '').replace(/^destacado:\s*/i, '').trim() || title;

export const CyclingOffersBanner: React.FC = () => {
  const { activeOffers, recordOfferImpression, recordOfferClick, recordOfferConversion, venue } = useMimenu();
  const { addItem } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    activeOffers.forEach(offer => {
      recordOfferImpression(offer.id);
    });
  }, [activeOffers, recordOfferImpression]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(activeOffers.length - 1, 0)));
  }, [activeOffers.length]);

  if (activeOffers.length === 0) return null;

  const goTo = (index: number) => {
    const total = activeOffers.length;
    setActiveIndex(((index % total) + total) % total);
  };
  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  const handleAddOfferToCart = (offer: CyclingOffer) => {
    recordOfferClick(offer.id);
    recordOfferConversion(offer.id, offer.discount_price);

    // Add to cart as special promotional bundle
    addItem({
      id: offer.id,
      name: offer.title.replace(/^[^\w\s]+/, '').trim(),
      description: offer.subtitle,
      price: offer.discount_price,
      category_id: 'cat-promos',
      available: true,
    });

    toast.success(`¡${offer.title} agregada a tu pedido!`, {
      description: `Ahorraste ${venue.currency} ${offer.original_price - offer.discount_price}`,
    });
  };

  return (
    <section className="mb-10" aria-labelledby="live-offers-heading">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 px-1">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
              <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
              Ofertas del Momento
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-stone-500">
              {String(activeIndex + 1).padStart(2, '0')} / {String(activeOffers.length).padStart(2, '0')}
            </span>
          </div>
          <h3
            id="live-offers-heading"
            className="mt-1 font-display text-2xl leading-tight text-stone-900 sm:text-3xl"
          >
            Combos por tiempo limitado
          </h3>
        </div>

        <div className="relative sm:pr-10">
          {/* All slides share one grid cell so height stays stable and transitions crossfade. */}
          <div className="grid">
            {activeOffers.map((offer, index) => {
              const isActive = index === activeIndex;
              const savings = Math.max(0, offer.original_price - offer.discount_price);
              const title = displayTitle(offer.title);

              return (
                <motion.div
                  key={offer.id}
                  className={`col-start-1 row-start-1 ${isActive ? '' : 'pointer-events-none'}`}
                  initial={false}
                  animate={isActive ? 'show' : 'hidden'}
                  variants={slideVariants}
                  drag={isActive && activeOffers.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) goNext();
                    else if (info.offset.x > 60) goPrev();
                  }}
                  aria-hidden={!isActive}
                  aria-roledescription="oferta"
                  aria-label={`${index + 1} de ${activeOffers.length}`}
                >
                  <motion.article
                    variants={itemVariants}
                    className="group relative flex h-full flex-col items-center rounded-[28px] border border-amber-900/10 bg-white p-5 shadow-[0_24px_70px_-32px_rgba(120,53,15,0.45)] sm:flex-row sm:items-center sm:gap-7 sm:p-6 sm:pr-8"
                  >
                    {/* Media — overhangs the card edge on desktop, like a magazine feature */}
                    <motion.div
                      variants={itemVariants}
                      className="relative w-full flex-none sm:-ml-10 sm:w-[236px]"
                    >
                    <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-[0_18px_40px_-18px_rgba(190,18,60,0.55)] sm:h-[228px]">
                      {offer.image_url ? (
                        <img
                          src={offer.image_url}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/80">
                          <ImageOff className="h-8 w-8" aria-hidden="true" />
                        </div>
                      )}
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-rose-600/35 via-transparent to-amber-400/25 mix-blend-multiply"
                        aria-hidden="true"
                      />

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        <Flame className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                        {offer.badge || 'PROMO'}
                      </span>

                      {savings > 0 && (
                        <span className="absolute bottom-3 right-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-rose-600 shadow-md">
                          Ahorrás {venue.currency} {savings}
                        </span>
                      )}
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col items-center pt-5 text-center sm:items-start sm:pt-0 sm:text-left">
                    <motion.span
                      variants={itemVariants}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400"
                    >
                      {offer.subtitle || 'Solo por hoy'}
                    </motion.span>

                    <motion.h4
                      variants={itemVariants}
                      className="mt-2 font-display text-[22px] leading-snug text-stone-900 transition-colors group-hover:text-amber-700 sm:text-[26px]"
                    >
                      {title}
                    </motion.h4>

                    <motion.p
                      variants={itemVariants}
                      className="mt-2 line-clamp-2 max-w-md text-[13px] leading-relaxed text-stone-500"
                    >
                      {offer.description}
                    </motion.p>

                    {offer.included_item_names && offer.included_item_names.length > 0 && (
                      <motion.div variants={itemVariants} className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                        {offer.included_item_names.map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-amber-900/10 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </motion.div>
                    )}

                    <motion.div
                      variants={itemVariants}
                      className="mt-5 flex w-full flex-col items-center gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:justify-between"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold tabular-nums text-stone-400 line-through">
                          {venue.currency} {offer.original_price}
                        </span>
                        <span className="font-display text-2xl font-bold tabular-nums text-amber-600">
                          {venue.currency} {offer.discount_price}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddOfferToCart(offer)}
                        tabIndex={isActive ? 0 : -1}
                        className="w-full gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 font-bold text-white shadow-lg shadow-rose-500/20 transition hover:from-amber-600 hover:to-rose-600 sm:w-auto"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Pedir Combo</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.article>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination — vertical rail on desktop, dots under the card on mobile.
            Buttons keep a 44px hit area; only the inner pill is small. */}
        {activeOffers.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1 sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 sm:flex-col sm:gap-0">
            {activeOffers.map((offer, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Ir a la oferta ${index + 1}`}
                  aria-current={isActive}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent p-0 sm:h-10 sm:w-6"
                >
                  <span
                    className={`rounded-full transition-all duration-300 ${
                      isActive
                        ? 'h-2.5 w-7 bg-gradient-to-r from-amber-500 to-rose-500 sm:h-7 sm:w-2.5 sm:bg-gradient-to-b'
                        : 'h-2.5 w-2.5 bg-stone-300 group-hover:bg-stone-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </section>
  );
};
