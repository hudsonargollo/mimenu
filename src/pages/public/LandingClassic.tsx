import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Flame, 
  Sparkles, 
  QrCode, 
  Star, 
  ArrowRight, 
  Smartphone, 
  UtensilsCrossed, 
  Zap, 
  Globe, 
  Users, 
  ChefHat, 
  Check, 
  X, 
  ChevronDown,
  Bot,
  Play,
  TrendingUp,
  ShieldCheck,
  Send,
  MessageCircle,
  Award,
  Sparkle
} from "lucide-react";
import { useMimenu } from "@/lib/mimenuContext";
import { Button } from "@/components/ui/button";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { venue } = useMimenu();

  // State for interactive features
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [monthlyOrders, setMonthlyOrders] = useState<number>(650);
  const [averageTicket, setAverageTicket] = useState<number>(45); // in Bs. or USD
  const [activeCopilotTab, setActiveCopilotTab] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Interactive mini-cart demo in Hero
  const [heroUpsellAdded, setHeroUpsellAdded] = useState<boolean>(false);
  const [heroReviewGiven, setHeroReviewGiven] = useState<boolean>(false);

  useEffect(() => {
    document.title = "MiMenu | Sistema Operativo y Menú Digital Inteligente para Gastronomía";
  }, []);

  // ROI Calculator calculations
  const thirdPartyCommissionsLost = useMemo(() => {
    return Math.round(monthlyOrders * averageTicket * 0.22); // 22% avg delivery commission
  }, [monthlyOrders, averageTicket]);

  const upsellRevenueGain = useMemo(() => {
    return Math.round(monthlyOrders * averageTicket * 0.24); // 24% boost from AI pairings
  }, [monthlyOrders, averageTicket]);

  const estimatedGoogleReviews = useMemo(() => {
    return Math.round(monthlyOrders * 0.18); // 18% review capture rate
  }, [monthlyOrders]);

  const netAnnualBenefit = useMemo(() => {
    return (thirdPartyCommissionsLost + upsellRevenueGain) * 12;
  }, [thirdPartyCommissionsLost, upsellRevenueGain]);

  // WhatsApp Copilot interactive scenarios
  const copilotScenarios = [
    {
      id: 0,
      title: "Actualizar Precios",
      command: "Sube el precio de la Salchipapa Moe Monster a 48 Bs y activa promo 2x1 en Fernet",
      response: "Listo. Actualice el precio de 'Salchipapa Moe Monster' a 48 Bs y active la oferta '2x1 Fernet Cruceño' en el menu digital con badge de oferta.",
      tag: "Precios y Promociones",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    },
    {
      id: 1,
      title: "Pausar Plato Agotado (86)",
      command: "Se acabo el lomo fino para las hamburguesas gourmet, pausalas hasta manana",
      response: "Entendido. Las 3 hamburguesas con Lomo Fino acaban de marcarse como temporalmente agotadas. No apareceran disponibles en las mesas.",
      tag: "Control de Stock",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30"
    },
    {
      id: 2,
      title: "Ventas y Telemetria",
      command: "¿Cuales son los 3 platos y tragos mas vendidos del turno de hoy?",
      response: "Turno actual: 1. Salchipapa Moe Monster (42 pedidos), 2. Chopp Helado Escarchado (68 unidades), 3. Moscow Mule de Autor (29 unidades). Total generado: 5,420 Bs.",
      tag: "Analitica en Vivo",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    },
    {
      id: 3,
      title: "Agregar Nuevo Plato",
      command: "Agrega 'Cerveza Artesanal IPA Cruceña' a Bebidas por 28 Bs con tag de Novedad",
      response: "Creado con exito. 'Cerveza Artesanal IPA Cruceña' ya esta disponible en la categoria Bebidas con fotografia optimizada y etiqueta dorada de NUEVO.",
      tag: "Gestion de Carta",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  ];

  // 8 Core Pillars
  const modules = [
    {
      id: 1,
      title: "Menu Digital Estrategico",
      subtitle: "+24% en Ticket Promedio",
      description: "Algoritmo de maridaje inteligente y etiquetas de alta rotacion que sugieren complementos clave al comensal justo antes de confirmar su comanda.",
      icon: Flame,
      highlight: "Algoritmo Upsell",
      colSpan: "lg:col-span-7",
      accent: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/30"
    },
    {
      id: 2,
      title: "Cazador de Reseñas en Google Maps",
      subtitle: "Captura 5 Estrellas en Mesa",
      description: "Filtra la experiencia del comensal: las evaluaciones excelentes van directo a Google Maps en 1 toque, blindando la reputacion de tu local.",
      icon: Star,
      highlight: "Reputacion 5 Estrellas",
      colSpan: "lg:col-span-5",
      accent: "from-yellow-500/20 via-yellow-500/5 to-transparent border-yellow-500/30"
    },
    {
      id: 3,
      title: "Copiloto IA por WhatsApp",
      subtitle: "Gestion por Notas de Voz o Texto",
      description: "Administra precios, pausa platos agotados y consulta ventas en tiempo real enviando un mensaje natural a tu asistente autorizado.",
      icon: Bot,
      highlight: "WhatsApp Nativo",
      colSpan: "lg:col-span-4",
      accent: "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/30"
    },
    {
      id: 4,
      title: "QR Dinamico por Mesa",
      subtitle: "Cero Esperas para Pedir",
      description: "Asignacion automatica de zona y mesa. Comanda express sin descargar aplicaciones, con propina voluntaria y pagos directos por QR Simple o tarjeta.",
      icon: QrCode,
      highlight: "PWA Ultrarrapida",
      colSpan: "lg:col-span-4",
      accent: "from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/30"
    },
    {
      id: 5,
      title: "Link en Bio y Pedidos 0% Comision",
      subtitle: "Ahorra 22% de Agregadores",
      description: "Canal directo para Instagram, TikTok y WhatsApp. Tus clientes ordenan directo conservando el 100% de los ingresos y la base de datos.",
      icon: Smartphone,
      highlight: "0% Comisiones",
      colSpan: "lg:col-span-4",
      accent: "from-orange-500/20 via-orange-500/5 to-transparent border-orange-500/30"
    },
    {
      id: 6,
      title: "Comanda Digital y KDS de Cocina",
      subtitle: "Cero Papeles Perdidos",
      description: "Pantalla interactiva en tiempo real para cocina y barra. Control de tiempos de coccion, cambios de estado y alertas de despacho al personal.",
      icon: ChefHat,
      highlight: "Cocina y Barra",
      colSpan: "lg:col-span-4",
      accent: "from-cyan-500/20 via-cyan-500/5 to-transparent border-cyan-500/30"
    },
    {
      id: 7,
      title: "CRM Gastronomico y Fidelizacion",
      subtitle: "Historial Real de Comensales",
      description: "Identifica a tus clientes mas fieles, frecuencias de visita y platos favoritos para enviar promociones segmentadas sin intermediarios.",
      icon: Users,
      highlight: "Base de Datos Propia",
      colSpan: "lg:col-span-4",
      accent: "from-purple-500/20 via-purple-500/5 to-transparent border-purple-500/30"
    },
    {
      id: 8,
      title: "Deteccion de Alergenos y Multi-Idioma",
      subtitle: "Atencion Global y Segura",
      description: "Deteccion automatica del idioma del turista (Ingles, Portugues, Espanol) y filtros claros de alergenos (sin gluten, sin lactosa, vegano).",
      icon: Globe,
      highlight: "Turismo y Salud",
      colSpan: "lg:col-span-4",
      accent: "from-teal-500/20 via-teal-500/5 to-transparent border-teal-500/30"
    }
  ];

  // Comparison Matrix Data
  const comparisonRows = [
    {
      feature: "Comision por venta",
      mimenu: "0% (Suscripcion fija)",
      pdf: "0%",
      paper: "0%",
      apps: "18% a 30% por pedido"
    },
    {
      feature: "Sugerencias de maridaje y upsell (+24%)",
      mimenu: true,
      pdf: false,
      paper: false,
      apps: "Solo promociona otros locales"
    },
    {
      feature: "Captura de reseñas 5 estrellas en Google Maps",
      mimenu: true,
      pdf: false,
      paper: false,
      apps: false
    },
    {
      feature: "Copiloto de gestion por WhatsApp",
      mimenu: true,
      pdf: false,
      paper: false,
      apps: false
    },
    {
      feature: "Edicion de precios instantanea",
      mimenu: "En 5 segundos",
      pdf: "Requiere subir nuevo PDF",
      paper: "Reimprimir carta completa",
      apps: "Tarda horas o dias"
    },
    {
      feature: "Dueño de los datos del cliente",
      mimenu: "100% tuyos (CRM propio)",
      pdf: "No captura datos",
      paper: "No captura datos",
      apps: "Pertenecen a la app"
    }
  ];

  // FAQs
  const faqs = [
    {
      q: "¿Cuanto tiempo toma configurar MiMenu para mi local?",
      a: "Menos de 5 minutos. Puedes subir una foto de tu carta fisica o ingresar tus platos. El sistema organiza categorias, fotos sugeridas y precios al instante."
    },
    {
      q: "¿Mis clientes tienen que descargar alguna aplicacion?",
      a: "No. MiMenu funciona en web movil de alta velocidad (PWA). Los comensales escanean el codigo QR en la mesa o tocan tu enlace de Instagram y la carta abre de inmediato."
    },
    {
      q: "¿Como funciona el Cazador de Reseñas de Google Maps?",
      a: "Al confirmar el pedido o solicitar la cuenta, el sistema ofrece calificar el servicio. Las calificaciones de 5 estrellas se canalizan directamente a tu perfil de Google Maps. Cualquier observacion constructiva llega en privado a la gerencia."
    },
    {
      q: "¿Puedo modificar precios y pausar platos desde WhatsApp?",
      a: "Si. Vinculas tu numero de WhatsApp autorizado y puedes enviar notas de texto o voz como: 'Pausa las hamburguesas porque se acabo el pan y sube el chopp a 25 Bs'. El copiloto ejecuta la orden de inmediato."
    },
    {
      q: "¿Cobran comisiones porcentuales por pedido?",
      a: "Cero comisiones (0%). A diferencia de plataformas agregadoras que retienen entre 18% y 30%, en MiMenu pagas una suscripcion fija mensual o anual y conservas el 100% del valor de cada venta."
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#08090C] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black font-sans antialiased overflow-x-hidden">
      
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="fixed top-[40%] right-[-100px] w-[500px] h-[350px] bg-orange-600/5 blur-[160px] pointer-events-none -z-10 rounded-full" />

      {/* Global Live Notice Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-500/20 text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 text-amber-300">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" aria-hidden="true" />
        <span><strong>Lanzamiento 2026:</strong> Copiloto por WhatsApp y Cazador de Reseñas Google Maps integrados.</span>
        <span className="hidden md:inline text-amber-400/60">| 14 dias de prueba sin tarjeta.</span>
      </div>

      {/* Main Glass Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#08090C]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0D0E15] rounded-[11px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" aria-hidden="true" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">MiMenu</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Gastronomic OS
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5">Tecnologia para Restaurantes</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#soluciones" className="hover:text-amber-400 transition-colors">8 Modulos</a>
            <a href="#copiloto-ia" className="hover:text-amber-400 transition-colors">Copiloto WhatsApp</a>
            <a href="#calculadora-roi" className="hover:text-amber-400 transition-colors">Calculadora ROI</a>
            <a href="#comparativa" className="hover:text-amber-400 transition-colors">Comparativa</a>
            <a href="#precios" className="hover:text-amber-400 transition-colors">Precios</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">Preguntas</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/menu')}
              className="hidden sm:inline-flex border-white/10 hover:border-amber-500/50 hover:bg-white/5 text-slate-200 font-semibold rounded-xl text-xs h-9"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>Ver Menú Demo</span>
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/onboarding')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs px-4 rounded-xl h-9 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Probar 14 Dias</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION: Asymmetric Kinetic Layout */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left: Strategic Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.1] px-4 py-1.5 rounded-full text-xs font-semibold text-amber-400 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span>Menu inteligente con 0% de comision por comanda</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                El menu digital que <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  multiplica tus ventas
                </span> <br />
                y fideliza a tus clientes.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Sube tu ticket promedio un <strong>+24%</strong> con sugerencias automaticas, captura <strong>reseñas 5 estrellas en Google Maps</strong> en cada mesa y gestiona todo tu restaurante por <strong>WhatsApp con IA</strong>.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>Empezar Gratis 14 Dias</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/menu')}
                  className="w-full sm:w-auto border-white/15 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm px-6 py-6 rounded-2xl transition-all"
                >
                  <Play className="w-4 h-4 mr-2 text-amber-400 fill-amber-400" aria-hidden="true" />
                  <span>Probar Menú Comensal</span>
                </Button>
              </div>

              {/* Proof Signals */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/[0.08] max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">+24%</div>
                  <div className="text-[11px] font-medium text-slate-400">Ticket promedio</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">0%</div>
                  <div className="text-[11px] font-medium text-slate-400">Comision por venta</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">4.9 ★</div>
                  <div className="text-[11px] font-medium text-slate-400">En Google Maps</div>
                </div>
              </div>

            </div>

            {/* Right: Live Interactive Gastronomic Device Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[380px] rounded-[36px] bg-gradient-to-b from-white/15 to-white/5 p-[1px] shadow-2xl shadow-black/80">
                <div className="rounded-[35px] bg-[#0D0E15] p-5 space-y-4 overflow-hidden border border-white/[0.05]">
                  
                  {/* Top Bar of Mobile Simulation */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-slate-200">{venue?.name || "Mesa 14 · Terraza"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      QR ACTIVO
                    </span>
                  </div>

                  {/* Dish Card with Interactive Upsell */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white truncate">Salchipapa Moe Monster</h4>
                          <span className="text-xs font-black text-amber-400">48 Bs</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          Papas rusticas crocantes, salchicha alemana ahumada, queso fundido y salsa secreta.
                        </p>
                      </div>
                    </div>

                    {/* Interactive Upsell Trigger */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkle className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Maridaje Recomendado (+24%)</div>
                          <div className="text-[10px] text-amber-300">Chopp Artesanal IPA (+22 Bs)</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setHeroUpsellAdded(!heroUpsellAdded)}
                        className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all ${
                          heroUpsellAdded 
                            ? 'bg-emerald-500 text-black' 
                            : 'bg-amber-500 hover:bg-amber-400 text-black'
                        }`}
                      >
                        {heroUpsellAdded ? 'Agregado ✓' : '+ Sumar'}
                      </button>
                    </div>
                  </div>

                  {/* Order Total Simulation Bar */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Total de Comanda</span>
                      <span className="text-base font-black text-white">
                        {heroUpsellAdded ? '70 Bs' : '48 Bs'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 text-[10px] font-bold block">0% Comision</span>
                      <span className="text-slate-400 text-[10px]">Pago Directo en Mesa</span>
                    </div>
                  </div>

                  {/* Google Maps Review Booster Box */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-yellow-300 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        Cazador de Reseñas Google
                      </span>
                      <span className="text-[9px] text-slate-400">Post-consumo</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setHeroReviewGiven(true)}
                          className="hover:scale-125 transition-transform"
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </button>
                      ))}
                    </div>
                    {heroReviewGiven && (
                      <div className="text-center text-[10px] font-bold text-emerald-400 animate-fade-in">
                        Redirigiendo a Google Maps con 5 estrellas registradas
                      </div>
                    )}
                  </div>

                  {/* Live Copilot Floating Pill */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-[11px] text-emerald-300">
                    <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Copiloto WhatsApp: sincronizado con cocina y caja</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: 8-MODULE ASYMMETRIC BENTO GRID */}
      <section id="soluciones" className="py-24 bg-[#0A0B10] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Arquitectura de Alto Desempeño
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              8 Modulos diseñados para facturar mas y operar con fluidez.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Cada componente fue estructurado para maximizar el margen de ganancia por mesa, agilizar la cocina y eliminar fricciones en el servicio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {modules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  className={`${mod.colSpan} relative rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/[0.08] hover:border-amber-500/40 p-7 sm:p-8 flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        {mod.highlight}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{mod.title}</h3>
                      <p className="text-xs font-semibold text-amber-400 mt-0.5">{mod.subtitle}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
                    <span>Modulo Integrado</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3: INTERACTIVE WHATSAPP COPILOT PLAYGROUND */}
      <section id="copiloto-ia" className="py-24 bg-[#08090C] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
              <Bot className="w-4 h-4" />
              Gestion Gastronomica con Lenguaje Natural
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Controla tu restaurante desde WhatsApp en segundos.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              No abras paneles complejos mientras atiendes a los comensales. Envia un mensaje o una nota de voz y el Copiloto actualiza la carta, pausa platos o reporta las ventas al instante.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Scenario Selector Chips */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Haz clic para simular una orden:
              </span>
              {copilotScenarios.map((scen, idx) => (
                <button
                  key={scen.id}
                  onClick={() => setActiveCopilotTab(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                    activeCopilotTab === idx 
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-white block">{scen.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block ${scen.badgeColor}`}>
                      {scen.tag}
                    </span>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${activeCopilotTab === idx ? 'text-emerald-400 translate-x-1' : 'text-slate-500'}`} />
                </button>
              ))}
            </div>

            {/* Interactive WhatsApp Terminal Simulation */}
            <div className="lg:col-span-7">
              <div className="rounded-[32px] bg-[#0E1017] border border-emerald-500/30 p-6 shadow-2xl shadow-emerald-500/5 space-y-5">
                
                {/* Header of Chat */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>Copiloto MiMenu</span>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded-full">
                          En linea
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Asistente Gastronomico Autorizado</span>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 py-2 min-h-[220px] flex flex-col justify-center">
                  
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-600 text-white p-3.5 text-xs sm:text-sm font-medium shadow-md">
                      <p>{copilotScenarios[activeCopilotTab].command}</p>
                      <span className="text-[9px] text-emerald-200 block text-right mt-1">20:14 · Tu</span>
                    </div>
                  </div>

                  {/* AI Response message */}
                  <div className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-white/[0.06] border border-white/[0.1] text-slate-100 p-4 text-xs sm:text-sm space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                        <Check className="w-3.5 h-3.5" />
                        Accion ejecutada en tiempo real
                      </div>
                      <p className="leading-relaxed">{copilotScenarios[activeCopilotTab].response}</p>
                      <span className="text-[9px] text-slate-400 block text-right">20:14 · Copiloto</span>
                    </div>
                  </div>

                </div>

                {/* Simulated Input */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center gap-3">
                  <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-slate-400">
                    Mensaje para el restaurante...
                  </div>
                  <button className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold">
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: INTERACTIVE ROI & COMMISSION LOSS ENGINE */}
      <section id="calculadora-roi" className="py-24 bg-[#0A0B10] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
              Calculadora de Rentabilidad Gastronomica
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              ¿Cuanto dinero recupera tu restaurante cada mes?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mueve los controles segun el volumen de tu local para ver comisiones recuperadas y el incremento de facturacion por upsell.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-[36px] p-8 sm:p-12 shadow-2xl">
            
            {/* Sliders on Left */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Slider 1: Orders */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Pedidos / Comandas por mes:</span>
                  <span className="text-amber-400 font-black text-lg">{monthlyOrders} pedidos</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={3000}
                  step={50}
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>100 pedidos</span>
                  <span>1,500 pedidos</span>
                  <span>3,000 pedidos</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Ticket promedio por comanda:</span>
                  <span className="text-amber-400 font-black text-lg">Bs. {averageTicket}</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={250}
                  step={5}
                  value={averageTicket}
                  onChange={(e) => setAverageTicket(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>15 Bs</span>
                  <span>120 Bs</span>
                  <span>250 Bs</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Garantia de Suscripcion Fija
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  En MiMenu pagas una tarifa fija mensual. No hay porcentajes ocultos ni deducciones sobre tus ingresos.
                </p>
              </div>

            </div>

            {/* Calculated Values on Right */}
            <div className="lg:col-span-6 space-y-4 bg-[#0E1017] p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl">
              
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Beneficio Mensual Estimado</span>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  Bs. {(thirdPartyCommissionsLost + upsellRevenueGain).toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ mes</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs">
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Comisiones de delivery ahorradas (22%):</span>
                  <span className="font-bold text-emerald-400">+Bs. {thirdPartyCommissionsLost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Ingreso extra por maridajes con IA (+24%):</span>
                  <span className="font-bold text-amber-400">+Bs. {upsellRevenueGain.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Reseñas 5★ Google capturadas / mes:</span>
                  <span className="font-bold text-yellow-300">~{estimatedGoogleReviews} reseñas</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center text-sm font-bold">
                  <span className="text-white">Impacto Anual en Tu Negocio:</span>
                  <span className="text-amber-400 font-black text-base">Bs. {netAnnualBenefit.toLocaleString()}</span>
                </div>

              </div>

              <Button
                onClick={() => navigate('/onboarding')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs py-5 rounded-xl shadow-lg shadow-amber-500/20"
              >
                Comenzar a Facturar Mas con MiMenu
              </Button>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: COMPARATIVE SYSTEM MATRIX */}
      <section id="comparativa" className="py-24 bg-[#08090C] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              <Award className="w-4 h-4" />
              Comparativa de Soluciones
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Por que los mejores restaurantes eligen MiMenu.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Descubre las diferencias operativas frente a cartas de papel, codigos QR estaticos y plataformas agregadoras tradicionales.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px] bg-white/[0.02] border border-white/[0.08] rounded-3xl overflow-hidden">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.04]">
                  <th className="p-5 font-bold text-slate-300">Caracteristica</th>
                  <th className="p-5 font-black text-amber-400 bg-amber-500/10 border-x border-amber-500/20 text-sm">
                    MiMenu Gastronomic OS
                  </th>
                  <th className="p-5 font-bold text-slate-400">Menú en PDF / Imagen</th>
                  <th className="p-5 font-bold text-slate-400">Carta de Papel</th>
                  <th className="p-5 font-bold text-slate-400">Apps de Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-semibold text-slate-200">{row.feature}</td>
                    <td className="p-4 font-bold text-amber-300 bg-amber-500/5 border-x border-amber-500/20">
                      {typeof row.mimenu === 'boolean' ? (
                        row.mimenu ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-rose-500" />
                      ) : row.mimenu}
                    </td>
                    <td className="p-4 text-slate-400">
                      {typeof row.pdf === 'boolean' ? (
                        row.pdf ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-600" />
                      ) : row.pdf}
                    </td>
                    <td className="p-4 text-slate-400">
                      {typeof row.paper === 'boolean' ? (
                        row.paper ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-600" />
                      ) : row.paper}
                    </td>
                    <td className="p-4 text-slate-400">
                      {typeof row.apps === 'boolean' ? (
                        row.apps ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-600" />
                      ) : row.apps}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* SECTION 6: GASTRONOMIC PRICING */}
      <section id="precios" className="py-24 bg-[#0A0B10] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              Planes Transparentes
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Suscripciones claras, sin comisiones por venta.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Elige el plan ideal para tu modelo de negocio. Prueba 14 dias sin costo y cancela en cualquier momento.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  2 MESES GRATIS
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Plan 1: Starter */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Starter</span>
                <h3 className="text-2xl font-black text-white">Menú Digital QR</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Ideal para cafeterias, pastelerias y locales que buscan digitalizar su carta.</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-black text-white">Bs. {billingCycle === 'monthly' ? '180' : '150'}</span>
                  <span className="text-xs text-slate-400">/ mes</span>
                </div>

                <ul className="space-y-3 text-xs font-medium text-slate-300 pt-6 border-t border-white/[0.08]">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Menú digital ultra-rapido (PWA)</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Codigos QR ilimitados con logo</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Cazador de Reseñas de Google Maps</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Fotos sugeridas automaticas</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 0% comision por ventas</li>
                </ul>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate('/onboarding')}
                className="w-full border-white/10 hover:border-white/30 text-white font-bold text-xs py-5 rounded-xl bg-white/[0.02]"
              >
                Comenzar Starter
              </Button>
            </div>

            {/* Plan 2: Pro (Featured) */}
            <div className="rounded-3xl bg-gradient-to-b from-amber-500/15 via-white/[0.04] to-white/[0.02] border-2 border-amber-500/60 p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
                MÁS ELEGIDO POR RESTAURANTES
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Pro</span>
                <h3 className="text-2xl font-black text-white">Gastronomic OS</h3>
                <p className="text-xs text-slate-300 leading-relaxed">Para restaurantes, bares, cervecerias y gastro-pubs en crecimiento activo.</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-black text-amber-400">Bs. {billingCycle === 'monthly' ? '340' : '290'}</span>
                  <span className="text-xs text-slate-400">/ mes</span>
                </div>

                <ul className="space-y-3 text-xs font-medium text-slate-200 pt-6 border-t border-white/[0.08]">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>Todo lo incluido en Starter</strong></li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>Copiloto IA por WhatsApp</strong></li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Carrito Express y Maridajes (+24%)</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Pedidos por Mesa con QR Dinamico</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Pantalla KDS de Cocina y Barra</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> CRM de Clientes y Fidelizacion</li>
                </ul>
              </div>

              <Button
                onClick={() => navigate('/onboarding')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs py-6 rounded-xl shadow-xl shadow-amber-500/20"
              >
                Probar 14 Dias Gratis
              </Button>
            </div>

            {/* Plan 3: Multi-Sucursal */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Grupos & Cadenas</span>
                <h3 className="text-2xl font-black text-white">Multi-Sucursal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Para franquicias, grupos gastronomicos y marcas con varias locaciones.</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-black text-white">Bs. {billingCycle === 'monthly' ? '680' : '590'}</span>
                  <span className="text-xs text-slate-400">/ mes</span>
                </div>

                <ul className="space-y-3 text-xs font-medium text-slate-300 pt-6 border-t border-white/[0.08]">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Todo lo incluido en Pro</strong></li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Gestion multi-sucursal unificada</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Integracion con Impresoras Termicas y POS</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Soporte prioritario y onboarding presencial</li>
                </ul>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate('/onboarding')}
                className="w-full border-white/10 hover:border-white/30 text-white font-bold text-xs py-5 rounded-xl bg-white/[0.02]"
              >
                Hablar con un Asesor
              </Button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7: INTERACTIVE FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#08090C] border-b border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Preguntas Frecuentes</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Todo lo que necesitas saber antes de dar el paso.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] p-5 cursor-pointer transition-all duration-200"
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              >
                <div className="flex items-center justify-between font-bold text-sm text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaqIndex === i ? 'rotate-180 text-amber-400' : ''}`} />
                </div>
                {openFaqIndex === i && (
                  <p className="pt-3 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.06] mt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 8: CLOSING SHOWSTOPPER CTA */}
      <section className="py-24 bg-gradient-to-b from-[#08090C] via-[#0E1017] to-[#08090C] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
            Comienza Hoy
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Eleva la experiencia de tu restaurante a estandares de alta categoria.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Incrementa el ticket promedio, captura reseñas 5 estrellas de forma automatizada y toma el control de tus ventas sin pagar comisiones.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Comenzar Prueba Gratis (14 Dias)</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto border-white/15 hover:border-white/30 text-white font-semibold text-sm px-7 py-6 rounded-2xl bg-white/[0.03]"
            >
              <span>Explorar Menú Demo</span>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#060709] border-t border-white/[0.08] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-sm text-white">MiMenu</span>
            <span className="text-slate-600">|</span>
            <span>ClubeMkt Gastronomy Group</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <Link to="/proposta" className="hover:text-amber-400 transition-colors">Proposta Comercial</Link>
            <Link to="/contract-management" className="hover:text-amber-400 transition-colors">Contrato</Link>
            <Link to="/onboarding" className="hover:text-amber-400 transition-colors">Registro</Link>
            <Link to="/auth" className="hover:text-amber-400 transition-colors">Acceso Clientes</Link>
          </div>

          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} MiMenu. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
