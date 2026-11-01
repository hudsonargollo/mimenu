import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Flame, 
  Sparkles, 
  QrCode, 
  ArrowRight, 
  Smartphone, 
  UtensilsCrossed, 
  Zap, 
  ChefHat, 
  Check, 
  X, 
  ChevronDown,
  TrendingUp,
  ShieldCheck,
  Send,
  MessageCircle,
  Clock,
  DollarSign,
  Layers,
  Store,
  Bike,
  ReceiptText,
  Copy,
  CheckCheck,
  Sparkle
} from "lucide-react";
import { useMimenu } from "@/lib/mimenuContext";
import { Button } from "@/components/ui/button";

export const LandingGenio: React.FC = () => {
  const navigate = useNavigate();
  const { venue } = useMimenu();

  // State for interactive features
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [monthlyOrders, setMonthlyOrders] = useState<number>(550);
  const [averageTicket, setAverageTicket] = useState<number>(52);
  const [storeSlug, setStoreSlug] = useState<string>("tu-hamburgueseria");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [nightModeComparison, setNightModeComparison] = useState<'manual' | 'mimenu'>('mimenu');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    document.title = "MiMenu | Menú Digital Sin Comisión para Restaurantes y Delivery";
  }, []);

  // ROI math
  const thirdPartyCommissionsLost = useMemo(() => {
    return Math.round(monthlyOrders * averageTicket * 0.23); // 23% avg aggregator commission
  }, [monthlyOrders, averageTicket]);

  const upsellGain = useMemo(() => {
    return Math.round(monthlyOrders * averageTicket * 0.22); // 22% increase from smart combos & upsell
  }, [monthlyOrders, averageTicket]);

  const totalMonthlyGain = useMemo(() => {
    return thirdPartyCommissionsLost + upsellGain;
  }, [thirdPartyCommissionsLost, upsellGain]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://mimenu.clubemkt.digital/loja/${storeSlug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 6 Hubs of the operation (El Rayos X de la Operación)
  const operationHubs = [
    {
      id: "cardapio",
      title: "Menú Inteligente",
      badge: "Ventas Directas",
      icon: Flame,
      summary: "Categorías, fotos de carga rápida, complementos obligatorios y control de ítems agotados sin salir de la lista.",
      points: [
        "Fotos livianas con caché optimizado para 3G",
        "Selección de punto de la carne y adicionales obligatorios",
        "Observación por ítem directo en el producto correcto",
        "Precio tachado con destaque visual para promociones"
      ]
    },
    {
      id: "cozinha",
      title: "KDS Cocina y Barra",
      badge: "Producción sin Papel",
      icon: ChefHat,
      summary: "Pantalla de preparación completa con tiempos de cocción, alertas sonoras e impresión automática para impresoras térmicas.",
      points: [
        "Pantalla interactiva para plancha, cocina y montaje",
        "Alertas por tiempo de espera y cola de pedidos",
        "Impresión automática directa por red o USB",
        "Cambio de estado con 1 toque en la pantalla"
      ]
    },
    {
      id: "delivery",
      title: "Delivery y Mesa",
      badge: "Despacho Ágil",
      icon: Bike,
      summary: "Costo de envío calculado por zona, control de motorizado y QR de cuenta para mesas con 0% de comisión.",
      points: [
        "Costo de envío configurable por zona o km",
        "Cuenta express en la mesa con QR único",
        "Despacho rápido con datos completos del cliente",
        "Link único para la bio de Instagram y WhatsApp"
      ]
    },
    {
      id: "balcao",
      title: "Mostrador y Caja",
      badge: "Punto de Venta",
      icon: Store,
      summary: "Carga manual ultrarrápida para pedidos de mostrador, retiros en el local o clientes que llaman directamente.",
      points: [
        "Carga en menos de 10 segundos en el mostrador",
        "Identificación rápida de clientes registrados",
        "Cierre de caja unificado al final de la noche",
        "Control de vuelto y formas de pago mixtas"
      ]
    },
    {
      id: "pagamentos",
      title: "Pagos Integrados",
      badge: "Cobro Directo",
      icon: ReceiptText,
      summary: "QR automático con confirmación instantánea, tarjeta y efectivo con vuelto calculado.",
      points: [
        "QR automático con liberación inmediata del pedido",
        "Pago online con tarjeta de crédito y débito",
        "Opción de pago contra entrega (POS/efectivo)",
        "El dinero entra directo a tu cuenta bancaria"
      ]
    },
    {
      id: "gestao",
      title: "Gestión y CRM",
      badge: "Base 100% Tuya",
      icon: TrendingUp,
      summary: "Facturación diaria, ticket promedio, horarios pico e historial de consumo para fidelizar sin intermediarios.",
      points: [
        "Historial completo de clientes con dirección y teléfono",
        "Reporte de los platos y bebidas más vendidos",
        "Exportación de datos en cualquier momento",
        "Recuperación de clientes inactivos con 1 clic"
      ]
    }
  ];

  // Pricing Plans (Adapted from Cardápio Gênio)
  const plans = [
    {
      name: "Start",
      description: "Para quien está comenzando a vender online o quiere digitalizar la operación.",
      priceMonthly: "69,90",
      priceYearly: "799,90",
      featured: false,
      features: [
        "Menú digital ilimitado con fotos",
        "Pedidos directo en el link y WhatsApp",
        "Gestión de pedidos y panel de control",
        "Panel KDS de Cocina en pantalla completa",
        "Control de formas de pago y QR",
        "0% de comisión sobre tus ventas",
        "Soporte directo por WhatsApp"
      ]
    },
    {
      name: "Pro",
      description: "Operación completa con automatizaciones de entrega, reportes y control total.",
      priceMonthly: "129,90",
      priceYearly: "1.449,90",
      featured: true,
      badge: "MÁS ELEGIDO",
      features: [
        "Todo lo que incluye el plan Start",
        "Copiloto IA para gestión por WhatsApp",
        "Notificaciones automáticas de estado por WhatsApp",
        "Cálculo inteligente de costos por zona",
        "Sugeridor de maridaje y upsell automático (+22%)",
        "Reportes de facturación, pico y ticket promedio",
        "CRM de clientes y fidelización activa",
        "Impresión automática en impresora térmica"
      ]
    },
    {
      name: "Multi-Local",
      description: "Para cadenas gastronómicas, franquicias y grupos con múltiples sucursales.",
      priceMonthly: "249,90",
      priceYearly: "2.790,00",
      featured: false,
      features: [
        "Todo lo que incluye el plan Pro",
        "Múltiples locales centralizados en una cuenta",
        "Menús y precios individuales por sucursal",
        "Integración avanzada con ERPs y POS",
        "Gerente de cuenta dedicado y onboarding guiado"
      ]
    }
  ];

  // Direct, no-fluff FAQs
  const faqs = [
    {
      q: "¿Voy a pagar una parte o porcentaje de cada pedido?",
      a: "No. La mensualidad es fija. Un mes con récord de ventas no cuesta más que un mes flojo. El 100% del valor que paga el cliente entra limpio para ti, sin ninguna comisión por pedido."
    },
    {
      q: "¿El cliente será mío o de la plataforma?",
      a: "100% tuyo. El teléfono, la dirección, el historial de pedidos y las preferencias quedan guardados en tu propia base de datos, y puedes exportarlos cuando quieras. No vendemos a tu cliente a la competencia."
    },
    {
      q: "¿Quedaré atado a algún contrato con multa?",
      a: "No hay permanencia ni multa por cancelación. Pagas el mes y continúas mientras la plataforma genere ganancias para tu negocio. Si decides pausar, el menú se desactiva y tus datos siguen siendo tuyos."
    },
    {
      q: "No tengo tiempo ni paciencia para cargar productos y configurar.",
      a: "No necesitas hacerlo solo. Basta con enviar una foto de tu menú físico o tu planilla y nuestra inteligencia y equipo cargan las categorías, fotos y complementos contigo antes de la inauguración."
    },
    {
      q: "¿Y si surge alguna duda o problema durante el movimiento de la noche?",
      a: "Nuestro soporte atiende directo por WhatsApp con atención humana y rápida, además del Copiloto IA que resuelve cambios de precio o pausa de productos en segundos."
    },
    {
      q: "¿Mis clientes necesitan descargar alguna aplicación?",
      a: "No hace falta descargar nada. El cliente toca el link de la bio de Instagram o escanea el QR en la mesa y el menú abre en menos de 1 segundo directo en el navegador del celular."
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#07080B] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black font-sans antialiased overflow-x-hidden">
      
      {/* Subtle Warm Gastronomic Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-amber-500/10 blur-[150px] pointer-events-none -z-10 rounded-full" />
      <div className="fixed top-[45%] right-[-120px] w-[550px] h-[400px] bg-orange-600/5 blur-[160px] pointer-events-none -z-10 rounded-full" />

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-500/20 text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 text-amber-300">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" aria-hidden="true" />
        <span><strong>Menú Digital Sin Comisión:</strong> Vende en tu link propio y quédate con el 100% de la ganancia.</span>
        <span className="hidden md:inline text-amber-400/60">| Sin permanencia y sin costo de adhesión.</span>
      </div>

      {/* Sticky Main Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#07080B]/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/mimenu.svg" alt="MiMenu" className="h-10 w-10 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">MiMenu</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.2 rounded-full border border-amber-500/30">
                  0% Comisión
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5">Sistema Operativo Gastronómico</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#como-funciona" className="hover:text-amber-400 transition-colors">Cómo Funciona</a>
            <a href="#operacao" className="hover:text-amber-400 transition-colors">Rayos X de la Operación</a>
            <a href="#comparativo" className="hover:text-amber-400 transition-colors">La Misma Noche</a>
            <a href="#calculadora" className="hover:text-amber-400 transition-colors">Ahorro Real</a>
            <a href="#planos" className="hover:text-amber-400 transition-colors">Planes y Precios</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">Preguntas Frecuentes</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/menu')}
              className="hidden sm:inline-flex border-white/10 hover:border-amber-500/50 hover:bg-white/5 text-slate-200 font-semibold rounded-xl text-xs h-9"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5 text-amber-400" aria-hidden="true" />
              <span>Ver Menú Demo</span>
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/onboarding')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs px-4 rounded-xl h-9 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Crear Mi Local</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION: Cardápio Digital Sem Comissão */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left: Direct Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.1] px-4 py-1.5 rounded-full text-xs font-semibold text-amber-400 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span>Menú Digital Directo Sin Intermediarios</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Vende en tu link propio y <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  quédate con el 100% del valor
                </span> <br />
                de cada pedido.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                El cliente abre tu menú, arma el pedido y lo envía. Llega a tu panel completo: <strong>ítem, observación, dirección, mesa y forma de pago</strong>. Pagas una mensualidad fija, y nada más.
              </p>

              {/* Trust Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sin comisión por venta</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>En línea hoy en tu link</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sin contrato de permanencia</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>Crear Mi Menú Ahora</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/menu')}
                  className="w-full sm:w-auto border-white/15 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm px-6 py-6 rounded-2xl transition-all"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2 text-amber-400" aria-hidden="true" />
                  <span>Probar Menú en Vivo</span>
                </Button>
              </div>

            </div>

            {/* Right: Interactive Store Link & Live Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Interactive Store URL Bar */}
              <div className="rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] p-5 shadow-2xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  La dirección de tu local queda así:
                </span>
                
                <div className="flex items-center gap-2 bg-[#0B0C12] border border-white/[0.12] rounded-2xl p-2.5 text-xs">
                  <div className="text-slate-400 font-mono text-[11px] truncate select-all pl-2">
                    mimenu.clubemkt.digital/loja/
                  </div>
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="tu-local"
                    className="flex-1 bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30 rounded-lg px-2 py-1 focus:outline-hidden text-xs min-w-[90px]"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-colors shrink-0"
                    title="Copiar link"
                  >
                    {copiedLink ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Link fijo y permanente para Instagram, TikTok y QR</span>
                  <span className="text-emerald-400 font-bold">100% Online</span>
                </div>
              </div>

              {/* Live Order Ticket Simulation */}
              <div className="rounded-3xl bg-[#0D0E15] border border-white/[0.08] p-5 space-y-3 shadow-xl">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">Pedido #128 · Delivery Directo</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    RECIBIDO EN EL PANEL
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white">2x Burger Artesanal Smash Doble</div>
                      <div className="text-[11px] text-amber-300">Obs: 1x Sin cebolla, 1x Bien cocido</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">+ Borde Relleno de Cheddar y Bacon (+12 Bs.)</div>
                    </div>
                    <span className="font-black text-white">Bs. 86,00</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">1x Porción de Papas Rústicas + Coca Zero</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Maridaje aceptado por el cliente</div>
                    </div>
                    <span className="font-black text-white">Bs. 28,00</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total del Pedido</span>
                    <span className="text-base font-black text-white">Bs. 114,00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 text-[11px] font-bold block">0% Retenido (Bs. 0 de comisión)</span>
                    <span className="text-slate-400 text-[10px]">Bs. 114,00 directo a tu cuenta</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: A MESMA NOITE, DOS DOIS JEITOS (Split Interactive Comparison) */}
      <section id="comparativo" className="py-24 bg-[#0A0B10] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              Contraste Operativo
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              La misma noche de movimiento, de las dos formas.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mira la diferencia entre operar con el improviso de cuadernos y mensajes sueltos versus tener un sistema directo y automatizado.
            </p>

            {/* Mobile Switcher Toggle */}
            <div className="inline-flex lg:hidden items-center bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08] mt-2">
              <button
                onClick={() => setNightModeComparison('manual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  nightModeComparison === 'manual' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'
                }`}
              >
                En el Cuaderno y WhatsApp Manual
              </button>
              <button
                onClick={() => setNightModeComparison('mimenu')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  nightModeComparison === 'mimenu' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
                }`}
              >
                Con MiMenu
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* The Hard Way: Manual Caderno */}
            <div className={`rounded-3xl bg-gradient-to-b from-rose-500/10 via-white/[0.02] to-white/[0.01] border border-rose-500/30 p-8 space-y-6 ${nightModeComparison === 'mimenu' ? 'hidden lg:block' : 'block'}`}>
              <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">En el Cuaderno y WhatsApp Manual</h3>
                    <p className="text-xs text-rose-300/80 font-semibold">Cuello de botella, estrés y pedidos equivocados</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>Alguien anota el pedido en el mostrador mientras otro atiende la plancha.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>"¿Era sin cebolla?" y nadie está seguro porque la letra quedó ilegible.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>Costo de envío calculado de memoria y con apuro, zona por zona.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>A fin de mes, nadie sabe con precisión qué ítem dio más ganancia.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>El cuaderno se pierde y el historial del cliente se va con él.</span>
                </li>
              </ul>
            </div>

            {/* The Smart Way: MiMenu */}
            <div className={`rounded-3xl bg-gradient-to-b from-emerald-500/15 via-white/[0.03] to-white/[0.01] border-2 border-emerald-500/40 p-8 space-y-6 shadow-2xl shadow-emerald-500/5 ${nightModeComparison === 'manual' ? 'hidden lg:block' : 'block'}`}>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">Con MiMenu Gastronomic OS</h3>
                    <p className="text-xs text-emerald-300 font-semibold">Fluidez total, 0% de comisión y cuenta limpia</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>El cliente arma el pedido solo en el link directo, sin instalar app.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>La observación llega impresa y en el KDS en el ítem exacto, sin errores.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>El envío sale calculado automáticamente al instante según la zona.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>El reporte dice con exactitud el plato, el horario y la zona que más venden.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>El historial queda en tu base y el cliente repite el pedido con un toque.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: O RAIO-X DA SUA OPERAÇÃO (6 Core Hubs) */}
      <section id="operacao" className="py-24 bg-[#07080B] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Layers className="w-3.5 h-3.5" />
              Visión Completa
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Los rayos X de tu operación en una sola pantalla.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Desde el link que abre el cliente hasta el cierre de caja al final de la noche. Seis lugares por donde pasa el pedido, todos conectados sin cambiar de pestaña.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operationHubs.map((hub) => {
              const IconComp = hub.icon;
              return (
                <div
                  key={hub.id}
                  className="rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] hover:border-amber-500/40 p-7 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {hub.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{hub.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">{hub.summary}</p>
                    </div>

                    <ul className="space-y-2 pt-3 border-t border-white/[0.06] text-xs text-slate-300">
                      {hub.points.map((pt, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
                    <span>Módulo Activo</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 4: UM CARDÁPIO QUE TRABALHA PELA VENDA (Strategic Upsell & WhatsApp Updates) */}
      <section className="py-24 bg-[#0A0B10] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                <Sparkle className="w-4 h-4 text-amber-400" />
                Ingeniería de Menú
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Un menú que trabaja activamente por la venta.
              </h2>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Lo que aparece en la pantalla del cliente decide el tamaño de la cuenta. Creamos gatillos que aumentan el ticket promedio sin que tu equipo tenga que acordarse de ofrecer.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <h4 className="font-bold text-sm text-white">Fotos de Alta Velocidad con Caché</h4>
                  <p className="text-xs text-slate-400">Las imágenes cargan optimizadas y abren al instante incluso con el 3G de la calle.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <h4 className="font-bold text-sm text-white">Promoción con Precio Tachado</h4>
                  <p className="text-xs text-slate-400">El valor anterior aparece al lado del nuevo, convirtiendo el descuento en argumento de compra.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <h4 className="font-bold text-sm text-white">Adicionales y Maridaje en el Camino (+22%)</h4>
                  <p className="text-xs text-slate-400">Borde relleno, bebida y porciones extra se ofrecen en el momento exacto de cerrar el pedido.</p>
                </div>
              </div>
            </div>

            {/* Live WhatsApp Status Notification Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-[#0D0F16] border border-emerald-500/30 p-7 shadow-2xl space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Avisos Automáticos de Estado</h4>
                      <p className="text-[11px] text-emerald-400 font-semibold">WhatsApp de tu Local</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Sin intervención humana
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Cuando aceptas, cuando entra en preparación y cuando sale para entrega, el aviso va solo al WhatsApp del cliente. Es el mensaje que tu equipo manda a mano en medio del apuro, pero automático.
                </p>

                {/* Simulated WhatsApp Bubbles */}
                <div className="space-y-3 bg-[#07080B] p-4 rounded-2xl border border-white/[0.06]">
                  <div className="bg-[#005c4b] text-white p-3 rounded-xl text-xs max-w-[85%] space-y-1">
                    <p className="font-bold text-[11px] text-emerald-200">Pedido #128 Confirmado 🍕</p>
                    <p>¡Hola Lucas! Tu pedido ya entró en preparación en la cocina. Tiempo estimado: 35 min.</p>
                    <span className="text-[9px] text-emerald-200 block text-right">20:14 ✓✓</span>
                  </div>

                  <div className="bg-[#005c4b] text-white p-3 rounded-xl text-xs max-w-[85%] space-y-1">
                    <p className="font-bold text-[11px] text-emerald-200">Salió para Entrega 🛵</p>
                    <p>Tu pedido está en camino con el repartidor Juan. ¡Buen provecho!</p>
                    <span className="text-[9px] text-emerald-200 block text-right">20:41 ✓✓</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>El número es el de tu local y la conversación sigue siendo 100% tuya.</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: CALCULADORA DE RETORNO & AHORRO REAL */}
      <section id="calculadora" className="py-24 bg-[#07080B] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
              Calculadora de Ahorro Real
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              ¿Cuánto dejas de perder en comisiones cada mes?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mueve los controles para simular el volumen de tu restaurante y mira los ingresos que vuelven directamente a tu bolsillo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-[36px] p-8 sm:p-12 shadow-2xl">
            
            {/* Sliders on Left */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Slider 1: Orders */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Pedidos mensuales estimados:</span>
                  <span className="text-amber-400 font-black text-lg">{monthlyOrders} pedidos</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2500}
                  step={50}
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>100 pedidos</span>
                  <span>1.200 pedidos</span>
                  <span>2.500+ pedidos</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Ticket promedio por pedido:</span>
                  <span className="text-amber-400 font-black text-lg">Bs. {averageTicket},00</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={200}
                  step={5}
                  value={averageTicket}
                  onChange={(e) => setAverageTicket(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Bs. 20</span>
                  <span>Bs. 100</span>
                  <span>Bs. 200+</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mensualidad Fija, Sin Sorpresas
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Vender más no aumenta lo que pagas. Toda la facturación adicional es 100% tuya.
                </p>
              </div>

            </div>

            {/* Calculated Values on Right */}
            <div className="lg:col-span-6 space-y-4 bg-[#0E1017] p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl">
              
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Retorno Mensual Estimado</span>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  Bs. {totalMonthlyGain.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ mes</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs">
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Comisiones que dejas de pagar (23%):</span>
                  <span className="font-bold text-emerald-400">+Bs. {thirdPartyCommissionsLost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Ingreso extra por maridaje y upsell (+22%):</span>
                  <span className="font-bold text-amber-400">+Bs. {upsellGain.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center text-sm font-bold">
                  <span className="text-white">Impacto Anual en tu Negocio:</span>
                  <span className="text-amber-400 font-black text-base">Bs. {(totalMonthlyGain * 12).toLocaleString()}</span>
                </div>

              </div>

              <Button
                onClick={() => navigate('/onboarding')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs py-5 rounded-xl shadow-lg shadow-amber-500/20"
              >
                Asegurar Mi Local Sin Comisión
              </Button>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: PLANOS & PREÇOS (Mensalidade Fixa, Sem Comissão) */}
      <section id="planos" className="py-24 bg-[#0A0B10] border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              Mensualidad Fija
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Sin costo de instalación. Sin comisión. Sin permanencia.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Vender más en un mes no aumenta lo que pagas. Lo que facturas es totalmente tuyo.
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
                  DESCUENTO ESPECIAL
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between space-y-6 relative ${
                  p.featured
                    ? 'bg-gradient-to-b from-amber-500/15 via-white/[0.04] to-white/[0.02] border-2 border-amber-500/60 shadow-2xl shadow-amber-500/10'
                    : 'bg-white/[0.03] border border-white/[0.08]'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${p.featured ? 'text-amber-400' : 'text-slate-400'}`}>
                    Plano {p.name}
                  </span>
                  <h3 className="text-2xl font-black text-white">{p.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                  
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-xs text-slate-400">Bs.</span>
                    <span className={`text-4xl font-black ${p.featured ? 'text-amber-400' : 'text-white'}`}>
                      {billingCycle === 'monthly' ? p.priceMonthly : p.priceYearly}
                    </span>
                    <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                  </div>

                  <ul className="space-y-3 text-xs font-medium text-slate-200 pt-6 border-t border-white/[0.08]">
                    {p.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-2.5">
                        <Check className={`w-4 h-4 shrink-0 ${p.featured ? 'text-amber-400' : 'text-emerald-400'}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => navigate('/onboarding')}
                  className={`w-full py-5 rounded-xl font-bold text-xs ${
                    p.featured
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                      : 'border border-white/10 hover:border-white/30 text-white bg-white/[0.02]'
                  }`}
                >
                  Quiero Este Plan
                </Button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 7: PERGUNTAS QUE VOCÊ FARIA ANTES DE ASSINAR (Real FAQ) */}
      <section id="faq" className="py-24 bg-[#07080B] border-b border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Las preguntas que harías antes de suscribirte.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">Respuestas directas y transparentes, sin letra chica.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] p-5 cursor-pointer transition-all duration-200"
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              >
                <div className="flex items-center justify-between font-bold text-sm text-white">
                  <span>“{faq.q}”</span>
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

      {/* SECTION 8: SHOWSTOPPER FINAL CTA */}
      <section className="py-24 bg-gradient-to-b from-[#07080B] via-[#0E1017] to-[#07080B] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
            Tu Menú en Línea Esta Semana
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            ¿Listo para dejar de perder el 23% de tu facturación en comisiones?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Mándanos un mensaje, cuéntanos qué vendes y armamos el menú contigo hoy mismo.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Crear Mi Menú Ahora</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto border-white/15 hover:border-white/30 text-white font-semibold text-sm px-7 py-6 rounded-2xl bg-white/[0.03]"
            >
              <span>Explorar Demostración</span>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#050608] border-t border-white/[0.08] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/mimenu.svg" alt="MiMenu" className="h-6 w-6" />
            <span className="font-extrabold text-sm text-white">MiMenu Platform</span>
            <span className="text-slate-600">|</span>
            <span>Menú Digital Sin Comisión</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <Link to="/proposta" className="hover:text-amber-400 transition-colors">Propuesta Comercial</Link>
            <Link to="/contract-management" className="hover:text-amber-400 transition-colors">Contrato</Link>
            <Link to="/onboarding" className="hover:text-amber-400 transition-colors">Registro</Link>
            <Link to="/auth" className="hover:text-amber-400 transition-colors">Acceso al Panel</Link>
          </div>

          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} MiMenu. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingGenio;
