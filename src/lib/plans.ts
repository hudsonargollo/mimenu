/**
 * MiMenu plans.
 *
 * Tier 1 (Basic) deliberately ships WITHOUT the AI concierge and AI analytics
 * on the dynamic menu — those are the differentiators of Tier 2 and 3.
 * Tier 4 is a high-ticket custom build (setup fee + monthly) for high-end
 * restaurants that want a complete system built end to end.
 */
export type PlanId = 'basic' | 'pro' | 'premium' | 'custom';

export type BillingCycle = 'monthly' | 'yearly';

export interface PlanFeature {
  label: string;
  /** Rendered in bold when true (the "everything in the previous tier" rows). */
  highlight?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  audience: string;
  /** Price in Bs. per month. Null for custom (quoted). */
  monthly: number | null;
  /** Yearly-billed monthly equivalent, when a discount applies. */
  yearlyMonthly?: number;
  /** One-off setup fee in Bs. (Tier 4 only today.) */
  setupFee: number | null;
  badge?: string;
  features: PlanFeature[];
  /** Capabilities used to gate features in the product, not just marketing. */
  capabilities: PlanCapabilities;
  /** True when onboarding should collect premium landing assets for this tier. */
  collectsLandingAssets: boolean;
  ctaLabel: string;
}

export interface PlanCapabilities {
  aiConcierge: boolean;
  aiAnalytics: boolean;
  customWebsite: boolean;
  crm: boolean;
  kds: boolean;
  multiBranch: boolean;
  posIntegration: boolean;
  flipDeck: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    tagline: 'Menú Digital QR',
    audience: 'Cafeterías, pastelerías y locales que quieren digitalizar su carta.',
    monthly: 180,
    yearlyMonthly: 150,
    setupFee: null,
    features: [
      { label: 'Menú digital ultra rápido (PWA)' },
      { label: 'Códigos QR ilimitados con logo' },
      { label: 'Cazador de reseñas de Google Maps' },
      { label: 'Fotos sugeridas automáticamente' },
      { label: '0% comisión por venta' },
    ],
    capabilities: {
      aiConcierge: false,
      aiAnalytics: false,
      customWebsite: false,
      crm: false,
      kds: false,
      multiBranch: false,
      posIntegration: false,
      flipDeck: false,
    },
    collectsLandingAssets: false,
    ctaLabel: 'Comenzar con Básico',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Gastronomic OS',
    audience: 'Restaurantes, bares, cervecerías y gastro-pubs en crecimiento.',
    monthly: 340,
    yearlyMonthly: 290,
    setupFee: null,
    badge: 'MÁS ELEGIDO POR RESTAURANTES',
    features: [
      { label: 'Todo lo incluido en Básico', highlight: true },
      { label: 'Copiloto IA por WhatsApp (concurseur)', highlight: true },
      { label: 'Analítica IA en el menú dinámico', highlight: true },
      { label: 'Carrito Express y maridajes (+24%)' },
      { label: 'Pedidos por mesa con QR dinámico' },
      { label: 'Pantalla KDS de cocina y barra' },
      { label: 'CRM de clientes y fidelización' },
    ],
    capabilities: {
      aiConcierge: true,
      aiAnalytics: true,
      customWebsite: false,
      crm: true,
      kds: true,
      multiBranch: false,
      posIntegration: false,
      flipDeck: false,
    },
    collectsLandingAssets: true,
    ctaLabel: 'Probar 14 días gratis',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Web + CRM a medida',
    audience: 'Restaurantes de alta gama que quieren presencia completa.',
    monthly: 680,
    yearlyMonthly: 590,
    setupFee: null,
    features: [
      { label: 'Todo lo incluido en Pro', highlight: true },
      { label: 'Sitio web premium de una página diseñado a medida', highlight: true },
      { label: 'CRM completo con segmentación y campañas', highlight: true },
      { label: 'Menú fotografiado y redactado por nuestro equipo' },
      { label: 'Onboarding guiado y carga de carta incluida' },
    ],
    capabilities: {
      aiConcierge: true,
      aiAnalytics: true,
      customWebsite: true,
      crm: true,
      kds: true,
      multiBranch: false,
      posIntegration: false,
      flipDeck: false,
    },
    collectsLandingAssets: true,
    ctaLabel: 'Hablar con un asesor',
  },
  {
    id: 'custom',
    name: 'Custom',
    tagline: 'Sistema completo, de punta a punta',
    audience: 'Hoteles, casino-restaurantes y grupos que necesitan un sistema propio.',
    monthly: null,
    setupFee: null,
    badge: 'HIGH TICKET · SETUP + MENSUALIDAD',
    features: [
      { label: 'Todo lo incluido en Premium', highlight: true },
      { label: 'Sistema construido a medida, de punta a punta', highlight: true },
      { label: 'Integración con POS, impresoras térmicas y sistemas propios' },
      { label: 'Multi-sucursal con gestión centralizada' },
      { label: 'API y webhooks para tus sistemas' },
      { label: 'Soporte prioritario con SLA y onboarding presencial' },
      { label: 'Setup fee + mensualidad (a cotizar)' },
    ],
    capabilities: {
      aiConcierge: true,
      aiAnalytics: true,
      customWebsite: true,
      crm: true,
      kds: true,
      multiBranch: true,
      posIntegration: true,
      flipDeck: true,
    },
    collectsLandingAssets: true,
    ctaLabel: 'Pedir propuesta a medida',
  },
];

export function getPlan(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function planPriceLabel(plan: Plan, cycle: BillingCycle): string {
  if (plan.monthly === null) return 'A cotizar';
  const value = cycle === 'yearly' ? plan.yearlyMonthly ?? plan.monthly : plan.monthly;
  return `Bs. ${value}`;
}

/** Whether a plan unlocks a capability — single source of truth for gating. */
export function planHas(plan: Plan | undefined, key: keyof PlanCapabilities): boolean {
  return !!plan?.capabilities[key];
}

/**
 * Onboarding asset checklist per tier. Tiers 2+ collect what a premium
 * one-page landing needs; Tier 1 keeps the flow short.
 */
export interface OnboardingAssets {
  logo: boolean;
  featuredPhotos: boolean;
  whatsapp: boolean;
  instagram: boolean;
  openingHours: boolean;
  menuFiles: boolean;
  drinksMenu: boolean;
  address: boolean;
}

export function requiredAssetsFor(plan: Plan | undefined): OnboardingAssets {
  const premium = !!plan?.collectsLandingAssets;
  return {
    logo: true,
    whatsapp: true,
    openingHours: true,
    address: true,
    menuFiles: true,
    drinksMenu: false, // suggested, never mandatory
    featuredPhotos: premium,
    instagram: premium,
  };
}
