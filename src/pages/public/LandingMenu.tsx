import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Play,
  Pause,
  MapPin,
  Phone,
  Clock,
  Info,
  X,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Background
import menuBgBokeh from "@/assets/menu-bg-bokeh.jpg";

// Import menu images
import octopusVinaigrette from "@/assets/menu/octopus-vinaigrette.jpg";
import ceviche from "@/assets/menu/ceviche.jpg";
import friesCarapitangui from "@/assets/menu/fries-carapitangui.jpg";
import tapiocaCubes from "@/assets/menu/tapioca-cubes.jpg";
import fishStrips from "@/assets/menu/fish-strips.jpg";
import squidDoree from "@/assets/menu/squid-doree.jpg";
import crispyShrimp from "@/assets/menu/crispy-shrimp.jpg";
import codCakes from "@/assets/menu/cod-cakes.jpg";
import crabShells from "@/assets/menu/crab-shells.jpg";
import carneSol from "@/assets/menu/carne-sol.jpg";
import filetMignonAppetizer from "@/assets/menu/filet-mignon-appetizer.jpg";
import cassavaFries from "@/assets/menu/cassava-fries.jpg";
import fries from "@/assets/menu/fries.jpg";
import shrimpCarapitangui from "@/assets/menu/shrimp-carapitangui.jpg";
import seafoodMix from "@/assets/menu/seafood-mix.jpg";
import grilledFish from "@/assets/menu/grilled-fish.jpg";
import tropicalSalmon from "@/assets/menu/tropical-salmon.jpg";
import filetGorgonzola from "@/assets/menu/filet-gorgonzola.jpg";
import chickenParmesan from "@/assets/menu/chicken-parmesan.jpg";
import kidsFish from "@/assets/menu/kids-fish.jpg";
import kidsBeef from "@/assets/menu/kids-beef.jpg";
import cocada from "@/assets/menu/cocada.jpg";
import acai from "@/assets/menu/acai.jpg";
import popsicle from "@/assets/menu/popsicle.jpg";
import brigadeiro from "@/assets/menu/brigadeiro.jpg";
import caipitao from "@/assets/menu/caipitao.jpg";
import oxeMate from "@/assets/menu/oxe-mate.jpg";
import chefChoice from "@/assets/menu/chef-choice.jpg";
import neptuneTide from "@/assets/menu/neptune-tide.jpg";
import laEle from "@/assets/menu/la-ele.jpg";
import tadalaSour from "@/assets/menu/tadala-sour.jpg";
import caipirinha from "@/assets/menu/caipirinha.jpg";
import mojito from "@/assets/menu/mojito.jpg";
import blueLagoon from "@/assets/menu/blue-lagoon.jpg";
import ginLove from "@/assets/menu/gin-love.jpg";
import frozenSoft from "@/assets/menu/frozen-soft.jpg";
import heineken from "@/assets/menu/heineken.jpg";
import original from "@/assets/menu/original.jpg";
import water from "@/assets/menu/water.jpg";
import juice from "@/assets/menu/juice.jpg";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  available: boolean;
  image_url: string | null;
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

// Map image URLs to imported images
const imageMap: Record<string, string> = {
  "octopus-vinaigrette.jpg": octopusVinaigrette,
  "ceviche.jpg": ceviche,
  "fries-carapitangui.jpg": friesCarapitangui,
  "tapioca-cubes.jpg": tapiocaCubes,
  "fish-strips.jpg": fishStrips,
  "squid-doree.jpg": squidDoree,
  "crispy-shrimp.jpg": crispyShrimp,
  "cod-cakes.jpg": codCakes,
  "crab-shells.jpg": crabShells,
  "carne-sol.jpg": carneSol,
  "filet-mignon-appetizer.jpg": filetMignonAppetizer,
  "cassava-fries.jpg": cassavaFries,
  "fries.jpg": fries,
  "shrimp-carapitangui.jpg": shrimpCarapitangui,
  "seafood-mix.jpg": seafoodMix,
  "grilled-fish.jpg": grilledFish,
  "tropical-salmon.jpg": tropicalSalmon,
  "filet-gorgonzola.jpg": filetGorgonzola,
  "chicken-parmesan.jpg": chickenParmesan,
  "kids-fish.jpg": kidsFish,
  "kids-beef.jpg": kidsBeef,
  "cocada.jpg": cocada,
  "acai.jpg": acai,
  "popsicle.jpg": popsicle,
  "brigadeiro.jpg": brigadeiro,
  "caipitao.jpg": caipitao,
  "oxe-mate.jpg": oxeMate,
  "chef-choice.jpg": chefChoice,
  "neptune-tide.jpg": neptuneTide,
  "la-ele.jpg": laEle,
  "tadala-sour.jpg": tadalaSour,
  "caipirinha.jpg": caipirinha,
  "mojito.jpg": mojito,
  "blue-lagoon.jpg": blueLagoon,
  "gin-love.jpg": ginLove,
  "frozen-soft.jpg": frozenSoft,
  "heineken.jpg": heineken,
  "original.jpg": original,
  "water.jpg": water,
  "juice.jpg": juice,
};

