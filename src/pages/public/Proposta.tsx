import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Eye,
  Timer,
  Layout,
  MousePointerClick,
  BellRing,
  ShoppingBag,
  ChefHat,
  Receipt,
  RefreshCw,
  BarChart,
  ArrowRight,
} from "lucide-react";
import heroBeach from "/hero-beach.jpg";
import heroSign from "/hero-sign.jpg";

const Proposta = () => {
  useEffect(() => {
    document.title = "Proposta de Parceria | MiMenu";
  }, []);

  return (
    <div className="min-h-screen bg-[#F2EEE4]">
      <Header />

      <main>
        {/* Hero Section */}
        <header className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBeach})` }}
          />
          <div className="absolute inset-0 bg-black/70" />

          <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto py-12 sm:py-16">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <img
                src="/mimenu.svg"
                alt="MiMenu"
                className="h-24 sm:h-32 md:h-48 object-contain drop-shadow-lg"
              />
            </div>

            <p className="text-amber-300 tracking-[0.3em] text-xs sm:text-sm uppercase font-semibold mb-3 sm:mb-4 flex items-center justify-center">
              <span className="w-8 sm:w-12 h-px bg-amber-300 mr-2 sm:mr-4" />
              Proposta de Parceria
              <span className="w-8 sm:w-12 h-px bg-amber-300 ml-2 sm:ml-4" />
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-3 sm:mb-4 leading-tight font-display">
              A Nova Era da <br />
              <span className="italic font-normal">Experiência Premium</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 font-light mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Transformação Digital, Captação Ativa de Turistas e Automação de
              Atendimento de Alto Padrão.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/20">
              <span className="text-xs sm:text-sm text-gray-300">Apresentado por</span>
              <strong className="text-white tracking-wide text-sm sm:text-base">Hudson Argollo</strong>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24">
          {/* Visão Geral */}
          <section className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-4 sm:mb-6 leading-tight font-display">
                O Desafio do <br />
                <span className="text-[#BC6C25] italic">Turista Premium</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                O Pontal Carapitangui já possui o mais importante: um ambiente
                extraordinário e uma localização privilegiada. No entanto, o
                novo turista de alto padrão exige que a{" "}
                <strong>
                  experiência digital seja tão impecável quanto a experiência
                  física
                </strong>
                .
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Atualmente, Beach Clubs de alto nível enfrentam dois gargalos
                principais que impedem a maximização dos lucros:
              </p>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3 sm:mb-4">
                  <Eye className="text-amber-700 w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">A Batalha pela Atenção</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  O turista decide onde vai passar o dia antes mesmo de sair da
                  pousada. Se a presença online não for imponente nas buscas,
                  perde-se a reserva.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 sm:mb-4">
                  <Timer className="text-red-700 w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">A Fricção de Consumo</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  No pico do verão, a demora para chamar um garçom e pedir um
                  drink gera frustração e{" "}
                  <strong>inibe o consumo impulsivo</strong> (o cliente deixa de
                  pedir mais para não ter que esperar).
                </p>
              </div>
            </div>
          </section>

          {/* Image Break */}
          <section className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              src={heroSign}
              alt="Pontal Carapitangui Vibe"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
              <h3 className="text-3xl text-white font-bold italic font-display">
                A atmosfera perfeita merece uma operação sem atrito.
              </h3>
            </div>
          </section>

          {/* Pilar 1 */}
          <section className="border-t border-gray-300 pt-12 sm:pt-20">
            <div className="text-center mb-10 sm:mb-16">
              <span className="text-[#BC6C25] font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 block">
                Pilar 1
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 font-display">
                Captação Ativa & Autoridade
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 max-w-2xl mx-auto">
                Garantir que o Pontal Carapitangui domine as buscas e capture
                leads premium antes da concorrência local.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-12">
              <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                <Layout className="w-8 h-8 text-[#BC6C25] mb-4 sm:mb-5" />
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">
                  Website de Alta Conversão
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 sm:mb-6">
                  Desenvolvimento de uma plataforma web premium, focada em
                  transmitir luxo e gerar desejo imediato. Design imersivo
                  focado em usabilidade mobile e integração fluida.
                </p>
                <a
                  href="https://main.portalcarapitangui.pages.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs sm:text-sm font-bold text-gray-900 hover:text-[#BC6C25] transition-colors"
                >
                  Ver Esboço do Protótipo <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>

              <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                <MousePointerClick className="w-8 h-8 text-[#BC6C25] mb-4 sm:mb-5" />
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Estratégia Google Ads</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4">
                  <strong>Rede de Pesquisa:</strong> Quando o turista pesquisar
                  "o que fazer em Barra Grande" ou "Beach Club Maraú", o Pontal
                  Carapitangui será a primeira sugestão.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <strong>Lead Magnet:</strong> Criação de recompensa (ex:
                  Welcome Drink) para capturar o WhatsApp do turista para
                  campanhas diretas de relacionamento.
                </p>
              </div>
            </div>
          </section>

          {/* Pilar 2 */}
          <section className="bg-gradient-to-br from-[#1A2B2A] to-[#2A3B3A] rounded-[2.5rem] p-6 sm:p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <ShoppingBag className="w-96 h-96" />
            </div>

            <div className="relative z-10">
              <span className="text-[#D4A574] font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 block">
                Pilar 2
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-white mb-4 sm:mb-6 font-display font-bold drop-shadow-lg">
                Ecossistema Integrado de Beach Club
              </h2>
              <p className="text-gray-100 max-w-2xl text-sm sm:text-base md:text-lg mb-8 sm:mb-12 drop-shadow-md">
                O diferencial competitivo supremo. Um sistema exclusivo de
                autoatendimento via QR Code na mesa, conectando
                Cliente, Garçom, Cozinha e Caixa sem fricção.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="flex items-start">
                  <div className="bg-white/10 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                    <BellRing className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A574]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1 text-white drop-shadow-md">Chamada Inteligente</h4>
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                      O cliente clica no celular e chama o garçom exatamente
                      para a sua mesa, sem precisar acenar no sol.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/10 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                    <ShoppingBag className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A574]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1 text-white drop-shadow-md">
                      Pedido Autônomo & Upsell
                    </h4>
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                      Navegação por fotos e pedidos diretos. O sistema sugere
                      acompanhamentos automaticamente, elevando o ticket médio.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/10 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                    <ChefHat className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A574]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1 text-white drop-shadow-md">
                      Tracking em Tempo Real
                    </h4>
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                      Transparência total. O cliente acompanha:{" "}
                      <em>
                        "Recebido" → "Em Preparo" → "A caminho da mesa"
                      </em>
                      .
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/10 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                    <Receipt className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4A574]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1 text-white drop-shadow-md">Caixa Integrado</h4>
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                      Controle da comanda em tempo real pelo celular,
                      eliminando surpresas e filas na hora de ir embora.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cronograma & Investimento */}
          <section className="pt-8 sm:pt-10">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 font-display">
                Cronograma & Investimento
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
                Transparência, velocidade e alto retorno financeiro.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6 sm:gap-10">
              {/* Timeline */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 font-display">
                  Desenvolvimento
                </h3>

                <div className="relative pl-6 sm:pl-8 border-l-2 border-[#BC6C25] space-y-6 sm:space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[33px] sm:-left-[41px] bg-[#BC6C25] w-4 sm:w-5 h-4 sm:h-5 rounded-full border-4 border-[#F2EEE4]" />
                    <h4 className="font-bold text-sm sm:text-base text-gray-900">Semanas 1 a 2</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Desenvolvimento completo do Website Premium junto com a
                      construção e integração do Sistema de Autoatendimento.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[33px] sm:-left-[41px] bg-[#BC6C25] w-4 sm:w-5 h-4 sm:h-5 rounded-full border-4 border-[#F2EEE4]" />
                    <h4 className="font-bold text-sm sm:text-base text-gray-900">Semana 3</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Treinamento intensivo da equipe, refinamento de branding,
                      posicionamento e criação de materiais visuais para
                      campanhas.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[33px] sm:-left-[41px] bg-gray-300 w-4 sm:w-5 h-4 sm:h-5 rounded-full border-4 border-[#F2EEE4]" />
                    <h4 className="font-bold text-sm sm:text-base text-gray-900">Semana 4</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Foco total nas campanhas de tráfego pago (Ads) para ativar
                      a máquina de vendas e atrair turistas para a nova
                      plataforma.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl border border-[#BC6C25] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#BC6C25]" />

                  <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                    Setup & Implementação Total
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                    Website Premium + Ecossistema Completo de Atendimento.
                  </p>

                  <div className="flex items-end mb-4 sm:mb-6">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter">
                      R$ 1.500
                    </span>
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-semibold text-gray-700 text-xs sm:text-sm">
                        Ato da Assinatura
                      </span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">R$ 750</span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-semibold text-gray-700 text-xs sm:text-sm">
                        Entrega Final do Sistema
                      </span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">R$ 750</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                    <div className="flex items-start">
                      <RefreshCw className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                          Licenciamento & Manutenção
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          R$ 300 mensais{" "}
                          <span className="text-[#BC6C25] font-semibold">
                            (1º mês de isenção)
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <BarChart className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                          Orçamento de Mídia (Google Ads)
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Flexível. Definido 100% pelo clube e investido direto
                          na plataforma.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-[#1A2B2A] to-[#2A3B3A] rounded-3xl p-6 sm:p-12 md:p-16 text-white text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 font-display text-white drop-shadow-lg">
              Prontos para transformar a experiência?
            </h2>
            <p className="text-gray-100 mb-6 sm:mb-10 max-w-2xl mx-auto text-sm sm:text-base md:text-lg drop-shadow-md">
              O aumento no ticket médio gerado pelo autoatendimento e a captação
              através do novo site pagam este investimento em semanas, não meses.
            </p>
            <a
              href="https://wa.me/5573988083318?text=Olá%20Hudson%2C%20gostaria%20de%20conversar%20sobre%20a%20proposta%20para%20o%20Pontal%20Carapitangui"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-[#D4A574] hover:bg-[#C49560] text-[#1A2B2A] font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors text-sm sm:text-base md:text-lg shadow-lg"
            >
              Aprovar Proposta e Iniciar Projeto
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Proposta;
