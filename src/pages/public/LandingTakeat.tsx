import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
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
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, useScroll, useTransform } from "framer-motion";

export const LandingTakeat: React.FC = () => {
  const { lang, setLang, t } = useLang();
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
  const [leadSegment, setLeadSegment] = useState(t.landing.leadSegmentDefault);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    document.title = t.landing.docTitle;
  }, []);

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

    const msg = `${t.landing.waMsgIntro}\n\n*${t.landing.waName}:* ${leadName || t.landing.waResponsible}\n*${t.landing.waVenue}:* ${leadVenueName || t.landing.waNotInformed}\n*${t.landing.waPhone}:* ${leadPhone || t.landing.waNotInformed}\n*${t.landing.waOp}:* ${leadSegment}\n\n${t.landing.waCta}`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`;

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
            <img src="/mimenu-square.svg" alt="MiMenu" className="h-10 w-10 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tight text-primary leading-none">
                Mi<span className="text-accent">Menu</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {t.landing.eyebrow.split("•")[0].trim()}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 text-xs">
            {(["es","en","pt"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1 font-medium uppercase transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label={t.landing.navAria} className="hidden lg:flex items-center gap-8">
            <a href="#solucoes" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
              {t.landing.navSolucoes}
            </a>
            <a href="#modulos" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
              {t.landing.navModulos}
            </a>
            <a href="#calculadora" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
              {t.landing.navCalc}
            </a>
            <a href="#segmentos" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
              {t.landing.navSegmentos}
            </a>
            <a href="#depoimentos" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
              {t.landing.navQuemUsa}
            </a>
            <a href="#faq" className="text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
              FAQ
            </a>
          </nav>

          {/* Desktop Right CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary rounded-xl hover:bg-muted transition-colors"
            >
              {t.landing.navJaSouCliente}
            </Link>
            <a
              href="#contato"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              {t.landing.navAgendarDemo}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
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
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link
                to="/auth"
                className="w-full text-center py-2.5 text-sm font-semibold text-muted-foreground bg-muted rounded-xl"
              >
                {t.landing.navJaSouCliente}
              </Link>
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-sm font-bold text-accent-foreground bg-accent rounded-xl shadow-md"
              >
                {t.landing.cta}
              </a>
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
          <motion.div style={{ y: heroY }} className="text-center max-w-4xl mx-auto">
            {/* Social proof badge */}
            <ScrollReveal direction="up" delay={100}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border shadow-sm mb-6 text-xs sm:text-sm font-semibold text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                <span>{t.landing.badge}</span>
              </div>
            </ScrollReveal>

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

            {/* Subtitle */}
            <ScrollReveal direction="up" delay={300}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                {t.landing.heroSub}
              </p>
            </ScrollReveal>

            {/* Primary Action Buttons */}
            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <a
                  href="#contato"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  {t.landing.cta}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#solucoes"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-card hover:bg-muted text-foreground font-bold text-base border border-border hover:shadow transition-all"
                >
                  <Play className="w-4 h-4 fill-accent text-accent" />
                  Ver Como Funciona em 2 Minutos
                </a>
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
                    <div className="text-muted-foreground">Nas suas vendas</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 fill-primary" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-primary">Nota 4.9 de 5.0</div>
                    <div className="text-muted-foreground">{t.landing.reviewsCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-primary">Suporte 7 Dias</div>
                    <div className="text-muted-foreground">Com time humano</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-primary">Sem Fidelidade</div>
                    <div className="text-muted-foreground">Cancele quando quiser</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </motion.div>
        </div>

          {/* 4. INTERACTIVE PRODUCT SHOWCASE / MOCKUP TABS */}
          <ScrollReveal direction="up" delay={100}>
            <div className="mt-14 max-w-5xl mx-auto">
              {/* Tab switchers */}
              <div className="flex items-center justify-center gap-2 p-1.5 bg-card border border-border rounded-2xl shadow-sm mb-6 max-w-2xl mx-auto overflow-x-auto">
                <button
                  onClick={() => setActiveTab("cardapio")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "cardapio"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  {t.landing.tabCardapio}
                </button>
                <button
                  onClick={() => setActiveTab("kds")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "kds"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  {t.landing.tabKds}
                </button>
                <button
                  onClick={() => setActiveTab("garcom")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "garcom"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  {t.landing.tabGarcom}
                </button>
                <button
                  onClick={() => setActiveTab("painel")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "painel"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  {t.landing.tabPdv}
                </button>
              </div>

              {/* Showcase Display Screen */}
              <div className="relative rounded-3xl bg-primary text-primary-foreground shadow-xl border border-border overflow-hidden">
                {/* Screen Top Bar */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6 p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="ml-3 text-xs font-mono text-muted-foreground hidden sm:inline">
                      mimenu.live/demo-restaurant
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success/20 text-success flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Tempo Real Ativo
                    </span>
                  </div>
                </div>

                {/* Shared wrapper for tab content with reveal */}
                <div className="p-4 sm:p-8">
                  {/* Tab Content 1 */}
                  {activeTab === "cardapio" && (
                    <ScrollReveal direction="left" stagger>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-5 space-y-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">
                            {t.landing.tab1Eyebrow}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-display font-bold">
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
                              Mesa 08 · Comanda #142
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                              Conta Aberta
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center font-bold text-lg">
                                  🍔
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">Burger Smash Duplo Artesanal</div>
                                  <div className="text-xs text-white/40">Ponto: Ao ponto · + Bacon crocante</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">R$ 44,90</div>
                                <span className="text-[10px] text-emerald-400 font-medium">Na Cozinha (KDS)</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                                  🍹
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">Gin Tropical com Frutas Vermelhas</div>
                                  <div className="text-xs text-white/40">{t.landing.noSugar}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">R$ 32,00</div>
                                <span className="text-[10px] text-blue-400 font-medium">Pronto no Bar</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                            <span>Total da Mesa: <strong className="text-white text-sm">R$ 76,90</strong></span>
                            <button className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-bold text-xs hover:bg-accent/90">
                              Pedir a Conta & Dividir
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
                          <h3 className="text-2xl sm:text-3xl font-display font-bold">
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
                              <span className="font-bold text-amber-400 font-mono">MESA 04</span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">04:12 min</span>
                            </div>
                            <div className="text-sm font-bold text-white">1x Picanha na Chapa 400g</div>
                            <div className="text-xs text-white/40 mt-1">{t.landing.obsSteak}</div>
                            <button className="mt-3 w-full py-1.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-xs font-bold">
                              Marcar como Pronto
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-emerald-400 font-mono">DELIVERY #109</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Pronto</span>
                            </div>
                            <div className="text-sm font-bold text-white">2x Pizza Calabresa Especial</div>
                            <div className="text-xs text-white/40 mt-1">{t.landing.crustBorder}</div>
                            <button className="mt-3 w-full py-1.5 rounded bg-success hover:bg-success/90 text-success-foreground text-xs font-bold">
                              Despachar para Motoboy
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
                          <h3 className="text-2xl sm:text-3xl font-display font-bold">
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
                            <span className="text-xs font-bold text-emerald-400">8 Mesas Ativas</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 rounded-xl bg-white/5 text-center border border-white/5">
                              <div className="text-xs text-white/40">Mesa 01</div>
                              <div className="text-base font-bold text-white">R$ 145,00</div>
                              <span className="text-[10px] text-amber-400">Comendo</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 text-center border border-white/5">
                              <div className="text-xs text-white/40">Mesa 02</div>
                              <div className="text-base font-bold text-white">R$ 89,50</div>
                              <span className="text-[10px] text-blue-400">Pedindo conta</span>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-900/30 text-center border border-emerald-500/20">
                              <div className="text-xs text-emerald-300">Mesa 03</div>
                              <div className="text-base font-bold text-white">Livre</div>
                              <span className="text-[10px] text-emerald-400">Abrir Comanda</span>
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
                          <h3 className="text-2xl sm:text-3xl font-display font-bold">
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
                              <div className="text-xs text-white/40">Faturamento Hoje</div>
                              <div className="text-lg font-bold text-emerald-400">R$ 5.480,00</div>
                              <div className="text-[10px] text-emerald-500">+18% vs ontem</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5">
                              <div className="text-xs text-white/40">Pedidos Totais</div>
                              <div className="text-lg font-bold text-white">94 pedidos</div>
                              <div className="text-[10px] text-white/40">{t.landing.avgTicket}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5">
                              <div className="text-xs text-white/40">{t.landing.commissionPaid}</div>
                              <div className="text-lg font-bold text-accent">R$ 0,00</div>
                              <div className="text-[10px] text-emerald-400">Economia de R$ 1.260</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
      </section>

      {/* 5. NUMBERS & RESULTS STRIP */}
      <ScrollReveal direction="up" delay={100}>
        <section className="bg-primary text-primary-foreground py-16 sm:py-20 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                Resultados Comprovados
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mt-2">
                {t.landing.numbersTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-accent mb-2">
                  +35%
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat3Title}</div>
                <p className="text-xs text-white/40 leading-relaxed">
                  {t.landing.stat3Desc}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-success mb-2">
                  0%
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat4Title}</div>
                <p className="text-xs text-white/40 leading-relaxed">
                  {t.landing.stat4Desc}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-secondary mb-2">
                  &lt; 4 min
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat1Title}</div>
                <p className="text-xs text-white/40 leading-relaxed">
                  {t.landing.stat1Desc}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-warning mb-2">
                  4.9 / 5
                </div>
                <div className="font-bold text-base text-white mb-1">{t.landing.stat2Title}</div>
                <p className="text-xs text-white/40 leading-relaxed">
                  {t.landing.stat2Desc}
                </p>
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
                Simulador de Economia Real
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
                        {monthlyOrders} pedidos
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
                      <span>100 pedidos</span>
                      <span>1.500 pedidos</span>
                      <span>3.000+ pedidos</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-white/70">
                        {t.landing.calcTicket}
                      </label>
                      <span className="text-base font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                        R$ {averageTicket},00
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
                      <span>R$ 20</span>
                      <span>R$ 100</span>
                      <span>R$ 200+</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 space-y-1">
                    <div className="flex justify-between">
                      <span>Faturamento Bruto Mensal:</span>
                      <strong className="text-white">R$ {totalGrossRevenue.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00</strong>
                    </div>
                    <div className="flex justify-between text-accent">
                      <span>Taxa perdida em agregadores (23%):</span>
                      <strong>- R$ {marketplaceLostCommissions.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00  / {t.landing.perMonth}</strong>
                    </div>
                  </div>
                </div>

                {/* Savings Results Card */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 text-center space-y-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-foreground">
                    <Sparkles className="w-3.5 h-3.5" />
                    Lucro Recuperado Estimado
                  </span>

                  <div>
                    <div className="text-xs text-white/70 font-medium">Economia Mensal Direta</div>
                    <div className="text-3xl sm:text-4xl font-display font-black text-white mt-1">
                      R$ {(marketplaceLostCommissions + upsellGain).toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium mt-1">
                      (R$ {marketplaceLostCommissions.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")} em taxas + R$ {upsellGain.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")} em upsell)
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                      Economia Estimada em 1 Ano
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-extrabold text-success mt-1">
                      R$ {annualSavings.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US")},00
                    </div>
                  </div>

                  <a
                    href="#contato"
                    className="block w-full py-3.5 px-6 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm shadow-lg transition-all"
                  >
                    Garantir Essa Economia no Meu Restaurante &rarr;
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
                  Personalizado para {currentSegment.name}
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
                Quem usa todos os dias, recomenda
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
                      <div className="text-sm font-bold text-primary">Rodrigo Carvalho</div>
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
                      <div className="text-xs text-muted-foreground">Gerente Geral da Trattoria Di Napoli</div>
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
                      <div className="text-sm font-bold text-primary">Gustavo Santos</div>
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
                O que donos de restaurante perguntam antes de contratar
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
                Fale agora com nosso especialista no WhatsApp &rarr;
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
                  Comece Hoje Mesmo
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                  {t.landing.finalTitle}{" "}
                  <span className="text-accent">restaurante agora</span>.
                </h2>
                <p className="text-base text-white/70 leading-relaxed max-w-lg">
                  {t.landing.finalSub}
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><strong className="text-white">Sem fidelidade:</strong> use enquanto fizer sentido para o seu restaurante</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><strong className="text-white">Suporte 7 dias por semana:</strong> atendimento humanizado via WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span><strong className="text-white">Implantação assistida:</strong> {t.landing.implantDesc}</span>
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
                        Preencher novamente
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
                          Seu Nome Completo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Carlos Eduardo"
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
                          placeholder="Ex: Brasa Burger & Bar"
                          value={leadVenueName}
                          onChange={(e) => setLeadVenueName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          WhatsApp (com DDD)
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Ex: (11) 98765-4321"
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
                          onChange={(e) => setLeadSegment(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-primary border border-white/10 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        >
                          <option value="Salão & Mesas">{t.landing.opt1}</option>
                          <option value="Delivery Próprio">{t.landing.opt2}</option>
                          <option value="Cozinha KDS">{t.landing.opt3}</option>
                          <option value="PDV Balcão">{t.landing.opt4}</option>
                          <option value="Operação Completa">{t.landing.opt5}</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 px-6 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mt-6"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Falar com Especialista no WhatsApp
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
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-display font-bold text-xl">
                  M
                </div>
                <span className="font-display font-extrabold text-xl text-white tracking-tight">
                  Mi<span className="text-accent">Menu</span>
                </span>
              </Link>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                {t.landing.footerTagline}
              </p>
              <div className="text-xs text-white/50">
                Contato: <a href="mailto:contato@mimenu.clubemmt.digital" className="text-white hover:underline">contato@mimenu.clubemmt.digital</a>
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
                <li className="text-white/50">SSL 256-bit Encrypted</li>
                <li className="text-white/50">Hospedagem Cloudflare</li>
                <li className="text-white/50">LGPD Compliant</li>
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
        <a
          href="#contato"
          className="w-full py-3 px-4 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-md text-center flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          {t.landing.mobileCta}
        </a>
      </div>
    </div>
  );
};

export default LandingTakeat;