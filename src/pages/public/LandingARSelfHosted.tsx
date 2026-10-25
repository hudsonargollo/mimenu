import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Smartphone,
  Tablet,
  Sparkles,
  QrCode,
  Camera,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Check,
  ChevronRight,
  ArrowRight,
  Play,
  Star,
  Globe,
  Users,
  Zap,
  ExternalLink,
  MessageCircle,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const LandingARSelfHosted: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"ar" | "selfhosted" | "comparison">("ar");

  // ROI Calculator
  const [monthlyOrders, setMonthlyOrders] = useState(500);
  const [averageTicket, setAverageTicket] = useState(85);

  const totalRevenue = useMemo(() => monthlyOrders * averageTicket, [monthlyOrders, averageTicket]);
  const aiCommissionsSaved = useMemo(() => Math.round(totalRevenue * 0.23), [totalRevenue]);
  const netRevenueWithMiMenu = totalRevenue; // 0% fees
  const annualSavings = useMemo(() => (aiCommissionsSaved + 15000) * 12, [aiCommissionsSaved]);

  const handleDemoClick = () => {
    window.open("https://wa.me/5511999999999?text=Hola! Me gustaría programar una demostración de MiMenu para AR y sistema autoalojado.", "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Top Promo Banner */}
      <aside className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs sm:text-sm font-medium border-b border-border flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground tracking-wide uppercase">
          AR MENU
        </span>
        <span>Menú 3D • Sistema Autoalojado • 0% de Comisión • Reserva por WhatsApp</span>
        <a href="#contacto" className="underline hover:text-accent transition-colors font-semibold hidden sm:inline">
          Aprende más &rarr;
        </a>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-black">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tight text-primary leading-none">
                Mi<span className="text-accent">Menu</span>
              </span>
              <span className="text-xs text-muted-foreground">AR • Autoalojado • Sin Comisiones • WhatsApp</span>
            </div>
          </Link>

          {/* Language Toggle */}
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 text-xs">
            {(["es", "en", "pt"] as const).map((l) => (
              <button
                key={l}
                type="button"
                className={`rounded-full px-2.5 py-1 font-medium uppercase transition-colors ${
                  l === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <ScrollReveal>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-xs mb-6">
                <Camera className="w-3.5 h-3.5" />
                MENÚ AR - REALIDAD AUMENTADA
              </span>
              </ScrollReveal>

              <ScrollReveal direction="up">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-primary mb-6">
                  Tu Menú en{" "}
                  <span className="text-accent">Realidad Aumentada</span>
                  <br />
                  <span className="text-2xl font-normal text-muted-foreground">y Sistema Autoalojado 100% Tuyo</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Muestra tus platos en 3D, recibe reservas y pedidos por WhatsApp, y mantén el 100% de tus ganancias con un sistema completo 100% tuyo.
                </p>
              </ScrollReveal>

              {/* Feature Highlights - rotated to highlight unique value props first */}
              <div className="space-y-4 mb-8">
                <FeatureItem Icon={DollarSign} title="0% de Comisión" text="Paga una tarifa fija, no por cada venta - mantienes el 100% de las ganancias" />
                <FeatureItem Icon={Camera} title="Menú AR en 3D" text="Muestra tus platos en realidad aumentada - funciona en iOS y Android" />
                <FeatureItem Icon={Headphones} title="Concierge WhatsApp 24/7" text="Asistente de IA multicanal: texto, voz, imágenes y reservas" />
                <FeatureItem Icon={ShieldCheck} title="Sistema 100% Autoalojado" text="Tus datos, tu sistema, tu empresa - sin terceros interfiriendo" />
                <FeatureItem Icon={Box} title="Modelos 3D Reales" text="Genera modelos fotográficos reales con IA especializada" />
              </div>

              <ScrollReveal direction="up" delay={200}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={handleDemoClick} className="bg-accent hover:bg-accent/90">
                    Demo Gratuita
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setActiveTab("comparison")}>
                    <Play className="w-4 h-4" />
                    Ver Comparación
                  </Button>
                </div>
              </ScrollReveal>
            </div>

            {/* Right - Visual Showcase */}
            <div className="relative">
              <ScrollReveal direction="right">
                <ARMenuPreview />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Tabs */}
      <section className="py-12 bg-muted border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 p-1.5 bg-card border border-border rounded-2xl shadow-sm mb-8 max-w-2xl mx-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab("ar")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "ar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                <Camera className="w-4 h-4" />
                Menú AR
              </button>
              <button
                onClick={() => setActiveTab("selfhosted")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "selfhosted"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                <Globe className="w-4 h-4" />
                Autoalojado
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "comparison"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                Comparación
              </button>
            </div>
          </ScrollReveal>

          {/* Tab Content */}
          {activeTab === "ar" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
              <ScrollReveal direction="up">
                <h2 className="text-3xl font-display font-bold text-center text-primary mb-12">
                  Explora Tus Platos en Realidad Aumentada
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-accent" />
                    Cómo Funciona
                  </h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">1</span>
                      <span>Envía foto del plato a través del panel de administración o WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">2</span>
                      <span>IA genera modelo 3D en 2-5 minutos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">3</span>
                      <span>Cliente toca en el menú y ve el plato en su mesa o en el móvil</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center">4</span>
                      <span>Cliente puede "tomar" el plato para pedirlo o reservar</span>
                    </li>
                  </ol>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-secondary/5">
                  <div className="text-center">
                    <ARModelVisualization />
                    <h4 className="font-bold text-lg text-primary mt-4">Listo para Producción</h4>
                    <p className="text-sm text-muted-foreground mt-2">Todas las piezas funcionan sin conexión desde el primer carregamiento</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "selfhosted" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ScrollReveal direction="up">
                <h2 className="text-3xl font-display font-bold text-center text-primary mb-12">
                  Sistema 100% Autoalojado - Tú Controlas Todo
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Column */}
                <Card className="p-6 lg:col-span-1">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    Tu Empresa, Tus Datos
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm">Dominio propio (mimenu.clubemkt.digital)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm">Tus datos están en tu cuenta Cloudflare</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm">Cero dependencia de terceros</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm">Control total de acceso y permisos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm">Respaldo automático vía Cloudflare</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm">Concierge WhatsApp multiuso (texto, voz, imágenes)</span>
                    </li>
                  </ul>
                </Card>

                {/* Benefits Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureCard
                      title="Dominio Personalizado"
                      description="mimenu.clubemkt.digital - tu marca, tu control"
                      Icon={Globe}
                    />
                    <FeatureCard
                      title="Despliegue Automático"
                      description="GitHub → Cloudflare Pages en 2 minutos"
                      Icon={Zap}
                    />
                    <FeatureCard
                      title="Escala Infinita"
                      description="Tráfico ilimitado - Cloudflare maneja picos"
                      Icon={TrendingUp}
                    />
                    <FeatureCard
                      title="CDN Global"
                      description="Carga rápida en toda Latinoamérica"
                      Icon={Globe}
                    />
                    <FeatureCard
                      title="WhatsApp Concierge"
                      description="Asistente IA por WhatsApp: texto, voz, imágenes, reservas 24/7"
                      Icon={MessageCircle}
                    />
                    <FeatureCard
                      title="Reservas Integradas"
                      description="Gestión de reservas con confirmación automática"
                      Icon={Calendar}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "comparison" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ScrollReveal direction="up">
                <h2 className="text-3xl font-display font-bold text-center text-primary mb-12">
                  ¿Por Qué Elegir MiMenu?
                </h2>
              </ScrollReveal>

              <div className="overflow-x-auto">
                <table className="w-full max-w-4xl mx-auto">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-4 font-semibold">Característica</th>
                      <th className="p-4 font-semibold text-center">iFood / UberEats</th>
                      <th className="p-4 font-semibold text-center">Rappi / Zé Delivery</th>
                      <th className="p-4 font-semibold text-center text-accent bg-accent/10">
                        <span className="text-accent">MiMenu AR Autoalojado</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <ComparisonRow feature="Comisión por pedido" value1="25-30%" value2="22-28%" value3="0%" highlight />
                    <ComparisonRow feature="Enlace a tu negocio" value1="ifood.com/restaurante_xxx" value2="rappi.com/obras_xxx" value3="mimenu.clubemkt.digital" highlight />
                    <ComparisonRow feature="AR/3D en menú" value1="No" value2="No" value3="Sí - Realidad Aumentada" highlight />
                    <ComparisonRow feature="Tu dominio" value1="Subdominio agregador" value2="Subdominio agregador" value3="mimenu.clubemkt.digital" highlight />
                    <ComparisonRow feature="Datos del cliente" value1="Ellos" value2="Ellos" value3="Tú" highlight />
                    <ComparisonRow feature="Reserva por WhatsApp" value1="No" value2="No" value3="Sí - 24/7 IA" highlight />
                    <ComparisonRow feature="Sistema de pedidos" value1="Web/App agregador" value2="Web/App agregador" value3="Completamente personalizable" highlight />
                    <ComparisonRow feature="Precio de productos" value1="Editan libremente" value2="Editan libremente" value3="Tu precio, tu regla" highlight />
                    <ComparisonRow feature="Cocina/Productividad" value1="Básico" value2="Básico" value3="KDS + AR + Concierge IA" highlight />
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ROI Calculator */}
          <section className="mt-20 py-16 bg-primary text-primary-foreground">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal direction="up">
                <h2 className="text-3xl font-display font-bold text-center mb-4">
                  Calcula Tu Ahorro Anual
                </h2>
                <p className="text-center text-white/70 mb-12">
                  Sal de las comisiones abusivas y ve cuánto puede ganar tu restaurante con MiMenu AR
                </p>
              </ScrollReveal>

              <div className="bg-secondary/20 p-6 sm:p-10 rounded-3xl border border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Controls */}
                  <div className="space-y-8">
                    <div>
                      <label className="text-sm font-semibold text-white/70 block mb-2">
                        Pedidos por Mes
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="50"
                        value={monthlyOrders}
                        onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                      <div className="flex justify-between text-xs text-white/40 mt-2">
                        <span>100 pedidos</span>
                        <span>1.000 pedidos</span>
                        <span>2.000+ pedidos</span>
                      </div>
                      <div className="text-center mt-2 text-xl font-bold text-white">
                        {monthlyOrders} pedidos/mes
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-white/70 block mb-2">
                        Ticket Promedio
                      </label>
                      <input
                        type="range"
                        min="40"
                        max="200"
                        step="5"
                        value={averageTicket}
                        onChange={(e) => setAverageTicket(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                      <div className="flex justify-between text-xs text-white/40 mt-2">
                        <span>$40</span>
                        <span>$120</span>
                        <span>$200+</span>
                      </div>
                      <div className="text-center mt-2 text-xl font-bold text-white">
                        ${averageTicket} promedio
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Ingresos Mensuales</span>
                        <span className="font-bold text-white">${totalRevenue.toLocaleString("es-ES")}</span>
                      </div>
                      <div className="text-accent font-bold mb-2">Ahorro con MiMenu</div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-black text-accent">-${aiCommissionsSaved.toLocaleString("es-ES")}</div>
                          <div className="text-xs text-white/60">en comisiones</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-accent">+15.000</div>
                          <div className="text-xs text-white/60">en upsell AR</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-accent">${(aiCommissionsSaved + 15000).toLocaleString("es-ES")}</div>
                          <div className="text-xs text-white/60">ganado por mes</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-6">
                    <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-foreground">
                        <Star className="w-3 h-3" />
                        Ahorro Anual Estimado
                      </span>

                      <div className="text-center mt-4">
                        <div className="text-4xl sm:text-5xl font-display font-black text-white">
                          ${annualSavings.toLocaleString("es-ES")}
                        </div>
                      </div>

                      <div className="text-center mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-white/50 uppercase tracking-wider">Ahorro Mensual Directo</div>
                        <div className="text-2xl font-bold text-accent mt-1">
                          ${(aiCommissionsSaved + 15000).toLocaleString("es-ES")}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleDemoClick}
                      className="w-full py-4 px-6 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm shadow-lg"
                    >
                      Asegurar este ahorro en mi restaurante
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section id="contacto" className="py-20 sm:py-28 bg-primary text-primary-foreground relative overflow-hidden">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">
                    ¡Empieza Hoy!
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                    Transforma tu menú en{" "}
                    <span className="text-accent">experiencia AR</span>
                    <span className="block">con sistema 100% tuyo y 0% de comisión</span>
                  </h2>
                  <p className="text-base text-white/70 leading-relaxed max-w-lg">
                    Menú 3D, reservationes y pedidos por WhatsApp con asistente de IA. Implementación en menos de 24h. Soporte 7 días por semana.
                  </p>

                  <ul className="space-y-3 pt-2">
                    <li className="flex items-center gap-3 text-sm text-white/80">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>
                        <strong className="text-white">Instalación rápida:</strong> menos de 24h
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white/80">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>
                        <strong className="text-white">Concierge WhatsApp 24/7:</strong> respuestas automáticas, pedidos y reservas
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white/80">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>
                        <strong className="text-white">Dominio propio:</strong> tu marca en mimenu.clubemkt.digital
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-5">
                  <Card className="bg-secondary/20 p-8 sm:p-10 border-white/10">
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-white">
                        Programa tu Demo
                      </h3>
                      <p className="text-sm text-white/70">
                        En 30 segundos recibirás una demostración personalizada del Menú AR, sistema autoalojado y concierge WhatsApp
                      </p>
                      <Button
                        onClick={handleDemoClick}
                        className="w-full py-4 px-6 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                      >
                        Hablar con Especialista en WhatsApp
                        <WhatsAppIcon className="w-5 h-5" />
                      </Button>
                      <div className="text-center text-[11px] text-white/40 pt-2">
                        🔒 Tus datos están 100% protegidos. Sin spam.
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-primary text-muted-foreground py-16 border-t border-white/10 text-xs sm:text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
                <div className="lg:col-span-4 space-y-4">
                  <Link to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-display font-bold text-xl">
                      M
                    </div>
                    <span className="font-display font-extrabold text-xl text-white">
                      Mi<span className="text-accent">Menu</span>
                    </span>
                  </Link>
                  <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                    Menú digital inteligente con Realidad Aumentada, sistema 100% autoalojado y concierge WhatsApp 24/7.
                  </p>
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">Características</div>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#ar" className="hover:text-white transition-colors">Menú AR 3D</a></li>
                    <li><a href="#selfhosted" className="hover:text-white transition-colors">Autoalojado</a></li>
                    <li><a href="#comparison" className="hover:text-white transition-colors">Comparación</a></li>
                  </ul>
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">Plataforma</div>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#roi" className="hover:text-white transition-colors">Calculadora ROI</a></li>
                    <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
                  </ul>
                </div>

                <div className="lg:col-span-2 space-y-2">
                  <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">Legal</div>
                  <ul className="space-y-2 text-xs">
                    <li className="text-white/50">Términos de Uso</li>
                    <li className="text-white/50">Política de Privacidad</li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
                <div>
                  © 2024–{new Date().getFullYear()} MiMenu Tecnología • Todos los derechos reservados.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

// Helper components
const ScrollReveal = ({ children, direction = "up", delay = 0 }: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: direction === "up" ? 20 : direction === "down" ? -20 : 0, x: direction === "left" ? -20 : direction === "right" ? 20 : 0 }}
    whileInView={{ opacity: 1, y: 0, x: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const FeatureItem = ({ Icon, title, text }: { Icon: any; title: string; text: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="font-bold text-sm text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{text}</div>
    </div>
  </div>
);

const FeatureCard = ({ title, description, Icon }: { title: string; description: string; Icon: any }) => (
  <Card className="p-6 card-hover">
    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold mb-3">
      <Icon className="w-5 h-5" />
    </div>
    <h4 className="font-bold text-sm text-foreground mb-2">{title}</h4>
    <p className="text-xs text-muted-foreground">{description}</p>
  </Card>
);

const ARMenuPreview = () => (
  <div className="relative">
    <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-dashed border-accent/30 flex items-center justify-center overflow-hidden">
      <div className="text-center p-6">
        <div className="w-20 h-20 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto mb-4">
          <Camera className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Vista Previa Menú AR</h3>
        <p className="text-sm text-white/60 mb-4">Modelo 3D interactivo para iOS y Android</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-2xl">🍔</span>
          </div>
          <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-2xl">🍕</span>
          </div>
          <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-2xl">🍷</span>
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10">
          Ver Demo AR
        </Button>
      </div>
    </div>
  </div>
);

const ARModelVisualization = () => (
  <div className="bg-gradient-to-br from-accent/20 to-secondary/10 rounded-2xl p-6 text-center">
    <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-3">
      <Box className="w-8 h-8" />
    </div>
    <h4 className="font-bold text-lg text-primary mb-2">Modelo 3D en Tiempo Real</h4>
    <p className="text-sm text-muted-foreground mb-4">
      Los clientes ven sus platos en AR directamente en el smartphone
    </p>
    <div className="grid grid-cols-3 gap-2">
      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
        <span className="text-lg">🍔</span>
      </div>
      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
        <span className="text-lg">🍕</span>
      </div>
      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
        <span className="text-lg">🍰</span>
      </div>
    </div>
  </div>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.11 2.93l-1.54 1.58c-.37.37-.37.97 0 1.41l.53.53.02-.01c.42-.42.92-.62 1.51-.62.06 0 .12.01.18.02.04.01.08-.02.1-.05l2.41-4.01c.14-.24.08-.51-.13-.66-.17-.09-.37-.12-.56-.07L16.11 2.93zM21.12 7.38c0 2.72-2.23 4.94-5 4.94H7.74c-2.76 0-5-2.22-5-4.94v-.55c0-1.44 1.15-2.62 2.59-2.8.23-.02.46.08.55.29l.08.21c.23.57.38 1.17.4 1.79.03 1.04.33 2.03 1.3 2.65.26.14.56-.06.6-.33.04-.27.11-.54.2-.79.09-.24.36-.42.63-.45.26-.03.53.07.76.21.22.12.44.25.66.38.23.12.44.23.66.3.22.07.45-.02.68-.14.23-.12.46-.24.68-.36.24-.12.48-.23.72-.3 2.15-.95 4.33-.79 5.6-.31.21.08.43.16.65.22.21.06.43.1 .64.14.22.05.45-.02.67-.14 1.24-.8 3.17-1.52 4.35-1.78 4.93-1.9 1.64-.35 3.38.16 4.44 1.1 1.07.93 1.52 2.45 1.18 3.68-.08.26-.18.52-.28.78-.1.26-.13.55-.09.81.04.27.14.53.25.79.11.26.22.51.34.77.13.29.19.61.16.92-.03.31-.18.6-.39.86-.22.26-.47.49-.73.69-.27.2-.56.35-.86.44-.31.09-.63.1-.95.07-3.17-.27-5.86-1.94-7.47-3.74-.45-.5-.79-1.06-.98-1.66-.1-.3-.15-.61-.12-.91.03-.3.13-.59.24-.88.12-.28.24-.55.36-.82 1.61-3.85 4.68-6.03 8.25-6.03 6.06 0 11.13 3.79 13.51 9.23.95 2.26.43 4.77-1.22 6.58-.38.38-.8.71-1.22 1.03-.61.44-1.23.87-1.85 1.27-.32.18-.67.34-1.01.48-.34.14-.68.28-1.03.41-.35.12-.7.23-1.05.31-.34.08-.68.14-1.03.17-.67.08-1.33-.07-1.89-.53-.56-.46-.92-1.14-.95-1.86-.03-.72.24-1.4.85-1.89.58-.44 1.3-.76 2.09-.9 1.4-.27 2.85.03 3.9 1.08.71.71 1.11 1.6 1.17 2.51.06.91-.26 1.83-.8 2.59-.76 1.03-1.31 2.21-1.68 3.36-.32 1.15-.42 2.33-.33 3.51.12 1.27.74 2.46 1.62 3.52.95.98 2.07 1.67 3.27 2.04 1.17.34 2.38.28 3.55.14 1.16-.14 2.31-.52 3.37-1.1 1.06-.58 1.97-1.41 2.62-2.38.65-.96.96-2.07.93-3.23-.07-2.37-.99-4.49-2.61-6.04-1.62-1.54-3.77-2.34-5.98-2.2z" />
  </svg>
);

// Need to add Calendar icon import
const Calendar = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

interface ComparisonRowProps {
  feature: string;
  value1: string;
  value2: string;
  value3: string;
  highlight?: boolean;
}

const ComparisonRow = ({ feature, value1, value2, value3, highlight }: ComparisonRowProps) => (
  <tr className={`border-t border-border/50 ${highlight ? "bg-accent/5" : ""}`}>
    <td className="p-4 font-medium text-foreground">{feature}</td>
    <td className="p-4 text-center text-muted-foreground">{value1}</td>
    <td className="p-4 text-center text-muted-foreground">{value2}</td>
    <td className="p-4 text-center font-bold text-primary">{value3}</td>
  </tr>
);

export default LandingARSelfHosted;
