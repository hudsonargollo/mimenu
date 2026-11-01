import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Star,
  Plus,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
  Leaf,
  Box,
  Share2,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { MenuItemDetail } from '@/types/mimenu';
import { MimenuHeader } from '@/components/MimenuHeader';
import { ItemReviewDialog } from '@/components/ItemReviewDialog';
import { CyclingOffersBanner } from '@/components/CyclingOffersBanner';
import { CartDrawerExpress } from '@/components/CartDrawerExpress';
import { FlipDeck } from '@/components/FlipDeck';
import { MenuChatbot } from '@/components/chatbot/MenuChatbot';
import { pickLocalText } from '@/lib/venueContext';
import { isSafeMediaUrl } from '@/lib/media';
import { useLang } from '@/i18n/LanguageProvider';
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
import { hasEntitlement } from '@/lib/plans';
import { toast } from 'sonner';

const Menu: React.FC = () => {
  const { venue, categories, selectedTable, fulfillmentType } = useMimenu();
  const { addItem, getTotalItems, getTotalPrice } = useCart();

  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyHot, setOnlyHot] = useState<boolean>(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<MenuItemDetail | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { lang: currentLang } = useLang();
  const [arPreviewItem, setARPreviewItem] = useState<MenuItemDetail | null>(null);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const venueName = pickLocalText(venue.name_i18n, currentLang) || venue.name;
  const venueDesc = pickLocalText(venue.description_i18n, currentLang) || venue.description;
  const venueTagline = pickLocalText(venue.tagline_i18n, currentLang) || venue.tagline;

  useEffect(() => {
    document.title = `${venueName} — Menú Digital`;
  }, [venueName]);

  const allItems = useMemo(() => categories.flatMap(cat => cat.items), [categories]);

  // AR/3D records for chips ("Ver en 3D") fetched from the KV/Functions layer.
  // Premium-only: Basic/Pro venues never call the AR endpoints.
  const hasAr = hasEntitlement(venue.slug, 'ar_3d');
  const hasConcierge = hasEntitlement(venue.slug, 'whatsapp_concierge');
  const arIds = useARModelsIds(useMemo(() => (hasAr ? allItems.map((i) => i.id) : []), [allItems, hasAr]));
  const arRecords = useARModels(arIds, venue.slug);

  const itemName = (item: MenuItemDetail) => pickLocalText(item.name_i18n, currentLang) || item.name;
  const itemDesc = (item: MenuItemDetail) =>
    pickLocalText(item.description_i18n, currentLang) || item.description || '';
  const catName = (cat: { name: string; name_i18n?: Record<Lang, string> }) =>
    pickLocalText(cat.name_i18n, currentLang) || cat.name;

  // Hero media — admin-set video wins, then poster/banner, then a featured dish photo.
  const heroVideo = isSafeMediaUrl(venue.hero_video_url) ? venue.hero_video_url!.trim() : '';
  const showHeroVideo = !!heroVideo && !prefersReducedMotion && !heroVideoFailed;

  // A previous URL may have failed; give a newly entered one a fresh chance.
  useEffect(() => {
    setHeroVideoFailed(false);
  }, [heroVideo]);

  // Items highlighted in the featured flip deck (admin selection, else flags).
  const featuredCandidates = useMemo(() => {
    const ids = new Set(venue.featured_item_ids ?? []);
    const selected = allItems.filter((item) =>
      ids.size > 0 ? ids.has(item.id) : item.is_featured || item.is_best_seller,
    );
    if (selected.length > 0) return selected;
    return [...allItems]
      .sort((a, b) => (b.hotness_score ?? 0) - (a.hotness_score ?? 0))
      .slice(0, 6);
  }, [allItems, venue.featured_item_ids]);

  const heroPhoto = useMemo(() => {
    const featuredPhoto = featuredCandidates.find((item) => isSafeMediaUrl(item.image_url))?.image_url;
    const match = [venue.hero_poster_url, venue.banner_url, featuredPhoto]
      .find((url) => isSafeMediaUrl(url, true));
    return match ? match.trim() : '';
  }, [featuredCandidates, venue.banner_url, venue.hero_poster_url]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (activeCategoryKey !== 'all' && item.category_id !== activeCategoryKey) {
        return false;
      }
      if (onlyHot && item.hotness_score < 4) {
        return false;
      }
      if (activeDietaryFilter !== 'all') {
        const matchesDiet = item.dietary?.includes(activeDietaryFilter);
        const matchesAllergens = !item.allergens?.includes(activeDietaryFilter.replace('Sin ', ''));
        if (!matchesDiet && !matchesAllergens) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = itemName(item).toLowerCase().includes(term);
        const matchesDesc = (itemDesc(item) || item.description || '').toLowerCase().includes(term);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(term));
        return matchesName || matchesDesc || matchesTags;
      }
      return true;
    });
  }, [allItems, activeCategoryKey, onlyHot, activeDietaryFilter, searchTerm, currentLang]);

  const featuredIds = useMemo(() => new Set(featuredCandidates.map((item) => item.id)), [featuredCandidates]);
  const deckItems = useMemo(
    () => filteredItems.filter((item) => featuredIds.has(item.id) && item.is_available),
    [filteredItems, featuredIds],
  );

  const isFiltering = !!searchTerm.trim() || onlyHot || activeDietaryFilter !== 'all' || activeCategoryKey !== 'all';
  const showGroupedSections = activeCategoryKey === 'all';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address || venueName)}`;

  const handleAddToCart = (item: MenuItemDetail) => {
    if (!item.is_available) return;
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: venueName, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado');
      }
    } catch {
      // User dismissed the share sheet or the clipboard was unavailable.
    }
  };

  const renderItemCard = (item: MenuItemDetail) => {
    const image = isSafeMediaUrl(item.image_url, true) ? item.image_url : '';
    const arReady = !!arRecords[item.id]?.glb_url;
    const isFeatured = featuredIds.has(item.id);
    const rating = item.reviews_count > 0 ? item.average_rating : null;

    if (viewMode === 'list') {
      return (
        <article
          key={item.id}
          className={`group flex items-stretch gap-4 rounded-2xl border border-border bg-card p-3 shadow-xs transition hover:shadow-md ${
            item.is_available ? '' : 'opacity-60'
          }`}
        >
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
            {image ? (
              <img
                src={image}
                alt={itemName(item)}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/50">
                <Sparkles className="h-6 w-6 text-amber-700/40" />
              </div>
            )}
            {item.hotness_score >= 4 && (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                <Flame className="h-2.5 w-2.5 fill-white" aria-hidden="true" />
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold leading-tight text-foreground line-clamp-1">
                  {itemName(item)}
                </h3>
                <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                  {venue.currency} {item.price.toFixed(2)}
                </span>
              </div>
              {itemDesc(item) && (
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-2">
                  {itemDesc(item)}
                </p>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              {rating !== null ? (
                <button
                  type="button"
                  onClick={() => setSelectedReviewItem(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700"
                >
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                  {rating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">({item.reviews_count})</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  {isFeatured && (
                    <>
                      <Sparkles className="h-3 w-3 text-amber-500" aria-hidden="true" />
                      Destacado
                    </>
                  )}
                </span>
              )}

              <div className="flex items-center gap-1.5">
                {arReady && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setARPreviewItem(item)}
                    className="h-7 gap-1 px-2 text-[11px]"
                  >
                    <Box className="h-3 w-3" /> 3D
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.is_available}
                  className="h-7 gap-1 bg-foreground px-2.5 text-[11px] font-bold text-background hover:bg-foreground/90"
                >
                  <Plus className="h-3 w-3" />
                  {item.is_available ? 'Agregar' : 'Agotado'}
                </Button>
              </div>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article
        key={item.id}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
          item.is_available ? '' : 'opacity-60'
        }`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={itemName(item)}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/50">
              <Sparkles className="h-8 w-8 text-amber-700/40" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

          {item.hotness_score >= 4 && (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              <Flame className="h-3 w-3 fill-white" aria-hidden="true" />
              {item.is_available ? 'Muy pedido' : 'Agotado'}
            </span>
          )}
          {isFeatured && (
            <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold text-amber-950 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Destacado
            </span>
          )}

          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-bold tabular-nums text-white backdrop-blur-sm">
            {venue.currency} {item.price.toFixed(2)}
          </span>

          {arReady && (
            <button
              type="button"
              onClick={() => setARPreviewItem(item)}
              className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-900 shadow-sm hover:bg-white"
            >
              <Box className="h-3 w-3" /> Ver en 3D
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <h3 className="font-display text-base font-semibold leading-tight text-foreground line-clamp-2">
            {itemName(item)}
          </h3>
          {itemDesc(item) && (
            <p className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
              {itemDesc(item)}
            </p>
          )}

          {!!item.dietary?.length && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {item.dietary.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  <Leaf className="h-2.5 w-2.5" aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            {rating !== null ? (
              <button
                type="button"
                onClick={() => setSelectedReviewItem(item)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700"
              >
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                {rating.toFixed(1)}
                <span className="font-normal text-muted-foreground">({item.reviews_count})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedReviewItem(item)}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Reseñas
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAddToCart(item)}
              disabled={!item.is_available}
              aria-label={`Agregar ${itemName(item)} al carrito`}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-foreground px-3 text-[11px] font-bold text-background shadow-sm transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              {item.is_available ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-500 selection:text-white pb-24">
      <MimenuHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="flex-1">
        {/* Premium hero — admin-set video background with poster/photo fallback */}
        <section className="relative isolate overflow-hidden bg-[#0b0a09] text-white">
          <div className="absolute inset-0" aria-hidden="true">
            {showHeroVideo ? (
              <video
                key={heroVideo}
                src={heroVideo}
                poster={heroPhoto || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onError={() => setHeroVideoFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : heroPhoto ? (
              <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `radial-gradient(120% 120% at 15% 10%, ${venue.primary_color || '#BC6C25'} 0%, #241a10 45%, #0b0a09 100%)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>

          <div className="relative mx-auto flex min-h-[64vh] max-w-7xl flex-col justify-end px-6 pb-14 pt-24 md:min-h-[74vh] md:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="max-w-3xl space-y-4"
            >
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-md">
                <Flame className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden="true" />
                <span>{venue.city || 'Santa Cruz de la Sierra'}</span>
                {venueTagline && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="normal-case tracking-normal text-white/80">{venueTagline}</span>
                  </>
                )}
              </div>

              <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                {venueName}
              </h1>

              {venueDesc && (
                <p className="max-w-xl text-sm leading-relaxed text-slate-200/90 md:text-base">
                  {venueDesc}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-slate-300">
                {venue.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                    {venue.address}
                  </span>
                )}
                {venue.opening_hours && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                    {venue.opening_hours}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3">
                <a
                  href="#carta"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full bg-amber-500 px-6 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
                >
                  Ver la carta
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  Cómo llegar
                </a>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/20 px-5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Compartir
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <CyclingOffersBanner />

          {/* Featured flip deck — only admin-highlighted items */}
          {deckItems.length > 0 && (
            <section className="relative mt-8 overflow-hidden rounded-3xl border border-amber-900/30 bg-[#131110] px-4 py-8 shadow-2xl sm:px-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    'radial-gradient(80% 60% at 50% 0%, rgba(188,108,37,0.28) 0%, rgba(19,17,16,0) 70%)',
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="mb-2 flex flex-col items-center gap-1 text-center">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Destacados de la casa
                  </span>
                  <h2 className="font-display text-2xl text-amber-50 sm:text-3xl">
                    Los favoritos de {venueName}
                  </h2>
                  <p className="text-[11px] text-amber-100/50">
                    Desliza o usa las flechas para descubrirlos
                  </p>
                </div>

                <FlipDeck
                  items={deckItems}
                  currentLang={currentLang}
                  onAddToCart={handleAddToCart}
                />
              </div>
            </section>
          )}

          {/* Catalog */}
          <section id="carta" className="scroll-mt-40 pt-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-600">
                La carta
              </span>
              <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
                Explora la carta
              </h2>
            </div>

            {/* Category navigation & hotness filter */}
            <div className="sticky top-[8rem] z-30 -mx-6 mt-4 flex items-center justify-between gap-3 overflow-x-auto border-b border-border bg-background/95 px-6 py-3 backdrop-blur-md no-scrollbar">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCategoryKey('all')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    activeCategoryKey === 'all'
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  Todos ({allItems.length})
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryKey(cat.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      activeCategoryKey === cat.id
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {catName(cat)} ({cat.items.length})
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOnlyHot(!onlyHot)}
                aria-pressed={onlyHot}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                  onlyHot
                    ? 'border-rose-500 bg-rose-500 text-white shadow-sm'
                    : 'border-rose-500/25 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 dark:text-rose-400'
                }`}
              >
                <Flame className={`h-3.5 w-3.5 ${onlyHot ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} aria-hidden="true" />
                <span>Más Pedidos</span>
              </button>
            </div>

            {/* Dietary filters + view mode */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'Sin Gluten', label: 'Sin Gluten' },
                  { id: 'Vegetariano', label: 'Vegetariano' },
                  { id: 'Picante', label: 'Picante' },
                  { id: 'Sin Lácteos', label: 'Sin Lácteos' },
                ].map((df) => (
                  <button
                    key={df.id}
                    onClick={() => setActiveDietaryFilter(df.id)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                      activeDietaryFilter === df.id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-slate-400 hover:text-foreground'
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-full border border-border bg-muted/30 p-1">
                <button
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    viewMode === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    viewMode === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                <p className="text-sm font-semibold text-foreground">No encontramos platos con esos filtros</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Probá con otra búsqueda o quitá los filtros para ver la carta completa.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setOnlyHot(false);
                    setActiveDietaryFilter('all');
                    setActiveCategoryKey('all');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : showGroupedSections ? (
              <div className="mt-8 space-y-10">
                {categories.map((cat) => {
                  const items = filteredItems.filter((item) => item.category_id === cat.id);
                  if (items.length === 0) return null;
                  return (
                    <section key={cat.id}>
                      <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
                        <h3 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                          {catName(cat)}
                        </h3>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {items.length} {items.length === 1 ? 'plato' : 'platos'}
                        </span>
                      </div>
                      <div
                        className={
                          viewMode === 'grid'
                            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'flex flex-col gap-3'
                        }
                      >
                        {items.map(renderItemCard)}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div
                className={`mt-8 ${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'flex flex-col gap-3'
                }`}
              >
                {filteredItems.map(renderItemCard)}
              </div>
            )}

            {isFiltering && filteredItems.length > 0 && (
              <p className="mt-8 text-center text-[11px] text-muted-foreground">
                Mostrando {filteredItems.length} de {allItems.length} platos
              </p>
            )}
          </section>
        </div>
      </main>

      {/* Floating Bottom Cart Bar for Mobile (Opens Express Drawer) */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label="Ver pedido y confirmar"
            className="flex w-full items-center justify-between rounded-2xl border border-[hsl(var(--surface-dark-border))] bg-[hsl(var(--surface-dark))] p-3.5 text-white shadow-xl transition-transform hover:bg-[hsl(var(--surface-dark))] active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold tabular-nums text-slate-950">
                {getTotalItems()}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {fulfillmentType === 'dine_in' ? `Mesa ${selectedTable || '1'}` : 'Retiro en Barra'}
                </p>
                <p className="text-xs font-bold text-white">Ver Comanda & Pedir</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-amber-400">
              <span>{venue.currency} {getTotalPrice()}</span>
              <ChevronRight className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </button>
        </div>
      )}

      {hasConcierge && <MenuChatbot />}

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
