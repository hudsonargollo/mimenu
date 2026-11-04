import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandMark } from "@/components/site/BrandMark";
import {
  Sparkles,
  QrCode,
  ArrowRight,
  Smartphone,
  UtensilsCrossed,
  Zap,
  ChefHat,
  Check,
  ChevronDown,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  Clock,
  DollarSign,
  Store,
  Bike,
  ReceiptText,
  Star,
  Printer,
  Layers,
  Phone,
  CheckCircle2,
  Building2,
  Pizza,
  Coffee,
  Beer,
  HelpCircle,
  SlidersHorizontal,
  ChevronRight,
  Sparkle,
  BadgePercent,
  Timer,
  Send,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Play,
  Flame,
  Bot,
  Box,
  Camera,
  Users,
  Languages,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, useScroll, useTransform, AnimatePresence, animate, useReducedMotion } from "framer-motion";

interface CountUpProps {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * CountUp — animates a numeric stat from 0 to `to` when it mounts.
 * Honors prefers-reduced-motion (renders the final value immediately).
 */
const CountUp: React.FC<CountUpProps> = ({ to, decimals = 0, prefix = "", suffix = "", className }) => {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;
    if (reduced) {
      if (ref.current) ref.current.textContent = format(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [to, decimals, prefix, suffix, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}{(reduced ? to : 0).toFixed(decimals)}{suffix}
    </span>
  );
};

interface TypewriterProps {
  phrases: readonly string[];
  className?: string;
}

/**
 * Typewriter — types and deletes each phrase in sequence.
 * Renders the first phrase statically when prefers-reduced-motion is on.
 */
const Typewriter: React.FC<TypewriterProps> = ({ phrases, className }) => {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    setText(reduced ? phrases[0] ?? "" : "");
    setDeleting(false);
    setIndex(0);
  }, [phrases, reduced]);

  React.useEffect(() => {
    if (reduced || phrases.length === 0) return;

    const current = phrases[index % phrases.length];
    let delay = deleting ? 26 : 42;

    if (!deleting && text === current) delay = 2400;
    else if (deleting && text.length === 0) delay = 320;

    const timer = window.setTimeout(() => {
      if (!deleting) {
        if (text === current) {
          setDeleting(true);
        } else {
          setText(current.slice(0, text.length + 1));
        }
        return;
      }
      if (text.length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
        return;
      }
      setText(current.slice(0, text.length - 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [text, deleting, index, phrases, reduced]);

  return (
    <span className={className}>
      <span aria-hidden="true" className="border-r-2 border-accent pr-1">
        {text}
      </span>
      <span className="sr-only">{phrases.join(", ")}</span>
    </span>
  );
};

export const LandingTakeat: React.FC = () => {
  const { lang, t } = useLang();
  /** Currency symbol per locale (Bolivia market uses Bs). */
  const CUR = lang === "es" ? "Bs" : lang === "pt" ? "R$" : "$";
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.6]);

  const navigate = useNavigate();

  // Navigation & Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cardapio" | "kds" | "garcom" | "painel">("cardapio");

  // ROI Calculator State
  const [monthlyOrders, setMonthlyOrders] = useState<number>(600);
  const [averageTicket, setAverageTicket] = useState<number>(55);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active Segment Filter State
  const [selectedSegment, setSelectedSegment] = useState<string>("hamburgueria");

  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadVenueName, setLeadVenueName] = useState("");
  const [leadSegment, setLeadSegment] = useState<"opt1" | "opt2" | "opt3" | "opt4" | "opt5">("opt1");
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    document.title = t.landing.docTitle;
  }, [t.landing.docTitle]);

  // ROI calculations
  const totalGrossRevenue = useMemo(() => {
    return monthlyOrders * averageTicket;
  }, [monthlyOrders, averageTicket]);

  const marketplaceLostCommissions = useMemo(() => {
    return Math.round(totalGrossRevenue * 0.23);
  }, [totalGrossRevenue]);

  const upsellGain = useMemo(() => {
    return Math.round(totalGrossRevenue * 0.22);
  }, [totalGrossRevenue]);

