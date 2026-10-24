import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ShoppingBag,
  Plus,
  Minus,
  Heart,
  ChevronRight,
  Sparkles,
  UtensilsCrossed,
  BellRing,
  ReceiptText,
  Check,
  ChevronLeft,
  Share2,
  Info,
  Flame,
  Leaf,
  WheatOff,
  MilkOff,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/lib/cartContext";
import { useLang } from "@/i18n/LanguageProvider";
import { jaleoMenu as menu, pick, MenuItem } from "@/data/jaleo-menu";
import { getCurrentTableId, setCurrentTableId, formatTableDisplay } from "@/lib/tableContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Image imports for legacy menu (kept for backward compatibility)
import acaiImg from "@/assets/menu/acai.jpg";
import blueLagoonImg from "@/assets/menu/blue-lagoon.jpg";
import brigaderoImg from "@/assets/menu/brigadeiro.jpg";
import caipirinhaImg from "@/assets/menu/caipirinha.jpg";
import caipitaoImg from "@/assets/menu/caipitao.jpg";
import carnesolImg from "@/assets/menu/carne-sol.jpg";
import cassavafriesImg from "@/assets/menu/cassava-fries.jpg";
import cevicheImg from "@/assets/menu/ceviche.jpg";
import chefchoiceImg from "@/assets/menu/chef-choice.jpg";
import chickenparmeImg from "@/assets/menu/chicken-parmesan.jpg";
import cocadaImg from "@/assets/menu/cocada.jpg";
import codcakesImg from "@/assets/menu/cod-cakes.jpg";
import crabshellsImg from "@/assets/menu/crab-shells.jpg";
import crispyshrimpImg from "@/assets/menu/crispy-shrimp.jpg";
import filetgorgonzolaImg from "@/assets/menu/filet-gorgonzola.jpg";
import filetmignonappImg from "@/assets/menu/filet-mignon-appetizer.jpg";
import fishstripsImg from "@/assets/menu/fish-strips.jpg";
import friescarapitanguiImg from "@/assets/menu/fries-carapitangui.jpg";
import friesImg from "@/assets/menu/fries.jpg";
import frozensoftImg from "@/assets/menu/frozen-soft.jpg";
import ginloveImg from "@/assets/menu/gin-love.jpg";
import grilledfishImg from "@/assets/menu/grilled-fish.jpg";
import heinekenImg from "@/assets/menu/heineken.jpg";
import juiceImg from "@/assets/menu/juice.jpg";
import kidsbeefImg from "@/assets/menu/kids-beef.jpg";
import kidsfishImg from "@/assets/menu/kids-fish.jpg";
import laeleImg from "@/assets/menu/la-ele.jpg";
import mojitoImg from "@/assets/menu/mojito.jpg";
import neptunetideImg from "@/assets/menu/neptune-tide.jpg";
import octopusvinaigreImg from "@/assets/menu/octopus-vinaigrette.jpg";
import originalImg from "@/assets/menu/original.jpg";
import oxemateImg from "@/assets/menu/oxe-mate.jpg";
import popsicleImg from "@/assets/menu/popsicle.jpg";
import seafoodmixImg from "@/assets/menu/seafood-mix.jpg";
import shrimpcarapitanguiImg from "@/assets/menu/shrimp-carapitangui.jpg";
import squiddoreeImg from "@/assets/menu/squid-doree.jpg";
import tadalasourImg from "@/assets/menu/tadala-sour.jpg";
import tapiocacubesImg from "@/assets/menu/tapioca-cubes.jpg";
import tropicalsalmonImg from "@/assets/menu/tropical-salmon.jpg";
import waterImg from "@/assets/menu/water.jpg";

const imageMap: Record<string, string> = {
  "acai.jpg": acaiImg,
  "blue-lagoon.jpg": blueLagoonImg,
  "brigadeiro.jpg": brigaderoImg,
  "caipirinha.jpg": caiprinhaImg,
  "caipitao.jpg": caipitaoImg,
  "carne-sol.jpg": carnesolImg,
  "cassava-fries.jpg": cassavafriesImg,
  "ceviche.jpg": cevicheImg,
  "chef-choice.jpg": chefchoiceImg,
  "chicken-parmesan.jpg": chickenparmeImg,
  "cocada.jpg": cocadaImg,
  "cod-cakes.jpg": codcakesImg,
  "crab-shells.jpg": crabshellsImg,
  "crispy-shrimp.jpg": crispyshrimpImg,
  "filet-gorgonzola.jpg": filetgorgonzolaImg,
  "filet-mignon-appetizer.jpg": filetmignonappImg,
  "fish-strips.jpg": fishstripsImg,
  "fries-carapitangui.jpg": friescarapitanguiImg,
  "fries.jpg": friesImg,
  "frozen-soft.jpg": frozensoftImg,
  "gin-love.jpg": ginloveImg,
  "grilled-fish.jpg": grilledfishImg,
  "heineken.jpg": heinekenImg,
  "juice.jpg": juiceImg,
  "kids-beef.jpg": kidsbeefImg,
  "kids-fish.jpg": kidsfishImg,
  "la-ele.jpg": laeleImg,
  "mojito.jpg": mojitoImg,
  "neptune-tide.jpg": neptunetideImg,
  "octopus-vinaigrette.jpg": octopusvinaigreImg,
  "original.jpg": originalImg,
  "oxe-mate.jpg": oxemateImg,
  "popsicle.jpg": popsicleImg,
  "seafood-mix.jpg": seafoodmixImg,
  "shrimp-carapitangui.jpg": shrimpcarapitanguiImg,
  "squid-doree.jpg": squiddoreeImg,
  "tadala-sour.jpg": tadalasourImg,
  "tapioca-cubes.jpg": tapiocacubesImg,
  "tropical-salmon.jpg": tropicalsalmonImg,
  "water.jpg": waterImg,
};

