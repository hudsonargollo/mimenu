import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, QrCode, BarChart3, Bot, MessageCircle, Boxes, Star, Check, Zap, ShieldCheck } from "lucide-react";

const tiers = [
  { name: "Básico", price: "Bs. 180", tag: "Menú Digital QR", features: ["Menú digital ultra rápido (PWA)", "Códigos QR ilimitados con logo", "0% comisión por venta"] },
  { name: "Pro", price: "Bs. 340", tag: "Gastronomic OS", features: ["Todo Básico + Copiloto IA por WhatsApp", "Analítica IA en el menú dinámico", "Pantalla KDS cocina y barra", "CRM de clientes y fidelización"] },
  { name: "Premium", price: "Bs. 680", tag: "Web + CRM a medida", features: ["Todo Pro + sitio premium a medida", "Menú fotografiado y redactado por nuestro equipo", "Onboarding guiado incluido"] },
];

export default function LandingPlataforma() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <Badge className="mb-4">0% de comisión por venta</Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Deja de pagar comisiones altas a PedidosYa y plataformas similares
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          MiMenu es tu propio sistema: Menú QR Inteligente con analítica y asistente IA, concierge por WhatsApp y, en planes superiores, ítems del menú en Realidad Aumentada. Un solo sistema, costo fijo mensual, sin porcentaje por pedido.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Comenzar ahora <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/mi-menu-ar">Ver demo AR</Link>
          </Button>
        </div>
      </section>

      {/* Core features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">Funciones clave</h2>
        <p className="mt-2 text-center text-muted-foreground">Lo que realmente mueve tu negocio</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <QrCode className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Menú QR Inteligente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Menú digital ultra rápido (PWA) con códigos QR ilimitados. Analítica IA en el menú dinámico: platos más vistos, más vendidos y recomendaciones automáticas.
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Fotos sugeridas automáticamente</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Maridajes y upsell (+24%)</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Pantalla KDS cocina y barra</li>
            </ul>
          </Card>
          <Card className="p-6">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Concierge por WhatsApp con IA</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu asistente virtual atiende pedidos, resuelve dudas y envía el menú directamente por WhatsApp. Sin intermediarios, sin comisiones.
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Toma de pedidos automatizada</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> CRM de clientes y fidelización</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Notificaciones en tiempo real</li>
            </ul>
          </Card>
          <Card className="p-6">
            <Boxes className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Capacidades Premium (planes superiores)</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              En planes Premium y Custom: ítems del menú en Realidad Aumentada, sitio web premium a medida, multi-sucursal y integración con POS.
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Menú AR (ver platos en 3D)</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> CRM completo con segmentación</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Multi-sucursal y API/webhooks</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/40 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Por qué MiMenu</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "0% comisión", desc: "Costo fijo mensual, sin porcentaje por pedido." },
              { icon: BarChart3, title: "Datos propios", desc: "Analítica y CRM de tus clientes, no de la plataforma." },
              { icon: ShieldCheck, title: "Datos tuyos", desc: "Tu menú, tus clientes, tu marca. Sin intermediarios." },
              { icon: Star, title: "Soporte humano", desc: "Equipo real 7 días a la semana." },
            ].map((b) => (
              <div key={b.title} className="text-center">
                <b.icon className="mx-auto h-8 w-8 text-primary" />
                <h4 className="mt-3 font-semibold">{b.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">Planes</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <Card key={t.name} className="p-6">
              <h3 className="text-xl font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.tag}</p>
              <p className="mt-4 text-3xl font-bold">{t.price}<span className="text-base font-normal text-muted-foreground">/mes</span></p>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link to="/auth">Elegir {t.name}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">¿Listo para dejar las comisiones atrás?</h2>
        <p className="mt-2 text-muted-foreground">Empieza hoy. Sin fidelidad, cancela cuando quieras.</p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/auth">Crear mi menú <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </section>
    </div>
  );
}