  const annualSavings = useMemo(() => {
    return (marketplaceLostCommissions + upsellGain) * 12;
  }, [marketplaceLostCommissions, upsellGain]);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const msg = `${t.landing.waMsgIntro}\n\n*${t.landing.waName}:* ${leadName || t.landing.waResponsible}\n*${t.landing.waVenue}:* ${leadVenueName || t.landing.waNotInformed}\n*${t.landing.waPhone}:* ${leadPhone || t.landing.waNotInformed}\n*${t.landing.waOp}:* ${t.landing[leadSegment]}\n\n${t.landing.waCta}`;
    const whatsappUrl = `https://wa.me/59170000000?text=${encodeURIComponent(msg)}`;

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 600);
  };

  const segmentsData = [
    { id: "hamburgueria", name: t.landing.seg1Name, icon: Flame, headline: t.landing.seg1Headline, description: t.landing.seg1Desc, bullets: t.landing.seg1Bullets },
    { id: "pizzaria", name: t.landing.seg2Name, icon: Pizza, headline: t.landing.seg2Headline, description: t.landing.seg2Desc, bullets: t.landing.seg2Bullets },
    { id: "bar", name: t.landing.seg3Name, icon: Beer, headline: t.landing.seg3Headline, description: t.landing.seg3Desc, bullets: t.landing.seg3Bullets },
    { id: "restaurante", name: t.landing.seg4Name, icon: UtensilsCrossed, headline: t.landing.seg4Headline, description: t.landing.seg4Desc, bullets: t.landing.seg4Bullets },
    { id: "cafeteria", name: t.landing.seg5Name, icon: Coffee, headline: t.landing.seg5Headline, description: t.landing.seg5Desc, bullets: t.landing.seg5Bullets },
  ];

  const currentSegment = segmentsData.find(s => s.id === selectedSegment) || segmentsData[0];

  const faqItems = t.landing.faq;

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-accent selection:text-accent-foreground antialiased">
      {/* 1. TOP PROMO BANNER */}
      <aside aria-label={t.landing.promoAria} className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs sm:text-sm font-medium border-b border-border flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground tracking-wide uppercase">
          {t.landing.promoBadge}
        </span>
        <span>{t.landing.promoText}</span>
        <a href="#contato" className="underline hover:text-accent transition-colors font-semibold hidden sm:inline">
          {t.landing.promoCta} &rarr;
        </a>
      </aside>

      {/* 2. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/mimenu.svg" alt="MiMenu" className="h-10 w-10 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tight text-primary leading-none">
                Mi<span className="text-accent">Menu</span>
              </span>
              </div>
              </Link>
              <div className="flex items-center gap-3">
              {/* Desktop Navigation Links */}
              <nav aria-label={t.landing.navAria} className="hidden xl:flex items-center gap-3 2xl:gap-6">
              <a href="#novedades" className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors whitespace-nowrap">{t.landing.navNovedades}</a>
              <a href="#solucoes" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors whitespace-nowrap">{t.landing.navSolucoes}</a>
              <a href="#modulos" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors whitespace-nowrap">{t.landing.navModulos}</a>
              <a href="#calculadora" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors whitespace-nowrap">{t.landing.navCalc}</a>
              <a href="#segmentos" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors whitespace-nowrap">{t.landing.navSegmentos}</a>
              <a href="#faq" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors whitespace-nowrap">FAQ</a>
            </nav>
            <LanguageSwitcher ariaLabel={t.landing.langAria} className="hidden xl:inline-flex" />
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                {t.landing.navEnterNow}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
            aria-label={t.landing.menuAriaOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <a
              href="#novedades"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-accent hover:text-accent/80"
            >
              {t.landing.navNovedades}
            </a>
            <a
              href="#solucoes"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-muted-foreground hover:text-accent"
            >
              {t.landing.navSolucoes}
            </a>
            <a
              href="#modulos"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-muted-foreground hover:text-accent"
            >
              {t.landing.navModulos}
            </a>
            <a
              href="#calculadora"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-muted-foreground hover:text-accent"
            >
              {t.landing.navCalc}
            </a>
            <a
              href="#segmentos"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-muted-foreground hover:text-accent"
            >
              {t.landing.navSegmentos}
            </a>
            <a
              href="#depoimentos"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-muted-foreground hover:text-accent"
            >
              {t.landing.navQuemUsa}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-muted-foreground hover:text-accent"
            >
              FAQ
            </a>
            <div className="pt-2">
              <LanguageSwitcher ariaLabel={t.landing.langAria} expand />
            </div>
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-sm font-bold text-accent-foreground bg-accent rounded-xl shadow-md"
              >
                {t.landing.navEnterNow}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden">
        {/* Parallax background glows */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ y: heroY, opacity: heroOpacity,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(20, 52%, 44%, 0.12) 0%, hsla(20, 52%, 44%, 0) 70%), radial-gradient(ellipse 60% 40% at 85% 60%, hsla(20, 52%, 44%, 0.08) 0%, hsla(20, 52%, 44%, 0) 65%)"
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Headline */}
            <ScrollReveal direction="up" delay={200}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-primary leading-[1.08] mb-6">
                {t.landing.heroTitle}{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {t.landing.heroAccent}
                </span>
                {" "}{t.landing.heroTail}
              </h1>
            </ScrollReveal>

            {/* Rotating capability line */}
            <ScrollReveal direction="up" delay={300}>
              <div className="mb-6">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {t.landing.heroTypePrefix}
                </p>
                <div className="mt-2 flex min-h-[5.5rem] items-start justify-center">
                  <p className="max-w-3xl text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight text-accent">
                    <Typewriter phrases={t.landing.heroTypePhrases} />
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {t.landing.heroChips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
                    >
                      <Check className="h-3 w-3 text-success stroke-[3]" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Primary Action Buttons */}
            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  to="/auth"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  {t.landing.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/onboarding?plan=premium"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-card hover:bg-muted text-foreground font-bold text-base border border-border hover:shadow transition-all"
                >
                  <UserPlus className="w-4 h-4 text-accent" />
                  {t.landing.ctaSecondary2}
                </Link>
              </div>
            </ScrollReveal>

            {/* Trust Badges */}
            <ScrollReveal direction="up" delay={500}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 border-t border-border/80 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-primary">{t.landing.commissionBadge}</div>
                    <div className="text-muted-foreground">{t.landing.trustSales}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 fill-primary" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-primary">{t.landing.trustRating}</div>
                    <div className="text-muted-foreground">{t.landing.reviewsCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-primary">{t.landing.trustSupport}</div>
                    <div className="text-muted-foreground">{t.landing.trustSupportSub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-primary">{t.landing.trustNoLock}</div>
                    <div className="text-muted-foreground">{t.landing.trustNoLockSub}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

          {/* 4. INTERACTIVE PRODUCT SHOWCASE / MOCKUP TABS */}
          <ScrollReveal direction="up" delay={100}>
            <div className="relative z-20 mt-14 max-w-5xl mx-auto">
              {/* Tab switchers — sliding active pill */}
              <div className="flex items-center justify-center gap-1 p-1.5 bg-card/80 backdrop-blur border border-border rounded-2xl shadow-lg mb-8 max-w-2xl mx-auto overflow-x-auto">
                {([
                  { id: "cardapio", icon: Smartphone, label: t.landing.tabCardapio },
                  { id: "kds", icon: ChefHat, label: t.landing.tabKds },
                  { id: "garcom", icon: QrCode, label: t.landing.tabGarcom },
                  { id: "painel", icon: Store, label: t.landing.tabPdv },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="showcase-tab-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/30"
                        aria-hidden
                      />
                    )}
                    <tab.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Showcase Display Screen */}
              <div className="relative rounded-3xl bg-gradient-to-br from-primary via-[#33208f] to-[#4d28ab] text-primary-foreground shadow-2xl shadow-primary/30 border border-white/10 overflow-hidden">
                {/* glow behind the frame */}
                <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[36rem] h-64 rounded-full bg-accent/20 blur-3xl" />
                {/* Screen Top Bar */}
                <div className="relative flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                    <div className="w-3 h-3 rounded-full bg-warning/80" />
                    <div className="w-3 h-3 rounded-full bg-success/80" />
                    <span className="ml-3 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono text-white/50 hidden sm:inline">
                      mimenu.live/demo-restaurant
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success/20 text-success flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      {t.landing.liveBadge}
                    </span>
                  </div>
                </div>

                {/* Shared wrapper for tab content with crossfade */}
                <div className="p-4 sm:p-8">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                  {/* Tab Content 1 */}
                  {activeTab === "cardapio" && (
                    <ScrollReveal direction="left" stagger>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-5 space-y-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">
                            {t.landing.tab1Eyebrow}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                            {t.landing.tab1Title}
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed">
                            {t.landing.tab1Desc}
                          </p>
                          <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.tab1B1}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.tab1B2}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.tab1B3}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="md:col-span-7 bg-secondary/20 p-5 rounded-2xl border border-white/10 shadow-inner">
                          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <QrCode className="w-4 h-4 text-accent" />
                              {t.landing.mockTableLabel}
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                              {t.landing.mockOpenBill}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center font-bold text-lg">
                                  🍔
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">{t.landing.mockBurger}</div>
                                  <div className="text-xs text-white/40">{t.landing.mockBurgerNote}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">{CUR} 44,90</div>
                                <span className="text-[10px] text-emerald-400 font-medium">{t.landing.mockInKitchen}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                                  🍹
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">{t.landing.mockGin}</div>
                                  <div className="text-xs text-white/40">{t.landing.noSugar}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">{CUR} 32,00</div>
                                <span className="text-[10px] text-blue-400 font-medium">{t.landing.mockReadyBar}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                            <span>{t.landing.mockTableTotal} <strong className="text-white text-sm">{CUR} 76,90</strong></span>
                            <button className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-bold text-xs hover:bg-accent/90">
                              {t.landing.mockSplitCta}
                            </button>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Tab Content 2: KDS Cozinha */}
                  {activeTab === "kds" && (
                    <ScrollReveal direction="left" stagger>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-5 space-y-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">
                            {t.landing.kdsEyebrow}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                            {t.landing.kdsTitle}
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed">
                            {t.landing.kdsDesc}
                          </p>
                          <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.kdsB1}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.kdsB2}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.kdsB3}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="md:col-span-7 grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-amber-400 font-mono">{t.landing.mockTable04}</span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">04:12 min</span>
                            </div>
                            <div className="text-sm font-bold text-white">{t.landing.mockPicanha}</div>
                            <div className="text-xs text-white/40 mt-1">{t.landing.obsSteak}</div>
                            <button className="mt-3 w-full py-1.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-xs font-bold">
                              {t.landing.mockMarkReady}
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-emerald-400 font-mono">DELIVERY #109</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">{t.landing.mockReady}</span>
                            </div>
                            <div className="text-sm font-bold text-white">{t.landing.mockPizza}</div>
                            <div className="text-xs text-white/40 mt-1">{t.landing.crustBorder}</div>
                            <button className="mt-3 w-full py-1.5 rounded bg-success hover:bg-success/90 text-success-foreground text-xs font-bold">
                              {t.landing.mockDispatch}
                            </button>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Tab Content 3 */}
                  {activeTab === "garcom" && (
                    <ScrollReveal direction="left" stagger>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-5 space-y-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">
                            {t.landing.garcomEyebrow}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                            {t.landing.garcomTitle}
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed">
                            {t.landing.garcomDesc}
                          </p>
                          <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.garcomB1}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.garcomB2}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.garcomB3}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="md:col-span-7 bg-secondary/20 p-5 rounded-2xl border border-white/10">
                          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                            <span className="text-xs font-semibold text-white/40">{t.landing.waiterName}</span>
                            <span className="text-xs font-bold text-emerald-400">{t.landing.mockTablesActive}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 rounded-xl bg-white/5 text-center border border-white/5">
                              <div className="text-xs text-white/40">{t.landing.mockTable} 01</div>
                              <div className="text-base font-bold text-white">{CUR} 145,00</div>
                              <span className="text-[10px] text-amber-400">{t.landing.mockEating}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 text-center border border-white/5">
                              <div className="text-xs text-white/40">{t.landing.mockTable} 02</div>
                              <div className="text-base font-bold text-white">{CUR} 89,50</div>
                              <span className="text-[10px] text-blue-400">{t.landing.mockAskingBill}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-900/30 text-center border border-emerald-500/20">
                              <div className="text-xs text-emerald-300">{t.landing.mockTable} 03</div>
                              <div className="text-base font-bold text-white">{t.landing.mockFree}</div>
                              <span className="text-[10px] text-emerald-400">{t.landing.mockOpenOrder}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Tab Content 4: PDV & Gestor */}
                  {activeTab === "painel" && (
                    <ScrollReveal direction="left" stagger>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-5 space-y-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">
                            {t.landing.pdvEyebrow}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                            {t.landing.pdvTitle}
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed">
                            {t.landing.pdvDesc}
                          </p>
                          <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.pdvB1}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.pdvB2}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              <span>{t.landing.pdvB3}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="md:col-span-7 bg-secondary/20 p-5 rounded-2xl border border-white/10 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-white/5">
                              <div className="text-xs text-white/40">{t.landing.mockRevenueToday}</div>
                              <div className="text-lg font-bold text-emerald-400">{CUR} 5.480,00</div>
                              <div className="text-[10px] text-emerald-500">{t.landing.mockVsYesterday}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5">
                              <div className="text-xs text-white/40">{t.landing.mockTotalOrders}</div>
                              <div className="text-lg font-bold text-white">{t.landing.mockOrdersCount}</div>
                              <div className="text-[10px] text-white/40">{t.landing.avgTicket} {CUR} 58</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5">
                              <div className="text-xs text-white/40">{t.landing.commissionPaid}</div>
                              <div className="text-lg font-bold text-accent">{CUR} 0,00</div>
                              <div className="text-[10px] text-emerald-400">{t.landing.mockSavings} {CUR} 1.260</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </ScrollReveal>
      </section>

      {/* 5. NUMBERS & RESULTS STRIP — purple gradient + glass stat tiles */}
      <section className="relative overflow-hidden border-y border-white/10 text-primary-foreground bg-gradient-to-br from-[#2b1273] via-[#3c1a8c] to-[#4d28ab]">
        {/* Ambient accent glows */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-accent/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <ScrollReveal direction="up" delay={100}>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-accent-foreground bg-accent/20 border border-accent/30 backdrop-blur-sm">
                <Sparkle className="w-3.5 h-3.5 text-accent" />
                {t.landing.resultsEyebrow}
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mt-4">
                {t.landing.numbersTitle}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stat 1: Ticket promedio */}
            <ScrollReveal direction="up" delay={150}>
              <div className="group h-full p-7 rounded-3xl bg-white/[0.07] border border-white/15 backdrop-blur-sm text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1.5 hover:border-accent/40">
                <div className="w-11 h-11 mx-auto mb-5 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent transition-transform duration-300 group-hover:scale-110">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-accent mb-2 tabular-nums">
                  <CountUp to={35} prefix="+" suffix="%" />
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat3Title}</div>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t.landing.stat3Desc}
                </p>
              </div>
            </ScrollReveal>

            {/* Stat 2: 0% comisiones */}
            <ScrollReveal direction="up" delay={280}>
              <div className="group h-full p-7 rounded-3xl bg-white/[0.07] border border-white/15 backdrop-blur-sm text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1.5 hover:border-success/40">
                <div className="w-11 h-11 mx-auto mb-5 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center text-success transition-transform duration-300 group-hover:scale-110">
                  <BadgePercent className="w-5 h-5" />
                </div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-success mb-2 tabular-nums">
                  <CountUp to={0} suffix="%" />
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat4Title}</div>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t.landing.stat4Desc}
                </p>
              </div>
            </ScrollReveal>

            {/* Stat 3: velocidad */}
            <ScrollReveal direction="up" delay={410}>
              <div className="group h-full p-7 rounded-3xl bg-white/[0.07] border border-white/15 backdrop-blur-sm text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1.5 hover:border-warning/40">
                <div className="w-11 h-11 mx-auto mb-5 rounded-2xl bg-warning/15 border border-warning/30 flex items-center justify-center text-warning transition-transform duration-300 group-hover:scale-110">
                  <Timer className="w-5 h-5" />
                </div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-warning mb-2 tabular-nums">
                  &lt; 4 min
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat1Title}</div>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t.landing.stat1Desc}
                </p>
              </div>
            </ScrollReveal>

            {/* Stat 4: rating */}
            <ScrollReveal direction="up" delay={540}>
              <div className="group h-full p-7 rounded-3xl bg-white/[0.07] border border-white/15 backdrop-blur-sm text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1.5 hover:border-indigo-300/40">
                <div className="w-11 h-11 mx-auto mb-5 rounded-2xl bg-indigo-400/15 border border-indigo-300/30 flex items-center justify-center text-indigo-300 transition-transform duration-300 group-hover:scale-110">
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-indigo-300 mb-2 tabular-nums">
                  <CountUp to={4.9} decimals={1} suffix=" / 5" />
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat2Title}</div>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t.landing.stat2Desc}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5b. NEW CAPABILITIES SPOTLIGHT — AI concierge, AR menu, Google reviews */}
      <ScrollReveal direction="up" delay={100}>
        <section id="novedades" className="relative overflow-hidden bg-background py-20 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 50% 0%, hsla(20, 100%, 56%, 0.10) 0%, hsla(20, 100%, 56%, 0) 70%)",
            }}
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                {t.landing.spotlightEyebrow}
              </span>
              <h2 className="mt-4 mb-4 text-3xl font-display font-bold text-primary sm:text-4xl lg:text-5xl">
                {t.landing.spotlightTitle}
              </h2>
              <p className="text-base text-muted-foreground sm:text-lg">{t.landing.spotlightSub}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* AI CONCIERGE */}
              <Card className="flex flex-col overflow-hidden border-border/80 shadow-lg transition-shadow hover:shadow-xl">
                <div className="relative flex h-60 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2b1273] via-[#3c1a8c] to-[#4d28ab] p-5">
                  <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
                  <div className="relative flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    {t.landing.aiMockStatus}
                  </div>
                  <div className="relative space-y-2">
                    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md border border-white/10 bg-white/10 px-3.5 py-2 text-xs text-white/90 backdrop-blur-sm">
                      {t.landing.aiMockQ}
                    </div>
                    <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-md bg-accent px-3.5 py-2 text-xs font-medium text-accent-foreground shadow-lg shadow-accent/20">
                      {t.landing.aiMockA}
                    </div>
                  </div>
                  <div className="relative flex items-center gap-1.5" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent">{t.landing.aiKicker}</span>
                  <h3 className="mt-1 text-xl font-display font-bold text-primary">{t.landing.aiTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.landing.aiDesc}</p>
                  <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                    {[t.landing.aiB1, t.landing.aiB2, t.landing.aiB3].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-5">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary">
                    <Bot className="h-3 w-3" /> {t.landing.aiPlan}
                  </span>
                  </div>
                </div>
              </Card>

              {/* AR MENU */}
              <Card className="flex flex-col overflow-hidden border-border/80 shadow-lg transition-shadow hover:shadow-xl">
                <div className="relative flex h-60 flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-[#1b1236] via-[#2b1273] to-[#3c1a8c]">
                  <div aria-hidden className="absolute h-44 w-44 rounded-full bg-accent/25 blur-3xl" />
                  <div aria-hidden className="absolute h-64 w-64 rounded-full border border-white/10" />
                  <div aria-hidden className="absolute h-44 w-44 rounded-full border border-white/15" />
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/25 to-white/5 shadow-2xl animate-[float_6s_ease-in-out_infinite]">
                    <Box className="h-12 w-12 text-white/85" />
                  </div>
                  <span className="relative text-[11px] font-bold uppercase tracking-widest text-white/60">{t.landing.arMockLabel}</span>
                  <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-primary shadow-lg">
                    <Box className="h-3.5 w-3.5" /> {t.landing.arMockCta}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent">{t.landing.arKicker}</span>
                  <h3 className="mt-1 text-xl font-display font-bold text-primary">{t.landing.arTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.landing.arDesc}</p>
                  <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                    {[t.landing.arB1, t.landing.arB2, t.landing.arB3].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-5">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary">
                    <Box className="h-3 w-3" /> {t.landing.arPlan}
                  </span>
                  </div>
                </div>
              </Card>

              {/* GOOGLE REVIEW HUNTER */}
              <Card className="flex flex-col overflow-hidden border-border/80 shadow-lg transition-shadow hover:shadow-xl">
                <div className="relative flex h-60 flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-[#1b1236] via-[#2b1273] to-[#3c1a8c] px-6 text-center">
                  <div aria-hidden className="absolute -bottom-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-warning/20 blur-3xl" />
                  <div className="relative flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-6 w-6 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="relative text-sm font-bold text-white">{t.landing.revMockTitle}</p>
                  <p className="relative text-[11px] text-white/50">{t.landing.revMockSub}</p>
                  <span className="relative mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-primary shadow-lg">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {t.landing.revMockCta}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent">{t.landing.revKicker}</span>
                  <h3 className="mt-1 text-xl font-display font-bold text-primary">{t.landing.revTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.landing.revDesc}</p>
                  <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                    {[t.landing.revB1, t.landing.revB2, t.landing.revB3].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-5">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary">
                    <Star className="h-3 w-3" /> {t.landing.revPlan}
                  </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* MORE INCLUDED CAPABILITIES */}
            <div className="mt-12 rounded-3xl border border-border bg-muted/60 p-6 sm:p-8">
              <div className="text-center">
                <h3 className="text-xl font-display font-bold text-primary sm:text-2xl">{t.landing.extraTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.landing.extraSub}</p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Camera, title: t.landing.x1Title, desc: t.landing.x1Desc },
                  { icon: Users, title: t.landing.x2Title, desc: t.landing.x2Desc },
                  { icon: BadgePercent, title: t.landing.x3Title, desc: t.landing.x3Desc },
                  { icon: TrendingUp, title: t.landing.x4Title, desc: t.landing.x4Desc },
                  { icon: Languages, title: t.landing.x5Title, desc: t.landing.x5Desc },
                  { icon: Printer, title: t.landing.x6Title, desc: t.landing.x6Desc },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 6. CORE OPERATIONAL PILLARS */}
      <ScrollReveal direction="up" delay={100}>
        <section id="solucoes" className="py-20 sm:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {t.landing.visaoTitle}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary mt-2 mb-4">
                {t.landing.pillarsTitle}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t.landing.pillarsSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pillar 1 */}
              <ScrollReveal direction="up" delay={200}>
                <Card className="p-8 card-hover">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-6">
                    <Store className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-primary mb-3">
                    {t.landing.p1Title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {t.landing.p1Desc}
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p1B1}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p1B2}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p1B3}</span>
                    </li>
                  </ul>
                </Card>
              </ScrollReveal>

              {/* Pillar 2 */}
              <ScrollReveal direction="up" delay={300}>
                <Card className="p-8 card-hover">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-bold mb-6">
                    <Bike className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-primary mb-3">
                    {t.landing.p2Title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {t.landing.p2Desc}
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p2B1}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p2B2}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p2B3}</span>
                    </li>
                  </ul>
                </Card>
              </ScrollReveal>

              {/* Pillar 3 */}
              <ScrollReveal direction="up" delay={400}>
                <Card className="p-8 card-hover">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center font-bold mb-6">
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-primary mb-3">
                    {t.landing.p3Title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {t.landing.p3Desc}
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p3B1}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p3B2}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p3B3}</span>
                    </li>
                  </ul>
                </Card>
              </ScrollReveal>

              {/* Pillar 4 */}
              <ScrollReveal direction="up" delay={500}>
                <Card className="p-8 card-hover">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold mb-6">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-primary mb-3">
                    {t.landing.p4Title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {t.landing.p4Desc}
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p4B1}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p4B2}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t.landing.p4B3}</span>
                    </li>
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 7. MODULAR POWER SUITE (MONTE O SISTEMA IDEAL) */}
      <ScrollReveal direction="up" delay={100}>
        <section id="modulos" className="py-20 bg-muted border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {t.landing.ecossistemaTitle}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary mt-2 mb-4">
                {t.landing.modulosTitle}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t.landing.featuresLead}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delay={200}>
                <Card className="p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold mb-4">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">{t.landing.f1Title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.landing.f1Desc}
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={300}>
                <Card className="p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold mb-4">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">{t.landing.f2Title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.landing.f2Desc}
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={400}>
                <Card className="p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold mb-4">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">{t.landing.f3Title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.landing.f3Desc}
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={500}>
                <Card className="p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-bold mb-4">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">{t.landing.f4Title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.landing.f4Desc}
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={600}>
                <Card className="p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold mb-4">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">{t.landing.f5Title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.landing.f5Desc}
                  </p>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={700}>
                <Card className="p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">{t.landing.f6Title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.landing.f6Desc}
                  </p>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 8. INTERACTIVE ROI CALCULATOR */}
      <ScrollReveal direction="up" delay={100}>
        <section id="calculadora" className="py-20 sm:py-28 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                Simulador de Ahorro Real
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mt-2 mb-4">
                {t.landing.calcTitle}
              </h2>
              <p className="text-base sm:text-lg text-white/70">
                {t.landing.calcSub}
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-secondary/20 p-6 sm:p-10 rounded-3xl border border-white/10 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Sliders Area */}
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-white/70">
                        {t.landing.calcOrders}
                      </label>
                      <span className="text-base font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                        {monthlyOrders} {t.landing.calcOrdersUnit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="3000"
                      step="50"
                      value={monthlyOrders}
                      onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 mt-1">
                      <span>100 {t.landing.calcOrdersUnit}</span>
                      <span>1.500 {t.landing.calcOrdersUnit}</span>
                      <span>3.000+ {t.landing.calcOrdersUnit}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-white/70">
                        {t.landing.calcTicket}
                      </label>
                      <span className="text-base font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                        {CUR} {averageTicket},00
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="5"
                      value={averageTicket}
                      onChange={(e) => setAverageTicket(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 mt-1">
                      <span>{CUR} 20</span>
                      <span>{CUR} 100</span>
                      <span>{CUR} 200+</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 space-y-1">
                    <div className="flex justify-between">
                      <span>{t.landing.calcGrossLabel}</span>
                      <strong className="text-white">{CUR} {totalGrossRevenue.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00</strong>
                    </div>
                    <div className="flex justify-between text-accent">
                      <span>{t.landing.calcFeeLabel}</span>
                      <strong>- {CUR} {marketplaceLostCommissions.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00  / {t.landing.perMonth}</strong>
                    </div>
                  </div>
                </div>

                {/* Savings Results Card */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 text-center space-y-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-foreground">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t.landing.calcRecovered}
                  </span>

                  <div>
                    <div className="text-xs text-white/70 font-medium">{t.landing.calcMonthlyDirect}</div>
                    <div className="text-3xl sm:text-4xl font-display font-black text-white mt-1">
                      {CUR} {(marketplaceLostCommissions + upsellGain).toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium mt-1">
                      ({CUR} {marketplaceLostCommissions.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")} {t.landing.calcFeesPart} {CUR} {upsellGain.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")} {t.landing.calcUpsellPart})
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                      {t.landing.calcAnnual}
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-extrabold text-success mt-1">
                      {CUR} {annualSavings.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00
                    </div>
                  </div>

                  <a
                    href="#contato"
                    className="block w-full py-3.5 px-6 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm shadow-lg transition-all"
                  >
                    {t.landing.calcGuaranteeCta} &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 9. SEGMENTS MATRIX */}
      <ScrollReveal direction="up" delay={100}>
        <section id="segmentos" className="py-20 sm:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {t.landing.adaptadoTitle}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary mt-2 mb-4">
                {t.landing.segTitle}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t.landing.segSub}
              </p>
            </div>

            {/* Segment Selector Tabs */}
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8">
              {segmentsData.map((seg) => {
                const Icon = seg.icon;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                      selectedSegment === seg.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card text-muted-foreground border border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {seg.name}
                  </button>
                );
              })}
            </div>

            {/* Active Segment Feature Box */}
            <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border shadow-sm max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  {t.landing.segPersonalized} {currentSegment.name}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-primary">
                  {currentSegment.headline}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentSegment.description}
                </p>
                <ul className="space-y-2 pt-2">
                  {currentSegment.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-5 bg-muted/30 p-6 rounded-2xl border border-border text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
                  {React.createElement(currentSegment.icon, { className: "w-7 h-7" })}
                </div>
                <div className="text-sm font-bold text-primary">
                  {t.landing.segDemo} {currentSegment.name}
                </div>
                <a
                  href="#contato"
                  className="inline-block w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs shadow-md transition-all"
                >
                  {t.landing.segCta}
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 10. SOCIAL PROOF / TESTIMONIALS */}
      <ScrollReveal direction="up" delay={100}>
        <section id="depoimentos" className="py-20 bg-muted border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {t.landing.depoimentosTitle}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary mt-2 mb-4">
                Quienes lo usan todos los días, lo recomiendan
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t.landing.testimonialsSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <ScrollReveal direction="up" delay={200}>
                <Card className="p-8 card-hover flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1 text-warning mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                      {t.landing.t1Quote}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center">
                      RC
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary">{t.landing.t1Name}</div>
                      <div className="text-xs text-muted-foreground">{t.landing.t1Role}</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Testimonial 2 */}
              <ScrollReveal direction="up" delay={300}>
                <Card className="p-8 card-hover flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1 text-warning mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                      {t.landing.t2Quote}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                      ML
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary">{t.landing.t2Name}</div>
                      <div className="text-xs text-muted-foreground">{t.landing.t2Role}</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              {/* Testimonial 3 */}
              <ScrollReveal direction="up" delay={400}>
                <Card className="p-8 card-hover flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1 text-warning mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                      {t.landing.t3Quote}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-success/20 text-success font-bold flex items-center justify-center">
                      GS
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary">{t.landing.t3Name}</div>
                      <div className="text-xs text-muted-foreground">{t.landing.t3Role}</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 11. FAQ ACCORDION */}
      <ScrollReveal direction="up" delay={100}>
        <section id="faq" className="py-20 sm:py-28 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {t.landing.duvidasTitle}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary mt-2 mb-4">
                {t.landing.faqHeading}
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <ScrollReveal key={index} direction="up" delay={150 * (index + 1)}>
                    <div
                      className="rounded-2xl border border-border bg-card transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-primary hover:text-accent transition-colors"
                      >
                        <span>{item.q}</span>
                        <span
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-transform ${
                            isOpen
                              ? "rotate-180 bg-accent text-accent-foreground border-accent"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-muted pt-4 animate-in fade-in duration-200">
                          {item.a}
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            <div className="text-center mt-10 text-xs sm:text-sm text-muted-foreground">
              {t.landing.segDoubt}{" "}
              <a href="#contato" className="font-bold text-accent hover:underline">
                Habla ahora con nuestro especialista por WhatsApp &rarr;
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 12. HIGH-CONVERTING LEAD FORM & CONTACT */}
      <ScrollReveal direction="up" delay={100}>
        <section id="contato" className="py-20 sm:py-28 bg-primary text-primary-foreground relative overflow-hidden">
          {/* Decorative background gradients */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, hsla(20, 52%, 44%, 0.15) 0%, hsla(20, 52%, 44%, 0) 60%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, hsla(20, 52%, 44%, 0.10) 0%, hsla(20, 52%, 44%, 0) 60%)" }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Value Column */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  {t.landing.finalEyebrow}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                  {t.landing.finalTitle}{" "}
                  <span className="text-accent">{t.landing.finalTitleTail}</span>.
                </h2>
                <p className="text-base text-white/70 leading-relaxed max-w-lg">
                  {t.landing.finalSub}
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><strong className="text-white">{t.landing.finalB1Label}</strong> {t.landing.finalB1Text}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><strong className="text-white">{t.landing.finalB2Label}</strong> {t.landing.finalB2Text}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><strong className="text-white">{t.landing.finalB3Label}</strong> {t.landing.implantDesc}</span>
                  </li>
                </ul>
              </div>

              {/* Right Lead Capture Box */}
              <div className="lg:col-span-6">
                <Card className="bg-secondary/20 p-8 sm:p-10 border-white/10">
                  {formSubmitted ? (
                    <div className="text-center py-8 space-y-4 animate-in fade-in">
                      <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-white">
                        {t.landing.formSuccessTitle}
                      </h3>
                      <p className="text-sm text-white/70">
                        {t.landing.formSuccessDesc}
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="text-xs text-accent hover:underline pt-2"
                      >
                        {t.landing.formBack}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                      <div className="text-left mb-6">
                        <h3 className="text-xl font-display font-bold text-white">
                          {t.landing.formTitle}
                        </h3>
                        <p className="text-xs text-white/50 mt-1">
                          {t.landing.formSub}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          {t.landing.formName}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t.landing.formNamePlaceholder}
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          {t.landing.formVenue}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t.landing.formVenuePlaceholder}
                          value={leadVenueName}
                          onChange={(e) => setLeadVenueName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          {t.landing.formPhone}
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder={t.landing.formPhonePlaceholder}
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          {t.landing.formFocus}
                        </label>
                        <select
                          value={leadSegment}
                          onChange={(e) => setLeadSegment(e.target.value as "opt1" | "opt2" | "opt3" | "opt4" | "opt5")}
                          className="w-full px-4 py-3 rounded-xl bg-primary border border-white/10 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        >
                          <option value="opt1">{t.landing.opt1}</option>
                          <option value="opt2">{t.landing.opt2}</option>
                          <option value="opt3">{t.landing.opt3}</option>
                          <option value="opt4">{t.landing.opt4}</option>
                          <option value="opt5">{t.landing.opt5}</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 px-6 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mt-6"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {t.landing.formCta}
                      </button>

                      <div className="text-center text-[11px] text-white/40 pt-2">
                        🔒 {t.landing.formPrivacy}
                      </div>
                    </form>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 13. FOOTER */}
      <footer className="bg-primary text-muted-foreground py-16 border-t border-white/10 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <BrandMark size={32} className="shrink-0" />
                <span className="font-display font-extrabold text-xl text-white tracking-tight">
                  Mi<span className="text-accent">Menu</span>
                </span>
              </Link>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                {t.landing.footerTagline}
              </p>
              <div className="text-xs text-white/50">
                {t.landing.footerContact} <a href="mailto:contacto@mimenu.clubemkt.digital" className="text-white hover:underline">contacto@mimenu.clubemkt.digital</a>
              </div>
            </div>

            {/* Solutions column */}
            <div className="lg:col-span-3 space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                {t.landing.solutionsMiMenu}
              </div>
              <ul className="space-y-2 text-xs">
                <li><a href="#solucoes" className="hover:text-white transition-colors">{t.landing.fLink1}</a></li>
                <li><a href="#solucoes" className="hover:text-white transition-colors">{t.landing.fLink2}</a></li>
                <li><a href="#solucoes" className="hover:text-white transition-colors">{t.landing.fLink3}</a></li>
                <li><a href="#solucoes" className="hover:text-white transition-colors">{t.landing.fLink4}</a></li>
                <li><a href="#solucoes" className="hover:text-white transition-colors">{t.landing.fLink5}</a></li>
                <li><a href="#modulos" className="hover:text-white transition-colors">{t.landing.fLink6}</a></li>
              </ul>
            </div>

            {/* Platform column */}
            <div className="lg:col-span-3 space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                {t.landing.platformTitle}
              </div>
              <ul className="space-y-2 text-xs">
                <li><a href="#calculadora" className="hover:text-white transition-colors">{t.landing.pLink1}</a></li>
                <li><a href="#segmentos" className="hover:text-white transition-colors">{t.landing.pLink2}</a></li>
                <li><a href="#depoimentos" className="hover:text-white transition-colors">{t.landing.pLink3}</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">{t.landing.pLink4}</a></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">{t.landing.pLink5}</Link></li>
              </ul>
            </div>

            {/* Compliance column */}
            <div className="lg:col-span-2 space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                {t.landing.securityTitle}
              </div>
              <ul className="space-y-2 text-xs">
                <li className="text-white/50">{t.landing.pixInstant}</li>
                <li className="text-white/50">{t.landing.badgeSsl}</li>
                <li className="text-white/50">{t.landing.badgeHosting}</li>
                <li className="text-white/50">{t.landing.badgeData}</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <div>
              © 2024–{new Date().getFullYear()} MiMenu Tecnologia · ClubeMkt Ecosystem. {t.landing.rights}
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-white/80 cursor-pointer">{t.landing.terms}</span>
              <span className="hover:text-white/80 cursor-pointer">{t.landing.privacy}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 14. FLOATING CONVERSION CTA FOR MOBILE TRAFFIC */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-card/95 backdrop-blur-md border-t border-border z-40 shadow-xl flex items-center gap-3">
        <Link
          to="/auth"
          className="w-full py-3 px-4 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-md text-center flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          {t.landing.mobileCta}
        </Link>
      </div>
    </div>
  );
};

export default LandingTakeat;