const ALL_TAB = "Todos";

// Deterministic pseudo-rating in the 4.0–5.0 range, purely decorative (no rating column in DB)
const getRating = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
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
          className={`w-3.5 h-3.5 ${
            filled
              ? "fill-amber-500 text-amber-600"
              : half
              ? "fill-amber-500/50 text-amber-600"
              : "fill-transparent text-amber-800/30"
          }`}
        />
      );
    })}
    <span className="ml-1.5 text-[10px] text-amber-900/60 font-semibold tracking-wide">
      {rating.toFixed(1)}
    </span>
  </div>
);

const CornerFlourish = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none">
    <path d="M3 3 Q3 26 26 26" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 3 Q26 3 26 26" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="3" cy="3" r="2.2" fill="currentColor" />
    <path d="M9 3 Q15 3 15 9" stroke="currentColor" strokeWidth="0.9" />
    <path d="M3 9 Q3 15 9 15" stroke="currentColor" strokeWidth="0.9" />
  </svg>
);

const flipVariants = {
  enter: (dir: number) => ({
    rotateY: dir >= 0 ? 78 : -78,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    rotateY: dir >= 0 ? -78 : 78,
    opacity: 0,
    scale: 0.92,
  }),
};

interface FlipCardProps {
  item: MenuItem;
  direction: number;
  imageUrl: string | null | undefined;
  categoryLabel: string;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}

const CARD_SIZE_STYLE = { width: "min(300px, 100%)", height: "min(460px, 68vh)" } as const;