function getImageUrl(imagePath?: string) {
  if (!imagePath) return "/placeholder.svg";
  const filename = imagePath.split("/").pop() || "";
  return imageMap[filename] || imagePath;
}

// Enriched item metadata for tags and features
interface LiveItem extends MenuItem {
  categoryKey: string;
  categoryName: { pt: string; en: string };
  isFeatured?: boolean;
  tags?: Array<"destaque" | "veggie" | "sem-gluten" | "sem-lactose" | "picante">;
  serves?: string;
  unitPriceNum: number;
}

export default function LiveMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, setLang } = useLang();
  const { state: cartState, addItem, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  // URL & Local Table tracking
  const [tableNumber, setTableNumber] = useState<string>(() => {
    const fromUrl = searchParams.get("mesa") || searchParams.get("table");
    if (fromUrl) {
      setCurrentTableId(fromUrl);
      return fromUrl;
    }
    return getCurrentTableId() || "12";
  });

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tempTableInput, setTempTableInput] = useState(tableNumber);

  // Search & Active Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>(menu[0]?.key || "frios");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modal / Detail States
  const [selectedItem, setSelectedItem] = useState<LiveItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Comanda Sheet & Waiter Modal States
  const [isComandaOpen, setIsComandaOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterReason, setWaiterReason] = useState("atendimento");
  const [waiterNotes, setWaiterNotes] = useState("");
  const [includeTip, setIncludeTip] = useState(true);

  // Scrollspy & Nav refs
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "Cardápio Digital — Pontal Carapitangui";
  }, []);

  // Sync table if URL parameter changes
  useEffect(() => {
    const urlTable = searchParams.get("mesa") || searchParams.get("table");
    if (urlTable && urlTable !== tableNumber) {
      setTableNumber(urlTable);
      setCurrentTableId(urlTable);
    }
  }, [searchParams]);

  // Flatten & enrich menu items
  const allEnrichedItems = useMemo<LiveItem[]>(() => {
    return menu.flatMap((cat) =>
      cat.items.map((item) => {
        const rawPrice = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
        const itemNamePt = item.name.pt.toLowerCase();

        const tags: Array<"destaque" | "veggie" | "sem-gluten" | "sem-lactose" | "picante"> = [];
        let isFeatured = false;

        if (
          itemNamePt.includes("carapitangui") ||
          itemNamePt.includes("tapioca") ||
          itemNamePt.includes("misto do mar") ||
          itemNamePt.includes("caipitão") ||
          itemNamePt.includes("tadala") ||
          itemNamePt.includes("ceviche")
        ) {
          tags.push("destaque");
          isFeatured = true;
        }

        if (itemNamePt.includes("tapioca") || itemNamePt.includes("aipim") || itemNamePt.includes("batata") || itemNamePt.includes("suco") || itemNamePt.includes("açaí")) {
          tags.push("veggie");
        }

        if (itemNamePt.includes("ceviche") || itemNamePt.includes("polvo") || itemNamePt.includes("grelhado") || itemNamePt.includes("aipim") || itemNamePt.includes("tapioca")) {
          tags.push("sem-gluten");
        }

        if (itemNamePt.includes("ceviche") || itemNamePt.includes("polvo") || itemNamePt.includes("grelhado") || itemNamePt.includes("aipim") || itemNamePt.includes("isca de peixe")) {
          tags.push("sem-lactose");
        }

        if (itemNamePt.includes("tadala") || itemNamePt.includes("biquinho") || itemNamePt.includes("ceviche")) {
          tags.push("picante");
        }

        return {
          ...item,
          categoryKey: cat.key,
          categoryName: cat.name,
          isFeatured,
          tags,
          unitPriceNum: rawPrice,
        };
      })
    );
  }, []);

  // Filter items by search & dietary chips
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return menu
      .map((cat) => {
        const items = cat.items
          .map((item) => {
            return allEnrichedItems.find(
              (i) => i.categoryKey === cat.key && i.name.pt === item.name.pt
            )!;
          })
          .filter((item) => {
            if (!item) return false;

            // Search filter
            if (q) {
              const nameMatch =
                item.name.pt.toLowerCase().includes(q) ||
                item.name.en.toLowerCase().includes(q);
              const descMatch =
                item.description &&
                (item.description.pt?.toLowerCase().includes(q) ||
                  item.description.en?.toLowerCase().includes(q));
              if (!nameMatch && !descMatch) return false;
            }

            // Tag filter
            if (activeFilter !== "all") {
              if (activeFilter === "destaque" && !item.isFeatured) return false;
              if (activeFilter === "veggie" && !item.tags?.includes("veggie")) return false;
              if (activeFilter === "sem-gluten" && !item.tags?.includes("sem-gluten")) return false;
              if (activeFilter === "sem-lactose" && !item.tags?.includes("sem-lactose")) return false;
              if (activeFilter === "picante" && !item.tags?.includes("picante")) return false;
            }

            return true;
          });

        return {
          ...cat,
          items,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [allEnrichedItems, searchQuery, activeFilter]);

  // Scrollspy observer to update active category tab
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (const cat of menu) {
        const el = categoryRefs.current[cat.key];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveCategory(cat.key);
            // Center the active category tab smoothly
            const tabBtn = document.getElementById(`tab-btn-${cat.key}`);
            if (tabBtn && tabsContainerRef.current) {
              const container = tabsContainerRef.current;
              const scrollLeft =
                tabBtn.offsetLeft - container.offsetWidth / 2 + tabBtn.offsetWidth / 2;
              container.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (key: string) => {
    setActiveCategory(key);
    const el = categoryRefs.current[key];
    if (el) {
      const offsetTop = el.offsetTop - 140;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  const handleOpenDetail = (item: LiveItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setItemNotes("");
  };

  const handleAddDetailToCart = () => {
    if (!selectedItem) return;
    const notesSuffix = itemNotes.trim() ? ` (Obs: ${itemNotes.trim()})` : "";
    const customId = `${selectedItem.categoryKey}-${selectedItem.name.pt}${notesSuffix}`;

    for (let i = 0; i < itemQuantity; i++) {
      addItem({
        id: customId,
        name: `${selectedItem.name[lang]}${notesSuffix}`,
        description: selectedItem.description ? pick(selectedItem.description, lang) : null,
        price: selectedItem.unitPriceNum,
        category_id: selectedItem.categoryKey,
        available: true,
      });
    }

    toast.success(
      lang === "pt"
        ? `${itemQuantity}x ${selectedItem.name.pt} adicionado à comanda!`
        : lang === "es"
          ? `${itemQuantity}x ${selectedItem.name.es} agregado a la comanda!`
          : `${itemQuantity}x ${selectedItem.name.en} added to table order!`,
      {
        icon: <ShoppingBag className="w-4 h-4 text-[#BC6C25]" />,
      }
    );

    setSelectedItem(null);
  };

  const handleQuickAdd = (e: React.MouseEvent, item: LiveItem) => {
    e.stopPropagation();
    addItem({
      id: `${item.categoryKey}-${item.name.pt}`,
      name: item.name[lang],
      description: item.description ? pick(item.description, lang) : null,
      price: item.unitPriceNum,
      category_id: item.categoryKey,
      available: true,
    });
    toast.success(
      lang === "pt"
        ? `+1 ${item.name.pt} adicionado!`
        : lang === "es"
          ? `+1 ${item.name.es} agregado!`
          : `+1 ${item.name.en} added!`,
      { duration: 1500 }
    );
  };

  const toggleFavorite = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const totalItemsCount = getTotalItems();
  const subtotalPrice = getTotalPrice();
  const tipAmount = includeTip ? subtotalPrice * 0.1 : 0;
  const grandTotal = subtotalPrice + tipAmount;

  const handleSaveTable = () => {
    if (tempTableInput.trim()) {
      setTableNumber(tempTableInput.trim());
      setCurrentTableId(tempTableInput.trim());
      setTableModalOpen(false);
      toast.success(
        lang === "pt"
          ? `Mesa atualizada para ${formatTableDisplay(tempTableInput)}`
          : lang === "es"
            ? `Mesa actualizada a ${formatTableDisplay(tempTableInput)}`
            : `Table updated to ${formatTableDisplay(tempTableInput)}`
      );
    }
  };

  const handleCallWaiterSubmit = () => {
    const reasonsMap: Record<string, string> = {
      atendimento: "Chamar Garçom na Mesa",
      conta: "Pedir a Conta / Fechar Mesa",
      gelo: "Solicitar Gelo / Copos / Pratos",
      duvida: "Dúvida sobre o Cardápio",
    };

    const text = `🔔 *CHAMADA DE MESA - PONTAL CARAPITANGUI*\n📍 *${formatTableDisplay(
      tableNumber
    )}*\n📌 *Motivo:* ${reasonsMap[waiterReason] || waiterReason}${
      waiterNotes ? `\n📝 *Observação:* ${waiterNotes}` : ""
    }\n⏰ *Horário:* ${new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const encoded = encodeURIComponent(text);
    // Deep-link WhatsApp to Pontal staff
    window.open(`https://wa.me/5573999999999?text=${encoded}`, "_blank");

    toast.success(
      lang === "pt"
        ? `Garçom acionado para a ${formatTableDisplay(tableNumber)}!`
        : lang === "es"
          ? `¡Mozo notificado para la ${formatTableDisplay(tableNumber)}!`
          : `Waiter notified for ${formatTableDisplay(tableNumber)}!`,
      { icon: <BellRing className="w-4 h-4 text-[#BC6C25]" /> }
    );
    setIsWaiterModalOpen(false);
    setWaiterNotes("");
  };

  const filterChips = [
    { id: "all", label: lang === "pt" ? "Todos os Itens" : lang === "es" ? "Todos los Platos" : "All Items", icon: null },
    { id: "destaque", label: lang === "pt" ? "Destaques" : lang === "es" ? "Destacados" : "Best Sellers", icon: "⭐" },
    { id: "veggie", label: lang === "pt" ? "Vegetariano" : lang === "es" ? "Vegetariano" : "Veggie", icon: "🌱" },
    { id: "sem-gluten", label: lang === "pt" ? "Sem Glúten" : lang === "es" ? "Sin Glúten" : "Gluten Free", icon: "🌾" },
    { id: "sem-lactose", label: lang === "pt" ? "Sem Lactose" : lang === "es" ? "Sin Lactosa" : "Lactose Free", icon: "🥛" },
    { id: "picante", label: lang === "pt" ? "Picante" : lang === "es" ? "Picante" : "Spicy", icon: "🌶️" },
  ];

  return (
    <div className="min-h-screen bg-[#F2EEE4] text-[#1A2B2A] pb-32 selection:bg-[#BC6C25] selection:text-white font-sans">
      {/* ================= STICKY TOP BRAND & ACTION BAR ================= */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5DFD3] shadow-sm transition-all">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Brand / Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="text-left group transition-transform active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-xl tracking-tight text-[#1A2B2A] group-hover:text-[#BC6C25] transition-colors">
                    PONTAL
                  </span>
                  <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-[0.25em] px-2 py-0.5 rounded-md bg-[#BC6C25]/10 text-[#BC6C25]">
                    Carapitangui
                  </span>
                </div>
                <p className="text-[11px] text-[#A8A294] font-medium tracking-wide">
                  {lang === "pt" ? "Cardápio & Comanda Digital" : lang === "es" ? "Carta Digital & Pedido" : "Digital Menu & Table Order"}
                </p>
              </button>
            </div>

            {/* Table Badge & Controls */}
            <div className="flex items-center gap-2">
              {/* Table Button */}
              <button
                onClick={() => {
                  setTempTableInput(tableNumber);
                  setTableModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2EEE4] hover:bg-[#EAE4D6] border border-[#D9D2C2] text-xs font-bold text-[#1A2B2A] transition-colors shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{formatTableDisplay(tableNumber)}</span>
              </button>

              {/* Language Pill Switcher */}
              <div className="flex items-center bg-[#F2EEE4] p-0.5 rounded-full border border-[#D9D2C2]">
                {(["es", "en", "pt"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-full transition-all ${
                      lang === l
                        ? "bg-[#BC6C25] text-white shadow-xs"
                        : "text-[#1A2B2A]/60 hover:text-[#1A2B2A]"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Call Waiter Bell Button */}
              <button
                onClick={() => setIsWaiterModalOpen(true)}
                title={lang === "pt" ? "Chamar Garçom" : lang === "es" ? "Llamar al Mozo" : "Call Waiter"}
                className="p-2 rounded-full bg-[#1A2B2A] hover:bg-[#2A3B3A] text-white transition-colors shadow-sm active:scale-90"
              >
                <BellRing className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="mt-3 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#A8A294]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === "pt"
                    ? "Buscar pratos, frutos do mar, drinks ou ingredientes..."
                    : lang === "es"
                      ? "Buscar platos, mariscos, cocteles o ingredientes..."
                      : "Search seafood, appetizers, drinks or ingredients..."
                }
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#F8F6F0] border border-[#E0D8C8] focus:border-[#BC6C25] focus:bg-white focus:outline-hidden text-sm text-[#1A2B2A] placeholder:text-[#A8A294] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 text-[#A8A294] hover:text-[#1A2B2A]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= HORIZONTAL STICKY CATEGORY TABS (SCROLLSPY) ================= */}
        <div className="w-full border-t border-[#EDE7DB] bg-[#FFFFFF]">
          <div
            ref={tabsContainerRef}
            className="max-w-5xl mx-auto overflow-x-auto no-scrollbar px-4 py-2.5 flex items-center gap-2"
          >
            {menu.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  id={`tab-btn-${cat.key}`}
                  onClick={() => scrollToCategory(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive
                      ? "bg-[#1A2B2A] text-white shadow-md scale-102"
                      : "bg-[#F4F0E6] text-[#1A2B2A]/75 hover:bg-[#EBE5D8] hover:text-[#1A2B2A] border border-[#E0D8C8]"
                  }`}
                >
                  {pick(cat.name, lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary & Highlight Quick Filter Chips */}
        <div className="w-full bg-[#FAF8F3] border-t border-[#F0EBE0]">
          <div className="max-w-5xl mx-auto overflow-x-auto no-scrollbar px-4 py-2 flex items-center gap-1.5">
            {filterChips.map((chip) => {
              const isSelected = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    isSelected
                      ? "bg-[#BC6C25] text-white shadow-xs"
                      : "bg-white text-[#1A2B2A]/80 hover:bg-[#F2EEE4] border border-[#E2DCCB]"
                  }`}
                >
                  {chip.icon && <span>{chip.icon}</span>}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ================= PROMO HERO BANNER SPOTLIGHT ================= */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A2B2A] via-[#243534] to-[#1A2B2A] p-5 text-white shadow-lg">
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-300/30">
                <Sparkles className="w-3 h-3" />
                {lang === "pt" ? "Experiência Gastronômica" : lang === "es" ? "Experiencia Gastronómica" : "Gastronomic Experience"}
              </span>
              <span className="text-xs text-white/70 font-medium">Barra Grande • Bahia</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === "pt"
                ? "Frutos do Mar Frescos & Drinks Autorais"
                : lang === "es"
                  ? "Mariscos Frescos & Cocteles de Autor"
                  : "Fresh Seafood & Signature Drinks"}
            </h1>
            <p className="text-xs text-white/75 mt-1 line-clamp-2">
              {lang === "pt"
                ? "Desfrute do melhor da culinária baiana à beira do Rio Carapitangui. Peça diretamente pela sua mesa."
                : lang === "es"
                  ? "Disfruta lo mejor de la cocina baiana a orillas del Río Carapitangui. Pide directamente desde tu mesa."
                  : "Enjoy authentic Bahian cuisine beside Rio Carapitangui. Order directly from your table."}
            </p>
          </div>
          {/* Subtle background glow effect */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#BC6C25]/30 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* ================= MAIN MENU SECTIONS & DISH CARDS ================= */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E5DFD3] p-8 shadow-sm">
            <UtensilsCrossed className="w-12 h-12 text-[#A8A294] mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-[#1A2B2A]">
              {lang === "pt" ? "Nenhum prato encontrado" : lang === "es" ? "No se encontraron platos" : "No dishes found"}
            </h3>
            <p className="text-xs text-[#A8A294] max-w-sm mx-auto mt-1">
              {lang === "pt"
                ? "Tente buscar por outro termo ou limpe os filtros selecionados."
                : lang === "es"
                  ? "Intenta buscar otro término o limpia los filtros seleccionados."
                  : "Try searching for a different item or clear active filters."}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="mt-4 bg-[#BC6C25] hover:bg-[#9E571C] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              {lang === "pt" ? "Limpar Filtros" : lang === "es" ? "Limpiar Filtros" : "Clear Filters"}
            </Button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section
              key={category.key}
              ref={(el) => (categoryRefs.current[category.key] = el)}
              className="scroll-mt-40 space-y-4"
            >
              {/* Category Header (LiveMenu Style) */}
              <div className="flex items-baseline justify-between border-b-2 border-[#1A2B2A]/10 pb-2">
                <div>
                  <h2 className="font-display text-xl font-bold uppercase tracking-tight text-[#1A2B2A] flex items-center gap-2">
                    <span>{pick(category.name, lang)}</span>
                    <Badge variant="secondary" className="bg-[#EAE4D6] text-[#1A2B2A] font-bold text-xs">
                      {category.items.length}
                    </Badge>
                  </h2>
                </div>
              </div>

              {/* Items Grid (LiveMenu Responsive Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {category.items.map((item) => {
                  const cartItem = cartState.items.find(
                    (ci) => ci.name.startsWith(item.name[lang])
                  );
                  const isFav = !!favorites[item.name.pt];

                  return (
                    <div
                      key={item.name.pt}
                      onClick={() => handleOpenDetail(item)}
                      className="group relative flex flex-row items-stretch justify-between bg-white rounded-2xl p-3.5 border border-[#E8E2D5] shadow-xs hover:shadow-md hover:border-[#BC6C25]/40 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99]"
                    >
                      {/* Left: Info, Badges, Price */}
                      <div className="flex-1 pr-3 flex flex-col justify-between">
                        <div>
                          {/* Dietary Badges */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mb-1.5">
                              {item.tags.map((t) => {
                                if (t === "destaque") {
                                  return (
                                    <span
                                      key={t}
                                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider"
                                    >
                                      ⭐ {lang === "pt" ? "Destaque" : lang === "es" ? "Destacado" : "Special"}
                                    </span>
                                  );
                                }
                                if (t === "veggie") {
                                  return (
                                    <span
                                      key={t}
                                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold"
                                    >
                                      🌱 Veggie
                                    </span>
                                  );
                                }
                                if (t === "sem-gluten") {
                                  return (
                                    <span
                                      key={t}
                                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[10px] font-bold"
                                    >
                                      🌾 Sem Glúten
                                    </span>
                                  );
                                }
                                if (t === "picante") {
                                  return (
                                    <span
                                      key={t}
                                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px] font-bold"
                                    >
                                      🌶️ Picante
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}

                          {/* Dish Title */}
                          <h3 className="font-display font-bold text-base text-[#1A2B2A] leading-snug group-hover:text-[#BC6C25] transition-colors">
                            {item.name[lang]}
                          </h3>

                          {/* Description */}
                          {item.description && (
                            <p className="text-xs text-[#7A7568] mt-1 line-clamp-2 leading-relaxed">
                              {pick(item.description, lang)}
                            </p>
                          )}
                        </div>

                        {/* Price & Quantity in Cart */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display font-black text-base text-[#BC6C25]">
                              {item.price}
                            </span>
                          </div>

                          {cartItem && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="w-3 h-3" />
                              {cartItem.quantity} na comanda
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Dish Image + Quick Action Button */}
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#1A2B2A]/5 shrink-0">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name[lang]}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Favorite button overlay */}
                        <button
                          onClick={(e) => toggleFavorite(e, item.name.pt)}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white transition-colors"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isFav ? "fill-rose-500 text-rose-500" : "text-white"
                            }`}
                          />
                        </button>

                        {/* Quick Add Button (+) */}
                        <button
                          onClick={(e) => handleQuickAdd(e, item)}
                          title={lang === "pt" ? "Adicionar rápido" : lang === "es" ? "Agregar rápido" : "Quick Add"}
                          className="absolute bottom-1.5 right-1.5 p-2 rounded-xl bg-[#BC6C25] hover:bg-[#9E571C] text-white shadow-md active:scale-90 transition-transform"
                        >
                          <Plus className="w-4 h-4 font-bold" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ================= ITEM DETAIL DIALOG / MODAL (LIVEMENU STYLE) ================= */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl bg-white border border-[#E5DFD3] shadow-2xl">
          {selectedItem && (
            <div>
              {/* Modal Image Hero */}
              <div className="relative aspect-4/3 w-full bg-[#1A2B2A] overflow-hidden">
                <img
                  src={getImageUrl(selectedItem.image)}
                  alt={selectedItem.name[lang]}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 left-3 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#BC6C25] text-white font-display font-black text-sm shadow-md">
                  {selectedItem.price}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedItem.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="bg-[#F2EEE4] text-[#1A2B2A] text-[10px] font-bold uppercase"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <h2 className="font-display font-bold text-xl text-[#1A2B2A]">
                    {selectedItem.name[lang]}
                  </h2>
                  {selectedItem.description && (
                    <p className="text-sm text-[#7A7568] mt-1.5 leading-relaxed">
                      {pick(selectedItem.description, lang)}
                    </p>
                  )}
                </div>

                {/* Custom Notes / Observations input */}
                <div className="space-y-1.5 pt-2 border-t border-[#EDE7DB]">
                  <label className="text-xs font-bold text-[#1A2B2A] uppercase tracking-wider flex items-center justify-between">
                    <span>{lang === "pt" ? "Observações do Pedido" : lang === "es" ? "Observaciones del Pedido" : "Special Instructions"}</span>
                    <span className="text-[10px] font-normal text-[#A8A294]">
                      {lang === "pt" ? "Opcional" : lang === "es" ? "Opcional" : "Optional"}
                    </span>
                  </label>
                  <Textarea
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    placeholder={
                      lang === "pt"
                        ? "Ex: Sem cebola, ponto da carne mal passado, molho à parte..."
                        : lang === "es"
                          ? "Ej: Sin cebolla, término de la carne, salsa aparte..."
                          : "E.g.: No onions, sauce on the side, well done..."
                    }
                    className="text-xs rounded-xl bg-[#F8F6F0] border-[#E0D8C8] focus:border-[#BC6C25] resize-none"
                    rows={2}
                  />
                </div>

                {/* Stepper Quantity + Add Button */}
                <div className="pt-3 border-t border-[#EDE7DB] flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#D9D2C2] rounded-2xl bg-[#F8F6F0] p-1">
                    <button
                      onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 rounded-xl hover:bg-[#EAE4D6] text-[#1A2B2A] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-display font-bold text-sm text-[#1A2B2A]">
                      {itemQuantity}
                    </span>
                    <button
                      onClick={() => setItemQuantity((q) => q + 1)}
                      className="p-2 rounded-xl hover:bg-[#EAE4D6] text-[#1A2B2A] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Comanda CTA */}
                  <Button
                    onClick={handleAddDetailToCart}
                    className="flex-1 py-6 bg-[#BC6C25] hover:bg-[#9E571C] text-white font-display font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all"
                  >
                    <span>
                      {lang === "pt" ? "Adicionar à Comanda" : lang === "es" ? "Agregar al Pedido" : "Add to Order"} • Bs{" "}
                      {(selectedItem.unitPriceNum * itemQuantity).toFixed(2).replace(".", ",")}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= PERSISTENT FLOATING COMANDA BAR (LIVEMENU STYLE) ================= */}
      <AnimatePresence>
        {totalItemsCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none"
          >
            <div className="max-w-xl mx-auto pointer-events-auto bg-[#1A2B2A] text-white rounded-3xl p-3 shadow-2xl border border-white/10 flex items-center justify-between gap-3">
              {/* Cart Summary Icon & Table */}
              <button
                onClick={() => setIsComandaOpen(true)}
                className="flex items-center gap-3 pl-2 text-left group"
              >
                <div className="relative p-2.5 bg-[#BC6C25] rounded-2xl text-white shadow-md group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full border border-[#1A2B2A] shadow-xs">
                    {totalItemsCount}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-white/70">
                    {formatTableDisplay(tableNumber)} • {totalItemsCount} {totalItemsCount === 1 ? "item" : "itens"}
                  </div>
                  <div className="font-display font-black text-lg text-white">
                    Bs {subtotalPrice.toFixed(2).replace(".", ",")}
                  </div>
                </div>
              </button>

              {/* View Comanda & Checkout Button */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsComandaOpen(true)}
                  className="bg-[#BC6C25] hover:bg-[#9E571C] text-white rounded-2xl px-5 py-5 font-display font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                >
                  <span>{lang === "pt" ? "Ver Comanda" : lang === "es" ? "Ver Comanda" : "View Order"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= COMANDA SLIDE-UP DRAWER / SHEET ================= */}
      <Dialog open={isComandaOpen} onOpenChange={setIsComandaOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl bg-white border border-[#E5DFD3] shadow-2xl">
          <div className="p-5 border-b border-[#EDE7DB] flex items-center justify-between bg-[#FAF8F3]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-[#1A2B2A]">
                  {lang === "pt" ? "Comanda da Mesa" : lang === "es" ? "Comanda de la Mesa" : "Table Order"}
                </h3>
                <Badge variant="outline" className="bg-white border-[#D9D2C2] text-[#1A2B2A] font-bold text-xs">
                  {formatTableDisplay(tableNumber)}
                </Badge>
              </div>
              <p className="text-xs text-[#7A7568] mt-0.5">
                {lang === "pt"
                  ? "Revise seus pratos antes de confirmar o pedido."
                  : lang === "es"
                    ? "Revisa tus platos antes de confirmar tu pedido."
                    : "Review your dishes before confirming order."}
              </p>
            </div>
            <button
              onClick={() => setIsComandaOpen(false)}
              className="p-2 rounded-full hover:bg-[#EAE4D6] text-[#1A2B2A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-5 space-y-3.5 max-h-[50vh] overflow-y-auto divide-y divide-[#F0EBE0]">
            {cartState.items.map((item) => (
              <div key={item.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-display font-bold text-sm text-[#1A2B2A]">{item.name}</h4>
                  <p className="text-xs font-semibold text-[#BC6C25] mt-0.5">
                    Bs {item.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center border border-[#D9D2C2] rounded-xl bg-[#F8F6F0] p-0.5">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-[#EAE4D6] text-[#1A2B2A]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-display font-bold text-xs text-[#1A2B2A]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 rounded-lg hover:bg-[#EAE4D6] text-[#1A2B2A]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculations & Tip Toggle */}
          <div className="p-5 border-t border-[#EDE7DB] bg-[#FAF8F3] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#7A7568]">
              <span>{lang === "pt" ? "Subtotal dos Pratos" : lang === "es" ? "Subtotal de Platos" : "Dishes Subtotal"}</span>
              <span className="font-bold text-[#1A2B2A]">
                Bs {subtotalPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#7A7568]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTip}
                  onChange={(e) => setIncludeTip(e.target.checked)}
                  className="rounded text-[#BC6C25] focus:ring-[#BC6C25]"
                />
                <span>{lang === "pt" ? "Taxa de Serviço Opcional (10%)" : lang === "es" ? "Servicio Opcional (10%)" : "Optional 10% Service Tip"}</span>
              </label>
              <span className="font-bold text-[#1A2B2A]">
                Bs {tipAmount.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="flex items-center justify-between text-base font-display font-black text-[#1A2B2A] pt-2 border-t border-[#E5DFD3]">
              <span>{lang === "pt" ? "Total da Comanda" : lang === "es" ? "Total de la Comanda" : "Grand Total"}</span>
              <span className="text-[#BC6C25] text-lg">
                Bs {grandTotal.toFixed(2).replace(".", ",")}
              </span>
            </div>

            {/* Actions: Proceed to Checkout or WhatsApp Order */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  setIsComandaOpen(false);
                  navigate("/checkout");
                }}
                className="flex-1 py-5 bg-[#BC6C25] hover:bg-[#9E571C] text-white font-display font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md"
              >
                {lang === "pt" ? "Concluir Pedido no Caixa / QR" : lang === "es" ? "Finalizar Pedido en Caja / QR" : "Proceed to Payment / QR"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= TABLE NUMBER EDIT MODAL ================= */}
      <Dialog open={tableModalOpen} onOpenChange={setTableModalOpen}>
        <DialogContent className="max-w-xs rounded-3xl bg-white border border-[#E5DFD3] p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-base text-[#1A2B2A]">
              {lang === "pt" ? "Identificar sua Mesa" : lang === "es" ? "Identifica tu Mesa" : "Identify your Table"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7A7568]">
              {lang === "pt"
                ? "Digite o número ou identificador da sua mesa no quiosque / praia."
                : lang === "es"
                  ? "Ingresa el número o identificador de tu mesa en el kiosco / playa."
                  : "Enter your beach kiosk table number."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <Input
              type="text"
              value={tempTableInput}
              onChange={(e) => setTempTableInput(e.target.value)}
              placeholder="Ex: 12, Praia 4, Bangalô 2"
              className="text-center font-display font-bold text-lg rounded-2xl bg-[#F8F6F0] border-[#D9D2C2]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setTableModalOpen(false)}
              className="flex-1 rounded-xl text-xs"
            >
              {lang === "pt" ? "Cancelar" : lang === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              onClick={handleSaveTable}
              className="flex-1 bg-[#BC6C25] hover:bg-[#9E571C] text-white rounded-xl text-xs font-bold"
            >
              {lang === "pt" ? "Confirmar" : lang === "es" ? "Confirmar" : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= CALL WAITER / BILL MODAL ================= */}
      <Dialog open={isWaiterModalOpen} onOpenChange={setIsWaiterModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl bg-white border border-[#E5DFD3] p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-base text-[#1A2B2A] flex items-center gap-2">
              <BellRing className="w-5 h-5 text-[#BC6C25]" />
              <span>{lang === "pt" ? "Chamar Atendimento" : lang === "es" ? "Llamar Atención" : "Call Waiter"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7A7568]">
              {lang === "pt"
                ? `Notificar garçom para a ${formatTableDisplay(tableNumber)}.`
                : lang === "es"
                  ? `Notificar al mozo para la ${formatTableDisplay(tableNumber)}.`
                  : `Notify waiter for ${formatTableDisplay(tableNumber)}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWaiterReason("atendimento")}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                  waiterReason === "atendimento"
                    ? "bg-[#1A2B2A] text-white border-[#1A2B2A]"
                    : "bg-[#F8F6F0] text-[#1A2B2A] border-[#E0D8C8] hover:bg-[#EAE4D6]"
                }`}
              >
                🛎️ {lang === "pt" ? "Garçom na Mesa" : lang === "es" ? "Mozo en la Mesa" : "Call Waiter"}
              </button>

              <button
                type="button"
                onClick={() => setWaiterReason("conta")}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                  waiterReason === "conta"
                    ? "bg-[#1A2B2A] text-white border-[#1A2B2A]"
                    : "bg-[#F8F6F0] text-[#1A2B2A] border-[#E0D8C8] hover:bg-[#EAE4D6]"
                }`}
              >
                💳 {lang === "pt" ? "Pedir a Conta" : lang === "es" ? "Pedir la Cuenta" : "Ask for Bill"}
              </button>

              <button
                type="button"
                onClick={() => setWaiterReason("gelo")}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                  waiterReason === "gelo"
                    ? "bg-[#1A2B2A] text-white border-[#1A2B2A]"
                    : "bg-[#F8F6F0] text-[#1A2B2A] border-[#E0D8C8] hover:bg-[#EAE4D6]"
                }`}
              >
                🧊 {lang === "pt" ? "Gelo e Copos" : lang === "es" ? "Hielo y Vasos" : "Ice & Glasses"}
              </button>

              <button
                type="button"
                onClick={() => setWaiterReason("duvida")}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                  waiterReason === "duvida"
                    ? "bg-[#1A2B2A] text-white border-[#1A2B2A]"
                    : "bg-[#F8F6F0] text-[#1A2B2A] border-[#E0D8C8] hover:bg-[#EAE4D6]"
                }`}
              >
                ❓ {lang === "pt" ? "Dúvida do Menu" : lang === "es" ? "Duda del Menú" : "Menu Question"}
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#1A2B2A] uppercase">
                {lang === "pt" ? "Mensagem Adicional (Opcional)" : lang === "es" ? "Mensaje Adicional (Opcional)" : "Additional Note (Optional)"}
              </label>
              <Textarea
                value={waiterNotes}
                onChange={(e) => setWaiterNotes(e.target.value)}
                placeholder={
                  lang === "pt"
                    ? "Ex: Trazer maquininha de cartão, talheres extras..."
                    : lang === "es"
                      ? "Ej: Traer datáfono, cubiertos extras..."
                      : "E.g.: Bring card reader, extra silverware..."
                }
                rows={2}
                className="text-xs rounded-xl bg-[#F8F6F0] border-[#E0D8C8] mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsWaiterModalOpen(false)}
              className="flex-1 rounded-xl text-xs"
            >
              {lang === "pt" ? "Voltar" : lang === "es" ? "Volver" : "Back"}
            </Button>
            <Button
              onClick={handleCallWaiterSubmit}
              className="flex-1 bg-[#BC6C25] hover:bg-[#9E571C] text-white rounded-xl text-xs font-bold"
            >
              {lang === "pt" ? "Chamar Agora" : lang === "es" ? "Llamar Ahora" : "Call Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
