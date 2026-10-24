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
  const [storeSlug, setStoreSlug] = useState<string>("sua-hamburgueria");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [nightModeComparison, setNightModeComparison] = useState<'manual' | 'mimenu'>('mimenu');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    document.title = "MiMenu | Cardápio Digital Sem Comissão para Restaurantes e Delivery";
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

  // 6 Hubs of the operation (O Raio-X da Operação)
  const operationHubs = [
    {
      id: "cardapio",
      title: "Cardápio Inteligente",
      badge: "Vendas Diretas",
      icon: Flame,
      summary: "Categorias, fotos em alta velocidade, complementos obrigatórios e controle de itens esgotados sem sair da lista.",
      points: [
        "Fotos leves com cache otimizado para 3G",
        "Seleção de ponto da carne e adicionais obrigatórios",
        "Observação por item direto no lanche certo",
        "Preço riscado com destaque visual para promoções"
      ]
    },
    {
      id: "cozinha",
      title: "KDS Cozinha & Barra",
      badge: "Produção sem Papel",
      icon: ChefHat,
      summary: "Painel do preparo em tela cheia com tempos de cocção, alertas sonoros e impressão automática para impressoras térmicas.",
      points: [
        "Tela interativa para chapa, cozinha e montagem",
        "Alertas por tempo de espera e fila de pedidos",
        "Impressão automática direta via rede ou USB",
        "Mudança de status com 1 toque na tela"
      ]
    },
    {
      id: "delivery",
      title: "Delivery & Mesa",
      badge: "Despacho Ágil",
      icon: Bike,
      summary: "Taxa de entrega calculada por bairro, controle de motoboy e QR Code comanda para mesas com 0% de comissão.",
      points: [
        "Taxa de frete configurável por região ou km",
        "Comanda expressa na mesa com QR Code único",
        "Despacho rápido com dados completos do cliente",
        "Link único para Bio do Instagram e WhatsApp"
      ]
    },
    {
      id: "balcao",
      title: "Balcão & Caixa",
      badge: "Ponto de Venda",
      icon: Store,
      summary: "Lançamento manual ultrarrápido para pedidos de balcão, retiradas no local ou clientes que ligam diretamente.",
      points: [
        "Lançamento em menos de 10 segundos no balcão",
        "Identificação rápida de clientes cadastrados",
        "Fechamento de caixa unificado no fim da noite",
        "Controle de troco e formas de pagamento mistas"
      ]
    },
    {
      id: "pagamentos",
      title: "Pagamentos Integrados",
      badge: "Recebimento Direto",
      icon: ReceiptText,
      summary: "Pix automático com confirmação instantânea, QR Simple, cartão e dinheiro com troco calculado.",
      points: [
        "Pix automático com liberação imediata do pedido",
        "Pagamento online por cartão de crédito e débito",
        "Opção de pagamento na entrega (maquininha/dinheiro)",
        "O dinheiro cai direto na sua conta bancária"
      ]
    },
    {
      id: "gestao",
      title: "Gestão & CRM",
      badge: "Base 100% Sua",
      icon: TrendingUp,
      summary: "Faturamento diário, ticket médio, horários de pico e histórico de consumo para você fidelizar sem intermediários.",
      points: [
        "Histórico completo de clientes com endereço e telefone",
        "Relatório dos pratos e bebidas mais vendidos",
        "Exportação de dados a qualquer momento",
        "Recuperação de clientes inativos com 1 clique"
      ]
    }
  ];

  // Pricing Plans (Adapted from Cardápio Gênio)
  const plans = [
    {
      name: "Start",
      description: "Para quem está começando a vender online ou quer digitalizar a operação.",
      priceMonthly: "69,90",
      priceYearly: "799,90",
      featured: false,
      features: [
        "Cardápio digital ilimitado com fotos",
        "Pedidos direto no link e WhatsApp",
        "Gestão de pedidos e painel de controle",
        "Painel KDS de Cozinha em tela cheia",
        "Controle de formas de pagamento e Pix",
        "0% de comissão sobre suas vendas",
        "Suporte direto no WhatsApp"
      ]
    },
    {
      name: "Pro",
      description: "Operação completa com automações de entrega, relatórios e controle total.",
      priceMonthly: "129,90",
      priceYearly: "1.449,90",
      featured: true,
      badge: "MAIS ESCOLHIDO",
      features: [
        "Tudo o que está incluído no Start",
        "Copiloto IA para gestão por WhatsApp",
        "Notificações automáticas de status no WhatsApp",
        "Cálculo inteligente de taxas por bairro",
        "Sugeridor de maridagem e upsell automático (+22%)",
        "Relatórios de faturamento, pico e ticket médio",
        "CRM de clientes e fidelização ativa",
        "Impressão automática em impressora térmica"
      ]
    },
    {
      name: "Multi-Loja",
      description: "Para redes gastronômicas, franquias e grupos com múltiplas unidades.",
      priceMonthly: "249,90",
      priceYearly: "2.790,00",
      featured: false,
      features: [
        "Tudo o que está incluído no plano Pro",
        "Múltiplas lojas centralizadas em uma conta",
        "Cardápios e preços individualizados por filial",
        "Integração avançada com ERPs e POS",
        "Gerente de conta dedicado e onboarding guiado"
      ]
    }
  ];

  // Direct, no-fluff FAQs
  const faqs = [
    {
      q: "Vou pagar uma fatia ou porcentagem de cada pedido?",
      a: "Não. A mensalidade é fixa. Um mês com recorde de vendas não sai mais caro que um mês fraco. 100% do valor pago pelo cliente entra limpo para você, sem qualquer taxa por pedido."
    },
    {
      q: "O cliente vai ser meu ou da plataforma?",
      a: "100% seu. O telefone, o endereço, o histórico de pedidos e as preferências ficam gravados na sua própria base de dados, e você pode exportar quando quiser. Não vendemos o seu cliente para a concorrência."
    },
    {
      q: "Vou ficar preso em algum contrato com multa?",
      a: "Não há fidelidade nem multa de cancelamento. Você paga o mês e continua enquanto a plataforma gerar lucro para o seu negócio. Se decidir pausar, o cardápio é desativado e seus dados continuam seus."
    },
    {
      q: "Não tenho tempo nem paciência para cadastrar produtos e configurar.",
      a: "Você não precisa fazer sozinho. Basta enviar uma foto do seu cardápio físico ou planilha que nossa inteligência e equipe cadastram as categorias, fotos e complementos com você antes da inauguração."
    },
    {
      q: "E se surgir alguma dúvida ou problema durante o movimento da noite?",
      a: "Nosso suporte atende direto no WhatsApp com atendimento humanizado e rápido, além do Copiloto IA que resolve alterações de preço ou pausa de produtos em segundos."
    },
    {
      q: "Meus clientes precisam baixar algum aplicativo?",
      a: "Nenhum download é necessário. O cliente clica no seu link da bio do Instagram ou escaneia o QR Code na mesa e o cardápio abre em menos de 1 segundo direto no navegador do celular."
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
        <span><strong>Cardápio Digital Sem Comissão:</strong> Venda no seu link próprio e fique com 100% do lucro.</span>
        <span className="hidden md:inline text-amber-400/60">| Sem fidelidade e sem taxa de adesão.</span>
      </div>

      {/* Sticky Main Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#07080B]/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/mimenu-square.svg" alt="MiMenu" className="h-10 w-10 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">MiMenu</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.2 rounded-full border border-amber-500/30">
                  0% Comissão
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5">Sistema Operacional Gastronômico</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#como-funciona" className="hover:text-amber-400 transition-colors">Como Funciona</a>
            <a href="#operacao" className="hover:text-amber-400 transition-colors">Raio-X da Operação</a>
            <a href="#comparativo" className="hover:text-amber-400 transition-colors">A Mesma Noite</a>
            <a href="#calculadora" className="hover:text-amber-400 transition-colors">Economia Real</a>
            <a href="#planos" className="hover:text-amber-400 transition-colors">Planos & Preços</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">Dúvidas Frequentes</a>
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
              <span>Ver Cardápio Demo</span>
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/onboarding')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs px-4 rounded-xl h-9 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Criar Minha Loja</span>
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
                <span>Cardápio Digital Direto Sem Intermediários</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Venda no seu link próprio e <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  fique com 100% do valor
                </span> <br />
                de cada pedido.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                O cliente abre o seu cardápio, monta o pedido e envia. Cai no seu painel completo: <strong>item, observação, endereço, mesa e forma de pagamento</strong>. Você paga uma mensalidade fixa, e nada mais.
              </p>

              {/* Trust Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sem comissão por venda</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No ar hoje no seu link</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sem contrato de fidelidade</span>
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
                  <span>Criar Meu Cardápio Agora</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/menu')}
                  className="w-full sm:w-auto border-white/15 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm px-6 py-6 rounded-2xl transition-all"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2 text-amber-400" aria-hidden="true" />
                  <span>Testar Cardápio Ao Vivo</span>
                </Button>
              </div>

            </div>

            {/* Right: Interactive Store Link & Live Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Interactive Store URL Bar */}
              <div className="rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] p-5 shadow-2xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  O endereço da sua loja fica assim:
                </span>
                
                <div className="flex items-center gap-2 bg-[#0B0C12] border border-white/[0.12] rounded-2xl p-2.5 text-xs">
                  <div className="text-slate-400 font-mono text-[11px] truncate select-all pl-2">
                    mimenu.clubemkt.digital/loja/
                  </div>
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="sua-loja"
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
                  <span>Link fixo e permanente para Instagram, TikTok e QR Code</span>
                  <span className="text-emerald-400 font-bold">100% Online</span>
                </div>
              </div>

              {/* Live Order Ticket Simulation */}
              <div className="rounded-3xl bg-[#0D0E15] border border-white/[0.08] p-5 space-y-3 shadow-xl">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">Pedido #128 · Delivery Direto</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    RECEBIDO NO PAINEL
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white">2x Burger Artesanal Smash Duplo</div>
                      <div className="text-[11px] text-amber-300">Obs: 1x Sem cebola, 1x Ponto bem passado</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">+ Borda Recheada Cheddar & Bacon (+12 R$)</div>
                    </div>
                    <span className="font-black text-white">R$ 86,00</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">1x Porção de Fritas Rústicas + Coca Zero</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Maridagem aceita pelo cliente</div>
                    </div>
                    <span className="font-black text-white">R$ 28,00</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total do Pedido</span>
                    <span className="text-base font-black text-white">R$ 114,00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 text-[11px] font-bold block">0% Retido (R$ 0 de comissão)</span>
                    <span className="text-slate-400 text-[10px]">R$ 114,00 direto na sua conta</span>
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
              Contraste Operacional
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              A mesma noite de movimento, dos dois jeitos.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Veja a diferença entre operar no improviso de cadernos e mensagens soltas versus ter um sistema direto e automatizado.
            </p>

            {/* Mobile Switcher Toggle */}
            <div className="inline-flex lg:hidden items-center bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08] mt-2">
              <button
                onClick={() => setNightModeComparison('manual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  nightModeComparison === 'manual' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'
                }`}
              >
                No Caderno & WhatsApp
              </button>
              <button
                onClick={() => setNightModeComparison('mimenu')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  nightModeComparison === 'mimenu' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
                }`}
              >
                Com o MiMenu
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
                    <h3 className="font-black text-lg text-white">No Caderno e no WhatsApp Manual</h3>
                    <p className="text-xs text-rose-300/80 font-semibold">Gargalo, estresse e pedidos errados</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>Alguém anota o pedido no balcão enquanto outro cuida da chapa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>“Era sem cebola?” e ninguém tem certeza porque a letra ficou ilegível.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>Taxa de entrega calculada de cabeça no susto, bairro a bairro.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>No fim do mês, ninguém sabe com precisão qual item deu mais lucro.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                  <span>O caderno some e o histórico do cliente vai embora junto.</span>
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
                    <h3 className="font-black text-lg text-white">Com o MiMenu Gastronomic OS</h3>
                    <p className="text-xs text-emerald-300 font-semibold">Fluidez total, 0% comissão e comanda limpa</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>O cliente monta o pedido sozinho no link direto, sem instalar app.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>A observação chega impressa e no KDS no item exato, sem engano.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>O frete sai calculado automaticamente na hora conforme o bairro.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>O relatório diz com exatidão o prato, o horário e o bairro que mais vendem.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  <span>O histórico fica na sua base e o cliente repete o pedido em um toque.</span>
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
              Visão Completa
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              O raio-X da sua operação em uma única tela.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Do link que o cliente abre até o fechamento de caixa no final da noite. Seis lugares onde o pedido passa, todos conectados sem trocar de aba.
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
                    <span>Módulo Ativo</span>
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
                Engenharia de Cardápio
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Um cardápio que trabalha ativamente pela venda.
              </h2>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                O que aparece na tela do cliente decide o tamanho da conta. Criamos gatilhos que aumentam o ticket médio sem que sua equipe precise lembrar de oferecer.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <h4 className="font-bold text-sm text-white">Fotos em Alta Velocidade com Cache</h4>
                  <p className="text-xs text-slate-400">As imagens carregam otimizadas e abrem instantaneamente mesmo no 3G da calçada.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <h4 className="font-bold text-sm text-white">Promoção com Preço Riscado</h4>
                  <p className="text-xs text-slate-400">O valor antigo aparece ao lado do novo, transformando o desconto em argumento de compra.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <h4 className="font-bold text-sm text-white">Adicionais e Maridagem no Caminho (+22%)</h4>
                  <p className="text-xs text-slate-400">Borda recheada, bebida e porções extras são oferecidas no momento exato de fechar o pedido.</p>
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
                      <h4 className="font-bold text-sm text-white">Avisos Automáticos de Status</h4>
                      <p className="text-[11px] text-emerald-400 font-semibold">WhatsApp da sua Loja</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Sem intervenção humana
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Quando você aceita, quando entra em preparo e quando sai para entrega, o aviso vai sozinho para o WhatsApp do cliente. É o recado que sua equipe manda na mão no meio do corre só que automático.
                </p>

                {/* Simulated WhatsApp Bubbles */}
                <div className="space-y-3 bg-[#07080B] p-4 rounded-2xl border border-white/[0.06]">
                  <div className="bg-[#005c4b] text-white p-3 rounded-xl text-xs max-w-[85%] space-y-1">
                    <p className="font-bold text-[11px] text-emerald-200">Pedido #128 Confirmado 🍕</p>
                    <p>Olá Lucas! Seu pedido já entrou em preparo na cozinha. Tempo estimado: 35 min.</p>
                    <span className="text-[9px] text-emerald-200 block text-right">20:14 ✓✓</span>
                  </div>

                  <div className="bg-[#005c4b] text-white p-3 rounded-xl text-xs max-w-[85%] space-y-1">
                    <p className="font-bold text-[11px] text-emerald-200">Saiu para Entrega 🛵</p>
                    <p>Seu pedido está a caminho com o entregador João. Bom apetite!</p>
                    <span className="text-[9px] text-emerald-200 block text-right">20:41 ✓✓</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>O número é o da sua loja e a conversa continua sendo 100% sua.</span>
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
              Calculadora de Economia Real
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Quanto você deixa de perder em comissões todo mês?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Arraste os controles para simular o volume do seu restaurante e veja a receita que volta diretamente para o seu bolso.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-[36px] p-8 sm:p-12 shadow-2xl">
            
            {/* Sliders on Left */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Slider 1: Orders */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-300">Pedidos mensais estimados:</span>
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
                  <span className="text-slate-300">Ticket médio por pedido:</span>
                  <span className="text-amber-400 font-black text-lg">R$ {averageTicket},00</span>
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
                  <span>R$ 20</span>
                  <span>R$ 100</span>
                  <span>R$ 200+</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mensalidade Fixa, Sem Surpresas
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Vender mais não aumenta o que você paga. Todo o faturamento adicional é 100% seu.
                </p>
              </div>

            </div>

            {/* Calculated Values on Right */}
            <div className="lg:col-span-6 space-y-4 bg-[#0E1017] p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl">
              
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Retorno Mensual Estimado</span>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  R$ {totalMonthlyGain.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ mês</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs">
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Comissões que você deixa de pagar (23%):</span>
                  <span className="font-bold text-emerald-400">+R$ {thirdPartyCommissionsLost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Receita extra por maridagem & upsell (+22%):</span>
                  <span className="font-bold text-amber-400">+R$ {upsellGain.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center text-sm font-bold">
                  <span className="text-white">Impacto Anual no seu Negócio:</span>
                  <span className="text-amber-400 font-black text-base">R$ {(totalMonthlyGain * 12).toLocaleString()}</span>
                </div>

              </div>

              <Button
                onClick={() => navigate('/onboarding')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs py-5 rounded-xl shadow-lg shadow-amber-500/20"
              >
                Garantir Minha Loja Sem Comissão
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
              Mensalidade Fixa
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Sem taxa de instalação. Sem comissão. Sem fidelidade.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Vender mais num mês não aumenta o que você paga. O que você fatura é totalmente seu.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  DESCONTO ESPECIAL
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
                    <span className="text-xs text-slate-400">R$</span>
                    <span className={`text-4xl font-black ${p.featured ? 'text-amber-400' : 'text-white'}`}>
                      {billingCycle === 'monthly' ? p.priceMonthly : p.priceYearly}
                    </span>
                    <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
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
                  Quero Este Plano
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
              As perguntas que você faria antes de assinar.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">Respostas diretas e transparentes, sem letras miúdas.</p>
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
            Seu Cardápio no Ar Esta Semana
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Pronto para parar de deixar 23% do seu faturamento em comissões?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Mande uma mensagem, conte o que você vende e montamos o cardápio com você hoje mesmo.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Criar Meu Cardápio Agora</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto border-white/15 hover:border-white/30 text-white font-semibold text-sm px-7 py-6 rounded-2xl bg-white/[0.03]"
            >
              <span>Explorar Demonstração</span>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#050608] border-t border-white/[0.08] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/mimenu-square.svg" alt="MiMenu" className="h-6 w-6" />
            <span className="font-extrabold text-sm text-white">MiMenu Platform</span>
            <span className="text-slate-600">|</span>
            <span>Cardápio Digital Sem Comissão</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <Link to="/proposta" className="hover:text-amber-400 transition-colors">Proposta Comercial</Link>
            <Link to="/contract-management" className="hover:text-amber-400 transition-colors">Contrato</Link>
            <Link to="/onboarding" className="hover:text-amber-400 transition-colors">Registro</Link>
            <Link to="/auth" className="hover:text-amber-400 transition-colors">Acesso ao Painel</Link>
          </div>

          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} MiMenu. Todos os direitos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingGenio;