const FlipCard = ({ item, direction, imageUrl, categoryLabel, onSwipeNext, onSwipePrev }: FlipCardProps) => {
  const x = useMotionValue(0);
  const rotateZ = useTransform(x, [-200, 200], [-10, 10]);

  return (
    <motion.div
      drag="x"
      style={{ x, rotateZ, ...CARD_SIZE_STYLE }}
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
            style={{
              background: "linear-gradient(160deg, #f8efdc 0%, #eeddb9 45%, #e4c99a 100%)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Corner flourishes */}
            <CornerFlourish className="absolute top-2.5 left-2.5 w-8 h-8 text-amber-800/60 z-10" />
            <CornerFlourish className="absolute top-2.5 right-2.5 w-8 h-8 text-amber-800/60 z-10 rotate-90" />
            <CornerFlourish className="absolute bottom-2.5 right-2.5 w-8 h-8 text-amber-800/60 z-10 rotate-180" />
            <CornerFlourish className="absolute bottom-2.5 left-2.5 w-8 h-8 text-amber-800/60 z-10 -rotate-90" />

            {/* Image */}
            <div className="relative h-[52%] w-full overflow-hidden shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover select-none"
                  style={{ filter: "sepia(0.12) saturate(1.3) contrast(1.06) brightness(1.03)" }}
                  draggable={false}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-100 to-amber-200/60">
                  <Sparkles className="w-8 h-8 text-amber-700/40" />
                  <span className="text-[10px] text-amber-800/50 uppercase tracking-widest">Foto próximamente</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8efdc] via-transparent to-black/10" />
              <span className="absolute top-3 left-3 bg-[#3d2b1f]/90 text-amber-100 border border-amber-500/30 text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm">
                {categoryLabel}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col items-center justify-between text-center px-5 pt-3.5 pb-4 min-h-0">
              <div className="min-h-0 overflow-hidden">
                <h2 className="font-reel text-xl uppercase tracking-wide text-[#3d2b1f] font-semibold leading-tight">
                  {item.name}
                </h2>
                <div className="my-1.5">
                  <StarRow rating={getRating(item.id)} />
                </div>
                {item.description && (
                  <p className="font-reel italic text-[13px] text-[#6b5638] leading-snug line-clamp-3">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="mt-2 inline-block bg-[#3d2b1f] text-amber-100 font-reel font-bold text-base px-5 py-1.5 rounded-full shadow-md shrink-0">
                Bs. {item.price.toFixed(2)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const LandingMenu = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deckIndex, setDeckIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    document.title = "Menú Digital | MiMenu";
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);

      const { data: categoriesData, error: catError } = await supabase
        .from("menu_categories")
        .select("*")
        .order("display_order");

      if (catError) throw catError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("available", true)
        .order("category_id")
        .order("sort_order");

      if (itemsError) throw itemsError;

      setCategories(categoriesData || []);
      setMenuItems(itemsData || []);
    } catch (error) {
      console.error("Error loading menu:", error);
      toast.error("Error al cargar el menú");
    } finally {
      setLoading(false);
    }
  };

  const categoryNameById = categories.reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    const filename = imageUrl.split("/").pop();
    return filename ? imageMap[filename] : null;
  };

  const deckItems = menuItems.filter(
    (item) => activeTab === ALL_TAB || categoryNameById[item.category_id] === activeTab
  );

  const q = searchQuery.trim().toLowerCase();
  const searchResults = q
    ? menuItems
        .filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            (item.description ? item.description.toLowerCase().includes(q) : false)
        )
        .slice(0, 30)
    : [];

  // Reset deck position when the category changes, unless a search-jump is in flight
  useEffect(() => {
    if (pendingId) return;
    setDeckIndex(0);
    setDirection(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Resolve a pending search-jump once the deck reflects the target item's category
  useEffect(() => {
    if (!pendingId) return;
    const idx = deckItems.findIndex((i) => i.id === pendingId);
    if (idx >= 0) {
      setDeckIndex(idx);
      setDirection(0);
      setPendingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingId, deckItems.length, activeTab]);

  // Autoplay: flip to the next card on an interval
  useEffect(() => {
    if (!isPlaying || loading || q || deckItems.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setDeckIndex((i) => (i + 1) % deckItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, loading, q, deckItems.length, activeTab]);

  const goNext = () => {
    if (deckItems.length === 0) return;
    setDirection(1);
    setDeckIndex((i) => (i + 1) % deckItems.length);
    setIsPlaying(false);
  };

  const goPrev = () => {
    if (deckItems.length === 0) return;
    setDirection(-1);
    setDeckIndex((i) => (i - 1 + deckItems.length) % deckItems.length);
    setIsPlaying(false);
  };

  const jumpToItem = (item: MenuItem) => {
    const catName = categoryNameById[item.category_id] ?? ALL_TAB;
    setDirection(0);
    setActiveTab(catName);
    setPendingId(item.id);
    setSearchQuery("");
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-stone-800 border-t-amber-500" />
          <p className="text-sm text-stone-400">Cargando menú...</p>
        </div>
      </div>
    );
  }

  const categoryTabs = [ALL_TAB, ...categories.map((c) => c.name)];
  const currentItem = deckItems[deckIndex] ?? null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-stone-100 font-sans sm:p-4 md:p-8">
      {/* 9:16 Mobile Frame — full-screen on mobile, framed on desktop */}
      <div className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[820px] sm:rounded-[40px] overflow-hidden sm:border-4 sm:border-stone-800 shadow-2xl shadow-amber-950/50 flex flex-col">
        {/* Cinematic bokeh background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${menuBgBokeh})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 bg-gradient-to-b from-amber-600/15 via-amber-900/5 to-transparent pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 pt-6 pb-3 px-5 text-center shrink-0">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-amber-200/90 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Sparkles className="w-3 h-3 text-amber-400" /> Menú Completo
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowInfo(true)}
                className="flex items-center justify-center bg-stone-900/60 hover:bg-stone-800/80 text-amber-300 w-8 h-8 rounded-full transition border border-amber-500/30"
                aria-label="Dónde estamos"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 px-3 py-1.5 rounded-full text-xs transition border border-amber-500/30 font-medium min-h-[32px]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Auto-Play
                  </>
                )}
              </button>
            </div>
          </div>

          <button onClick={() => navigate("/")} className="block w-full">
            <p className="text-[10px] tracking-[0.3em] text-amber-400 font-semibold uppercase mb-1">
              Península de Maraú — Bahia
            </p>
            <h1 className="text-2xl font-reel tracking-wide text-stone-100 font-light">
              PONTAL <span className="font-semibold text-amber-200/90">CARAPITANGUI</span>
            </h1>
          </button>
          <div className="w-12 h-px bg-amber-500/40 mx-auto my-2.5" />

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar picadas, platos, drinks..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsPlaying(false);
              }}
              className="w-full bg-stone-900/80 border border-stone-700/60 rounded-full py-2 pl-8 pr-8 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 pt-0.5">
            {categoryTabs.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setIsPlaying(false);
                }}
                className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 shrink-0 min-h-[30px] ${
                  activeTab === cat
                    ? "bg-amber-700 text-amber-50 font-medium shadow-sm shadow-amber-900/50 scale-105"
                    : "text-stone-300 hover:text-stone-100 bg-stone-900/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Main: search results OR the flip deck */}
        {q ? (
          <main className="relative z-[5] flex-1 overflow-y-auto px-4 pb-6 pt-1 space-y-2 scrollbar-hide">
            {searchResults.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-xs font-light">
                No se encontraron ítems para &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              searchResults.map((item) => {
                const imageUrl = getImageUrl(item.image_url);
                return (
                  <button
                    key={item.id}
                    onClick={() => jumpToItem(item)}
                    className="w-full flex items-center gap-3 bg-[#f8efdc]/95 hover:bg-[#f8efdc] rounded-xl p-2.5 border border-amber-800/30 transition-colors text-left shadow-md"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-100 shrink-0 border border-amber-700/30">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-amber-700/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-reel text-sm text-[#3d2b1f] font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-amber-800/70 uppercase tracking-wide">
                        {categoryNameById[item.category_id]}
                      </p>
                    </div>
                    <span className="font-reel text-xs font-bold text-[#3d2b1f] shrink-0">
                      Bs. {item.price.toFixed(2)}
                    </span>
                  </button>
                );
              })
            )}
          </main>
        ) : (
          <main className="relative z-[5] flex-1 flex flex-col items-center justify-center px-6 min-h-0">
            <div className="relative w-full flex items-center justify-center">
              {deckItems.length > 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-0 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-stone-900/70 border border-amber-500/30 text-amber-300 hover:bg-stone-800/90 transition"
                  aria-label="Ítem anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {currentItem ? (
                <FlipCard
                  item={currentItem}
                  direction={direction}
                  imageUrl={getImageUrl(currentItem.image_url)}
                  categoryLabel={categoryNameById[currentItem.category_id] ?? ""}
                  onSwipeNext={goNext}
                  onSwipePrev={goPrev}
                />
              ) : (
                <div
                  className="rounded-[26px] flex flex-col items-center justify-center gap-2 border border-amber-900/20 shadow-2xl shadow-black/60"
                  style={{
                    background: "linear-gradient(160deg, #f8efdc 0%, #eeddb9 45%, #e4c99a 100%)",
                    ...CARD_SIZE_STYLE,
                  }}
                >
                  <Sparkles className="w-8 h-8 text-amber-700/40" />
                  <p className="text-xs text-amber-800/60 font-reel italic">
                    No hay ítems disponibles en esta categoría.
                  </p>
                </div>
              )}

              {deckItems.length > 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-0 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-stone-900/70 border border-amber-500/30 text-amber-300 hover:bg-stone-800/90 transition"
                  aria-label="Próximo ítem"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress */}
            {deckItems.length > 0 && (
              <div className="mt-4 flex flex-col items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  {deckItems.length <= 10 ? (
                    deckItems.map((item, i) => (
                      <span
                        key={item.id}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === deckIndex ? "w-4 bg-amber-400" : "w-1.5 bg-stone-600"
                        }`}
                      />
                    ))
                  ) : (
                    <span className="text-[10px] text-stone-400 tracking-widest uppercase font-medium">
                      {deckIndex + 1} / {deckItems.length}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-stone-500 tracking-widest uppercase">
                  {isPlaying ? "Reproducción automática" : "Desliza o toca las flechas"}
                </span>
              </div>
            )}
          </main>
        )}

        {/* Onde Estamos — Info Modal */}
        {showInfo && (
          <div
            className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-5 animate-fadeIn"
            onClick={() => setShowInfo(false)}
          >
            <div
              className="bg-stone-900 border border-amber-900/60 rounded-2xl p-5 max-w-xs w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-3 right-3 text-stone-400 hover:text-white p-1 rounded-full bg-stone-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-reel text-xs tracking-widest text-amber-400 uppercase mb-4 font-semibold">
                — Dónde Estamos —
              </h4>
              <div className="space-y-3.5 text-left text-xs text-stone-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Playa Carapitangui, Barra Grande — Maraú, BA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Abierto todos los días • 9:00 a 22:00</span>
                </div>
                <a
                  href="https://wa.me/5573999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-amber-300 transition-colors"
                >
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>+55 (73) 99999-9999 — Hablar por WhatsApp</span>
                </a>
              </div>
              <p className="font-reel italic text-sm text-stone-500 mt-6 text-center">
                Gastronomía &amp; Drinks en la Península de Maraú
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingMenu;
