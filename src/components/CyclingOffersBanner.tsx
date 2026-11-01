import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus, Flame } from 'lucide-react';
import { CyclingOffer } from '@/types/mimenu';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const CyclingOffersBanner: React.FC = () => {
  const { activeOffers, recordOfferImpression, recordOfferClick, recordOfferConversion, venue } = useMimenu();
  const { addItem } = useCart();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    activeOffers.forEach(offer => {
      recordOfferImpression(offer.id);
    });
  }, [activeOffers, recordOfferImpression]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(activeOffers.length - 1, 0)));
  }, [activeOffers.length]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, activeOffers.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
    setActiveIndex(clamped);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  if (activeOffers.length === 0) return null;

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
    <section className="mb-8" aria-labelledby="live-offers-heading">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
          <h3 id="live-offers-heading" className="text-sm font-bold tracking-tight text-foreground uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
            Ofertas del Momento
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
          Disponibles por tiempo limitado
        </span>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carrusel"
          aria-label="Ofertas del momento"
        >
          {activeOffers.map((offer, index) => {
            const discountPct = Math.round(
              ((offer.original_price - offer.discount_price) / offer.original_price) * 100
            );

            return (
              <div
                key={offer.id}
                className="w-full flex-none snap-center"
                aria-roledescription="oferta"
                aria-label={`${index + 1} de ${activeOffers.length}`}
              >
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group h-full">
                  {/* Badge & Discount */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                      <Flame className="w-3 h-3 fill-current" aria-hidden="true" />
                      <span>{offer.badge || 'PROMO'}</span>
                    </div>
                    <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                      -{discountPct}% OFF
                    </div>
                  </div>

                  {/* Offer Info */}
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-amber-500 transition-colors">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>

                    {offer.included_item_names && offer.included_item_names.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {offer.included_item_names.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-border">
                    <div>
                      <div className="text-[11px] text-muted-foreground line-through tabular-nums">
                        {venue.currency} {offer.original_price}
                      </div>
                      <div className="text-lg font-black text-amber-500 tabular-nums">
                        {venue.currency} {offer.discount_price}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddOfferToCart(offer)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pedir Combo</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeOffers.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Oferta anterior"
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-stone-900/70 text-white shadow-md backdrop-blur-sm transition hover:bg-stone-900/90 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === activeOffers.length - 1}
              aria-label="Siguiente oferta"
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-stone-900/70 text-white shadow-md backdrop-blur-sm transition hover:bg-stone-900/90 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5">
              {activeOffers.map((offer, index) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Ir a la oferta ${index + 1}`}
                  aria-current={index === activeIndex}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-border hover:bg-amber-500/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
