import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Smartphone,
  ShoppingCart,
  Star,
  Clock,
  TrendingUp,
  Languages,
  BarChart3,
  Calendar,
  Paintbrush,
  MessageCircle,
  Check,
  ChevronDown,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Escanea el código QR",
    description:
      "El cliente escanea el código QR en su mesa y accede al menú 4D en su smartphone.",
    icon: QrCode,
  },
  {
    number: "02",
    title: "Explora el menú 3D",
    description:
      "Visualiza los platos en realidad aumentada, revisa ingredientes y alérgenos, y ordena en segundos.",
    icon: Smartphone,
  },
  {
    number: "03",
    title: "Realiza el pedido",
    description:
      "Selecciona platos, personaliza y paga directamente desde la app. La orden llega en tiempo real a tu cocina.",
    icon: ShoppingCart,
  },
  {
    number: "04",
    title: "Deja una reseña",
    description:
      "El cliente califica su experiencia y deja feedback que te ayuda a mejorar.",
    icon: Star,
  },
];

const benefits = [
  {
    title: "Servicio más rápido",
    description:
      "Reduce tiempos de espera y atiende a más mesas con órdenes digitales.",
    icon: Clock,
  },
  {
    title: "Mayor ticket promedio",
    description:
      "Aumenta las ventas con sugerencias de maridaje y upselling inteligente.",
    icon: TrendingUp,
  },
  {
    title: "Actualizaciones en tiempo real",
    description:
      "Modifica precios, disponibilidad e ingredientes al instante sin imprimir menús.",
    icon: Smartphone,
  },
  {
    title: "Soporte multiidioma",
    description:
      "Tu menú se adapta al idioma del cliente: español, inglés, portugués y más.",
    icon: Languages,
  },
  {
    title: "Experiencia 4D de los platos",
    description:
      "Los clientes ven los platos en 3D y AR directamente en su mesa, aumentando la confianza y las conversiones.",
    icon: Smartphone,
  },
];

const features = [
  {
    title: "Analítica en tiempo real",
    description:
      "Dashboard completo con métricas de ventas, platos más pedidos y comportamiento del cliente.",
    icon: BarChart3,
  },
  {
    title: "Gestión de horarios",
    description:
      "Programa horarios de apertura, cierres y promociones automáticas por día y hora.",
    icon: Calendar,
  },
  {
    title: "Personalización de marca",
    description:
      "Adapta colores, logos y tipografía para que el menú refleje la identidad de tu restaurante.",
    icon: Paintbrush,
  },
  {
    title: "Gestión de reseñas",
    description:
      "Recopila y responde a las reseñas de tus clientes para mejorar tu servicio continuamente.",
    icon: MessageCircle,
  },
];

const faqs = [
  {
    question: "¿Necesito hardware adicional?",
    answer:
      "No. Solo necesitas un smartphone o tablet para que los clientes escaneen el código QR. Nada de tablets en cada mesa.",
  },
  {
    question: "¿Puedo modificar el menú cuando quiera?",
    answer:
      "Sí. Desde el panel de administración puedes cambiar precios, ingredientes y disponibilidad en tiempo real. Los cambios se reflejan al instante.",
  },
  {
    question: "¿Cómo funciona el pago?",
    answer:
      "Los clientes pagan directamente desde su smartphone mediante transferencia, tarjeta o efectivo. No manejamos comisiones por transacción.",
  },
  {
    question: "¿Es compatible con mi POS actual?",
    answer:
      "Sí. Integraciones disponibles con los POS más comunes del mercado. Contacta con nuestro equipo para verificar la tuya.",
  },
];

