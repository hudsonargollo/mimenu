import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const sections = [
  { h: "Overview", body: "MiMenu is a multi-tenant SaaS platform for digital menus, QR code ordering, kitchen display systems (KDS), and delivery management. Self-hosted, 0% transaction fees — fixed monthly subscription only." },
  { h: "Architecture", body: "Frontend: Vite + React 18 + TypeScript + Tailwind + Radix. State: React Context (MimenuProvider, CartProvider, AuthProvider). Backend: Cloudflare Pages + Workers Functions. Storage: Cloudflare KV. AR/3D: TRELLIS.2 / Meshy.ai. Payments: MercadoPago (Pix + Card). WhatsApp: Evolution API." },
  { h: "Multitenancy", body: "Venue registry (src/lib/venueRegistry.ts) resolves a tenant by slug from provisioned_venues.json. URL slug (?v=<slug>) or QR hash; falls back to default venue (demo). RESERVED_SLUGS protects app routes. Each venue carries its own menu categories, tables, currency, theme, address and WhatsApp. Jaleo is the first customer tenant; demo (Moe's Taberna) is the default venue." },
  { h: "Core Features", body: "1) QR Smart Menu — ultra-fast PWA menu, unlimited QR codes with logo, AI analytics on dynamic menu (hotness scoring, velocity_24h 70% / baseline_14d 30%), upsell maridajes (+24%), KDS screen. 2) WhatsApp AI Concierge — automated ordering, CRM & loyalty. 3) Premium — AR menu items (3D), custom website, multi-branch, POS integration, full CRM with segmentation." },
  { h: "Plans", body: "Basic (Bs.180/mo): QR menu, 0% commission. Pro (Bs.340/mo): + AI concierge WhatsApp + AI analytics + KDS + CRM. Premium (Bs.680/mo): + custom website + photographed menu + guided onboarding. Custom: quoted, multi-branch + POS + API/webhooks + SLA support. Yearly billing discount available." },
  { h: "Modules / Routes", body: "/ (QR menu), /admin, /kitchen, /cashier, /waiter, /admin/settings, /orders, /admin/analytics, /admin/products, /admin/tables, /admin/reviews, /whatsapp-admin, /customers, /reports, /monitoring." },
  { h: "API Endpoints", body: "AR: POST /api/ar/generate, GET /api/ar/status/{taskId}, GET /api/ar/menu-items. WhatsApp: POST /api/whatsapp/webhook, GET /api/whatsapp/connection, POST /api/whatsapp/send-message. Payments: POST /api/mercadopago/create-payment, create-card-payment, webhook. Waiters (Supabase): create/list/update/delete + password reset." },
  { h: "Data Models", body: "MenuItemDetail (id, name, price, category, availability, image, hotness_score, velocity_24h, baseline_14d, dietary, allergens, tags, reviews). MimenuOrder (id, order_number, venue_id, fulfillment_type, items, subtotal, discount, total, status, payment_method, payment_status). CustomerProfile (id, name, phone, total_orders, total_spent, loyalty_tier Bronce/Plata/Oro/VIP, favorite_items)." },
  { h: "Translation", body: "Multi-language via src/i18n/translations.ts: es (default), en, pt. Language toggle in header." },
  { h: "Deployment", body: "npm run build (vite build + cpx _redirects/_routes.json into dist). Deploy: npx wrangler pages deploy dist --project-name=mimenu --branch=main --commit-dirty=true. Production serves main; Preview = feature branches." },
  { h: "Known Issues", body: "WhatsApp notification queue disabled (Supabase not integrated). AR generation requires public image URLs. TRELLIS.2 GPU quota (~2.5 min/day free HF) blocks AR generation debugging; needs PRO or dedicated GPU box." },
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="mt-6 text-4xl font-bold">Documentación del sistema MiMenu</h1>
        <p className="mt-2 text-muted-foreground">Arquitectura, multitenancy, features, planes y operación.</p>
        <Badge className="mt-4">v1.0</Badge>
        <div className="mt-10 space-y-6">
          {sections.map((s) => (
            <Card key={s.h} className="p-6">
              <h2 className="text-xl font-semibold">{s.h}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