export default function Landing4DSmartMenu() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#14110F] text-[#EFE9E1] font-sans" style={{ background: 'oklch(0.16 0.02 260)', fontFamily: '"Bricolage Grotesque", "Figtree", system-ui, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-[#332C27]">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-[#D2521E]">4D</span>
            <span className="text-xl font-bold">Smart Menu</span>
          </div>
          <nav className="flex items-center space-x-6">
            <a
              href="#how-it-works"
              className="text-sm text-[#9A8F84] hover:text-[#EFE9E1] transition-colors"
            >
              Cómo funciona
            </a>
            <a
              href="#features"
              className="text-sm text-[#9A8F84] hover:text-[#EFE9E1] transition-colors"
            >
              Características
            </a>
            <a
              href="#faq"
              className="text-sm text-[#9A8F84] hover:text-[#EFE9E1] transition-colors"
            >
              Preguntas
            </a>
          </nav>
          <Button
            size="sm"
            className="bg-[#D2521E] text-[#EFE9E1] hover:bg-[#D2521E]/90 rounded-full shadow-[0_0_20px_hsla(210,75%,55%,0.4)]"
          >
            Comenzar
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1A1816] via-[#14110F] to-[#14110F]" />
        <div className="container mx-auto px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 border-[#332C27] bg-[#212426] text-[#D2521E">
              Menú 3D + Realidad Aumentada
            </Badge>
            <h1 className="font-display text-5xl font-bold tracking-tight text-[#EFE9E1] sm:text-6xl">
              El menú que <span className="text-[#D2521E]">aumenta tus ventas</span>
            </h1>
            <p className="mt-6 text-lg text-[#9A8F84]">
              Plataforma SaaS que transforma la experiencia de pedidos en tu
              restaurante con menús interactivos en 3D, realidad aumentada y
              pagos sin comisiones.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#D2521E] text-[#EFE9E1] hover:bg-[#D2521E]/90 rounded-full shadow-[0_0_25px_hsla(210,75%,55%,0.5)]"
              >
                Comenzar prueba gratis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#332C27] text-[#EFE9E1] hover:bg-[#212426] rounded-full"
              >
                Cómo funciona
              </Button>
            </div>
          </div>
        </div>

        {/* Hero image / 3D menu showcase */}
        <div className="container mx-auto px-6 pb-16">
          <div className="mx-auto max-w-4xl">
            <div className="relative aspect-video rounded-2xl bg-[#1A1816] border border-[#332C27] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110F] via-transparent to-transparent z-10" />
              <div className="relative z-0">
                {/* Simulated 3D menu on table */}
                <div className="relative w-80 h-48">
                  <div className="absolute inset-0 rounded-xl bg-[#212426] border border-[#332C27] shadow-xl transform perspective-1000 rotate-x-12">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-serif text-lg font-bold text-[#EFE9E1]">
                          Menú 4D
                        </h3>
                        <Badge className="border-[#332C27] bg-[#212426] text-[#D2521E]">
                          AR
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 bg-[#332C27] rounded-full" />
                        <div className="h-2 bg-[#332C27] rounded-full w-3/4" />
                        <div className="h-2 bg-[#332C27] rounded-full w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-[#9A8F84] mt-6">
              Platos en 3D sobre la mesa del cliente — experiencia inmersiva
              que aumenta la confianza y las conversiones.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-[#EFE9E1] sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-4 text-[#9A8F84]">
              Cuatro pasos simples para digitalizar tu restaurante
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#212426] border border-[#332C27]">
                  <span className="text-[#D2521E] font-bold text-lg">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#EFE9E1] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#9A8F84]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#1A1816]">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-[#EFE9E1] sm:text-4xl">
              Beneficios para tu negocio
            </h2>
            <p className="mt-4 text-[#9A8F84]">
              Lo que ganás al implementar 4D Smart Menu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-[#332C27] bg-[#212426] p-6 text-center transition-all duration-300"
              >
                <div className="mb-4 flex justify-center">
                  <benefit.icon className="h-8 w-8 text-[#D2521E]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#EFE9E1] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#9A8F84]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-[#EFE9E1] sm:text-4xl">
              Características
            </h2>
            <p className="mt-4 text-[#9A8F84]">
              Todo lo que necesitas para gestionar tu restaurante
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[#332C27] bg-[#212426] p-8 transition-all duration-300"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#D2521E]/10 border border-[#D2521E]/30">
                  <feature.icon className="h-6 w-6 text-[#D2521E]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#EFE9E1] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#9A8F84]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 border-t border-b border-[#332C27]">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            <div className="text-center">
              <div className="font-bold text-2xl text-[#EFE9E1]">0%</div>
              <p className="text-sm text-[#9A8F84]">Sin comisiones</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-[#EFE9E1]">15 días</div>
              <p className="text-sm text-[#9A8F84]">Prueba gratis</p>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-[#EFE9E1]">24/7</div>
              <p className="text-sm text-[#9A8F84]">Soporte en español</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-center text-3xl font-bold text-[#EFE9E1] sm:text-4xl mb-12">
              Preguntas frecuentes
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-[#332C27] bg-[#212426] overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-serif text-lg text-[#EFE9E1]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-[#9A8F84] transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-[#9A8F84]">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-[#EFE9E1] sm:text-4xl mb-4">
              Listo para transformar tu restaurante
            </h2>
            <p className="text-[#9A8F84] mb-8">
              Únete a más de 500 restaurantes que ya aumentaron sus ventas con
              4D Smart Menu.
            </p>
            <Button
              size="lg"
              className="bg-[#D2521E] text-[#EFE9E1] hover:bg-[#D2521E]/90 rounded-full shadow-[0_0_25px_hsla(210,75%,55%,0.5)]"
            >
              Comenzar prueba gratis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#332C27] py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl font-bold text-[#D2521E]">4D</span>
              <span className="text-lg font-bold">Smart Menu</span>
            </div>
            <p className="text-sm text-[#9A8F84]">
              4D Smart Menu - Menú digital con realidad aumentada para
              restaurantes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
